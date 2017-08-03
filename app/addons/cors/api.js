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

import 'whatwg-fetch';

/**
 * Fetches the current CORS configuration.
 * @param {string} baseURL
 * @returns {Promise}
 */
export const fetchCORSConfig = (baseURL) => {
  const configURL = baseURL + '/cors';
  return fetch(configURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'GET'
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error(json.reason);
      }

      const origins = !json.origins ? [] : json.origins.split(',');
      return {
        origins: origins,
        methods: json.methods,
        credentials: json.credentials,
        headers: json.headers
      };
    });
};

/**
 * Fetches the current Httpd configuration.
 * @param {string} baseURL
 * @returns {Promise}
 */
export const fetchHttpdConfig = (baseURL) => {
  const configURL = baseURL + '/httpd';
  return fetch(configURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'GET'
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error(json.reason);
      }
      return json;
    });
};

/**
 * Updates the 'enable_cors' property of the Httpd configuration.
 * @param {string} baseURL
 * @param {string} node
 * @param {boolean} enableCors
 * @returns {Promise}
 */
export const updateEnableCorsToHttpd = (baseURL, node, enableCors) => {
  if (!node) {
    throw new Error('node not set');
  }
  const configURL = baseURL + '/httpd/enable_cors';
  return fetch(configURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'PUT',
    body: JSON.stringify(enableCors.toString())
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error(json.reason);
      }
      return json;
    });
};

/**
 * Updates the 'origins' property of the CORS configuration.
 * @param {string} baseURL
 * @param {string} node
 * @param {string} origins A comma separated list of domains
 * @returns {Promise}
 */
export const updateCorsOrigins = (baseURL, node, origins) => {
  return updateCorsProperty(baseURL, node, 'origins', origins);
};

/**
 * Updates the 'credentials' property of the CORS configuration with the proper value when enabling CORS.
 * @param {string} baseURL
 * @param {string} node
 * @returns {Promise}
 */
export const updateCorsCredentials = (baseURL, node) => {
  return updateCorsProperty(baseURL, node, 'credentials', 'true');
};

/**
 * Updates the 'headers' property of the CORS configuration with the proper value when enabling CORS.
 * @param {string} baseURL
 * @param {string} node
 * @returns {Promise}
 */
export const updateCorsHeaders = (baseURL, node) => {
  return updateCorsProperty(baseURL, node, 'headers', 'accept, authorization, content-type, origin, referer');
};

/**
 * Updates the 'methods' property of the CORS configuration with the proper value when enabling CORS.
 * @param {string} baseURL
 * @param {string} node
 * @returns {Promise}
 */
export const updateCorsMethods = (baseURL, node) => {
  return updateCorsProperty(baseURL, node, 'methods', 'GET, PUT, POST, HEAD, DELETE');
};

const updateCorsProperty = (baseURL, node, propName, propValue) => {
  if (!node) {
    throw new Error('node not set');
  }
  const configURL = baseURL + '/cors/' + propName;
  return fetch(configURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'PUT',
    body: JSON.stringify(propValue)
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error(json.reason);
      }
      return json;
    });
};
