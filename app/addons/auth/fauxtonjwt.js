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

import Helpers from "../../helpers";

var FauxtonJwt = {};

FauxtonJwt.cookieName = "fauxton-jwt";


/**
 * jwtStillValid - Check if a JWT token is still valid
 *
 * @param {string} token The JWT token
 * @return {boolean} True if the token is still valid, false otherwise
 */
FauxtonJwt.jwtStillValid = (token) => {
  if (!token) {
    return false;
  }

  const decodedToken = FauxtonJwt.decodeToken(token);
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
FauxtonJwt.decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

FauxtonJwt.getExpiry = (token) => {
  const decodedToken = FauxtonJwt.decodeToken(token);
  return decodedToken ? decodedToken.exp : 0;
};

FauxtonJwt.setJwtCookie = function (token) {
  document.cookie = `${FauxtonJwt.cookieName}=${token}; secure; samesite=Strict`;
};

FauxtonJwt.deleteJwtCookie = function () {
  Helpers.deleteCookie(FauxtonJwt.cookieName);
};

/**
 * addAuthToken - Add the JWT token to the fetch options headers if it exists in local storage
 *
 * @param {object} fetchOptions - The fetch options object
 * @returns {object} the updated fetch options object
 */
FauxtonJwt.addAuthToken = (fetchOptions) => {
  const token = Helpers.getCookie(FauxtonJwt.cookieName);
  if (token && FauxtonJwt.jwtStillValid(token)) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`
    };
  } else {
    FauxtonJwt.deleteJwtCookie();
  }
  return fetchOptions;
};

FauxtonJwt.addAuthHeader = (httpRequest) => {
  const token = Helpers.getCookie(FauxtonJwt.cookieName);
  if (token && FauxtonJwt.jwtStillValid(token)) {
    httpRequest.setRequestHeader('Authorization', `Bearer ${token}`);
  }
  return httpRequest;
};

export default FauxtonJwt;
