import crypto from 'crypto';

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

// This data
const config = {
  "sourceUrl": `${process.env.KEYCLOAK || 'http://localhost:8090'}/realms/empire/.well-known/openid-configuration`,
  "targetUrl": `${process.env.SRV ||'http://localhost:5984'}/_node/nonode@nohost/_config/jwt_keys`,
  "adminCredentials": {
    "username": COUCHDB_USER || "admin",
    "password":  process.env.COUCHDB_PASSWORD ||"password"
  }
};

/**
 * Converts RSA JWK to proper PEM format using Node.js crypto
 */
const rsaJwkToPem = (n, e) => {
  try {
    // Create RSA public key from JWK components
    const keyObject = crypto.createPublicKey({
      key: {
        kty: 'RSA',
        n: n,
        e: e
      },
      format: 'jwk'
    });

    // Export as PEM
    return keyObject.export({
      type: 'spki',
      format: 'pem'
    });
  } catch (error) {
    throw new Error(`Failed to convert RSA JWK to PEM: ${error.message}`);
  }
};

/**
 * Converts EC JWK to proper PEM format using Node.js crypto
 */
const ecJwkToPem = (x, y, crv) => {
  try {
    // Create EC public key from JWK components
    const keyObject = crypto.createPublicKey({
      key: {
        kty: 'EC',
        x: x,
        y: y,
        crv: crv
      },
      format: 'jwk'
    });

    // Export as PEM
    return keyObject.export({
      type: 'spki',
      format: 'pem'
    });
  } catch (error) {
    throw new Error(`Failed to convert EC JWK to PEM: ${error.message}`);
  }
};

/**
 * Creates basic auth header for CouchDB
 */
const createAuthHeader = (username, password) => {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${credentials}`;
};

/**
 * Makes a fetch request with error handling
 */
const fetchWithErrorHandling = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'JWT-Magic-Script/1.0',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
};

/**
 * Main function to process JWT keys
 */
const processJwtMagic = async () => {
  try {
    console.log('Starting JWT Magic script...');

    console.log(`Source URL: ${config.sourceUrl}`);
    console.log(`Target URL: ${config.targetUrl}`);

    // Fetch OpenID configuration
    console.log('Fetching OpenID configuration...');
    const oidcData = await fetchWithErrorHandling(config.sourceUrl);

    if (!oidcData.jwks_uri) {
      throw new Error('jwks_uri not found in OpenID configuration');
    }

    console.log(`JWKS URI found: ${oidcData.jwks_uri}`);

    // Fetch JWKS data
    console.log('Fetching JWKS data...');
    const jwksData = await fetchWithErrorHandling(oidcData.jwks_uri);

    if (!jwksData.keys || !Array.isArray(jwksData.keys)) {
      throw new Error('Invalid JWKS response: keys array not found');
    }

    console.log(`Found ${jwksData.keys.length} keys in JWKS`);

    // Process keys with "sig" use
    const sigKeys = jwksData.keys.filter(key => key.use === 'sig');
    console.log(`Found ${sigKeys.length} signing keys`);

    if (sigKeys.length === 0) {
      console.log('No signing keys found. Exiting.');
      return;
    }

    // Prepare auth header for CouchDB
    const authHeader = createAuthHeader(
      config.adminCredentials.username,
      config.adminCredentials.password
    );

    // Process each signing key
    for (const key of sigKeys) {
      try {
        console.log(`Processing key: ${key.kid || 'unknown'}`);

        if (!key.kty) {
          console.log(`Skipping key ${key.kid}: missing kty (key type)`);
          continue;
        }

        if (!key.kid) {
          console.log(`Skipping key: missing kid (key ID)`);
          continue;
        }

        // Convert JWK to PEM format as required by CouchDB
        let pemKey;
        try {
          if (key.kty === 'RSA') {
            if (!key.n || !key.e) {
              console.log(`Skipping RSA key ${key.kid}: missing n or e components`);
              continue;
            }
            pemKey = rsaJwkToPem(key.n, key.e);
          } else if (key.kty === 'EC') {
            if (!key.x || !key.y) {
              console.log(`Skipping EC key ${key.kid}: missing x or y coordinates`);
              continue;
            }
            pemKey = ecJwkToPem(key.x, key.y, key.crv);
          } else {
            console.log(`Skipping key ${key.kid}: unsupported key type ${key.kty}`);
            continue;
          }
        } catch (keyConvertError) {
          console.log(`Skipping key ${key.kid}: error converting to PEM - ${keyConvertError.message}`);
          continue;
        }

        // Construct target URL: targetUrl + "/" + lowercase(kty) + ":" + kid
        const documentId = `${key.kty.toLowerCase()}:${key.kid}`;
        const targetDocUrl = `${config.targetUrl.replace(/\/$/, '')}/${documentId}`;

        console.log(`Posting to: ${targetDocUrl}`);

        // Store PEM format as single line with escaped newlines for CouchDB _config
        const pemSingleLine = pemKey.replace(/\n/g, '\\n');
        const jsonValue = JSON.stringify(pemSingleLine);

        console.log(`Posting PEM key (single line): ${jsonValue}`);

        // Post to CouchDB _config endpoint
        const response = await fetch(targetDocUrl, {
          method: 'PUT',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: jsonValue
        });

        if (response.ok) {
          const responseData = await response.json();
          console.log(`✓ Successfully posted key ${key.kid} (${response.status})`);
          if (responseData.rev) {
            console.log(`  Document revision: ${responseData.rev}`);
          }
        } else {
          const errorText = await response.text();
          console.log(`⚠ Error posting key ${documentId}: ${response.status}`);
          console.log(`  Response: ${errorText}`);
        }

      } catch (keyError) {
        console.error(`✗ Error processing key ${key.kid || 'unknown'}:`, keyError.message);
      }
    }

    console.log('JWT Magic script completed successfully!');

  } catch (error) {
    console.error('Error in JWT Magic script:', error.message);
    process.exit(1);
  }
};

// Run the script
processJwtMagic();