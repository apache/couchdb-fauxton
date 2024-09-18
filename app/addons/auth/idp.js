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

import FauxtonAPI from '../../core/api';

/**
 * Keeping track of IdP URLs derived from openid-configuration
 * with access to auth and token endpoints
 */
const idpCache = {};

/**
 * Reads the openid-configuration from the IdP URL
 *
 * @param {string} idpurl
 * @returns object with authorization and token endpoints
 */
const getIdPEndpoints = (idpurl) =>
  new Promise((resolve, reject) => {
    if (idpCache[idpurl]) {
      return resolve(idpCache[idpurl]);
    }
    fetch(idpurl)
      .then((response) => response.json())
      .then((data) => {
        let idpData = {
          authorization_endpoint: data.authorization_endpoint,
          token_endpoint: data.token_endpoint
        };
        idpCache[idpurl] = idpData;
        resolve(idpData);
      })
      .catch((err) => {
        reject(err);
      });
  });

/**
 * Retrieves the auth end-point from the openid-configuration
 *
 * @param {string} idpurl openid-configuration end-point
 * @returns auth end-point
 */
const getAuthEndpoint = (idpurl) =>
  new Promise((resolve, reject) => {
    getIdPEndpoints(idpurl)
      .then((idpData) => {
        resolve(idpData.authorization_endpoint);
      })
      .catch((err) => {
        reject(err);
      });
  });

/**
 * Retrieves the token end-point from the openid-configuration
 *
 * @param {string} idpurl openid-configuration end-point
 * @returns token end-point
 */
const getTokenEndpoint = (idpurl) =>
  new Promise((resolve, reject) => {
    getIdPEndpoints(idpurl)
      .then((idpData) => {
        resolve(idpData.token_endpoint);
      })
      .catch((err) => {
        reject(err);
      });
  });

/**
 * jwtStillValid - Check if a JWT token is still valid
 *
 * @param {string} token The JWT token
 * @return {boolean} True if the token is still valid, false otherwise
 */
export const jwtStillValid = (token) => {
  if (!token) {
    return false;
  }

  const decodedToken = decodeToken(token);
  if (!decodedToken) {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  let isStillgood = decodedToken.exp > currentTime;
  return isStillgood;
};

/**
 * decodeToken - Decode a JWT token and return the payload
 *
 * @param {string} token The JWT token
 * @return {object} The decoded token payload
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const getExpiry = (token) => {
  const decodedToken = decodeToken(token);
  return decodedToken ? decodedToken.exp : 0;
};

export const login = (idpurl, idpcallback, idpappid) => {
  return getAuthEndpoint(idpurl)
    .then((authEndpoint) => {
      const authUrl = `${authEndpoint}?response_type=code&client_id=${idpappid}&redirect_uri=${idpcallback}&scope=openid#idpresult`;
      window.location.href = authUrl;
      return Promise.resolve('Authentication initiated');
    })
    .catch((error) => {
      console.error('Error fetching auth endpoint:', error);
      FauxtonAPI.addNotification({
        msg: error.message,
        type: 'error'
      });
    });
};

export const logout = () => {
  localStorage.removeItem('fauxtonToken');
  localStorage.removeItem('fauxtonRefreshToken');
  window.location.href = '/_session';
  // TODO: do we need to call the end_session_endpoint?
};

export const codeToToken = (url) => {
  const authCode = url.searchParams.get('code');
  if (authCode) {
    const idpurl = localStorage.getItem('FauxtonIdpurl');
    const idpappid = localStorage.getItem('FauxtonIdpappid');
    const callback = localStorage.getItem('FauxtonIdpcallback');
    getTokenEndpoint(idpurl)
      .then((authUrl) => {
        return fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `grant_type=authorization_code&code=${authCode}&client_id=${idpappid}&redirect_uri=${callback}`
        });
      })
      .then((response) => response.json())
      .then((data) => {
        const accessToken = data.access_token;
        const jwtRefreshToken = data.refresh_token;
        localStorage.setItem('fauxtonToken', accessToken);
        localStorage.setItem('fauxtonRefreshToken', jwtRefreshToken);
        const expiry = getExpiry(accessToken);
        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.log('Refreshing token');
          refreshToken();
        }, (expiry - 60) * 1000);
        return FauxtonAPI.navigate('/');
      })
      .catch((error) => {
        console.error('Error refreshing token:', error);
        FauxtonAPI.addNotification({
          msg: `Error refreshing token: ${error.message}`,
          type: 'error'
        });
      });
  } else {
    FauxtonAPI.addNotification({
      msg: 'No auth code found',
      type: 'error'
    });
  }
};

export const refreshToken = () => {
  const jwtRefreshToken = localStorage.getItem('fauxtonRefreshToken');
  const idpurl = localStorage.getItem('FauxtonIdpurl');
  const idpappid = localStorage.getItem('FauxtonIdpappid');
  if (!jwtRefreshToken) {
    FauxtonAPI.addNotification({
      msg: `Refresh Token missing`,
      type: 'error'
    });
    return;
  }
  getTokenEndpoint(idpurl).then((authUrl) =>
    fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `grant_type=refresh_token&refresh_token=${jwtRefreshToken}&client_id=${idpappid}`
    })
      .then((response) => response.json())
      .then((data) => {
        const accessToken = data.access_token;
        localStorage.setItem('fauxtonToken', accessToken);
        const expiry = getExpiry(accessToken);
        setTimeout(() => {
          refreshToken();
        }, (expiry - 60) * 1000);
      })
      .catch((error) => {
        console.error('Error refreshing token:', error);
        FauxtonAPI.addNotification({
          msg: `Refreshing Token failed: ${error.message}`,
          type: 'error'
        });
        localStorage.removeItem('fauxtonToken');
        localStorage.removeItem('fauxtonRefreshToken');
      })
  );
};

/**
 * addAuthToken - Add the JWT token to the fetch options headers if it exists in local storage
 *
 * @param {object} fetchOptions - The fetch options object
 * @returns {object} the updated fetch options object
 */
export const addAuthToken = (fetchOptions) => {
  // eslint-disable-next-line no-console
  console.debug('addAuthToken', fetchOptions);
  const token = localStorage.getItem('fauxtonToken');
  if (token && jwtStillValid(token)) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`
    };
  } else {
    localStorage.removeItem('fauxtonToken');
  }
  return fetchOptions;
};

export const addAuthHeader = (httpRequest) => {
  const token = localStorage.getItem('fauxtonToken');
  if (token && jwtStillValid(token)) {
    httpRequest.setRequestHeader('Authorization', `Bearer ${token}`);
  }
  return httpRequest;
};

export default {
  login,
  logout,
  refreshToken,
  codeToToken,
  jwtStillValid,
  decodeToken,
  getExpiry,
  addAuthToken,
  addAuthHeader
};
