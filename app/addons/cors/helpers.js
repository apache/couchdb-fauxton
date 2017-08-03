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

import FauxtonAPI from "../../core/api";

/**
 * Returns true if 'domain' is a valid domain name. Otherwise returns false and shows an error message to the user.
 *
 * @param {string} domain
 * @returns {boolean}
 */
export function validateDomain(domain) {
  if (!validateCORSDomain(domain)) {
    FauxtonAPI.addNotification({
      msg: 'Please enter a valid domain, starting with http/https.',
      type: 'error',
      clear: true
    });
    return false;
  }
  return true;
}

/**
 * Returns true if 'domain' is a valid domain name.
 *
 * @param {string} domain
 * @returns {boolean}
 */
export function validateCORSDomain (domain) {
  return (/^https?:\/\/(.+)(:\d{2,5})?$/).test(domain);
};

/**
 * Formats a URL value.
 * @param {string} url
 * @returns {string}
 */
export function normalizeUrls (url) {
  const el = document.createElement('a');
  el.href = url;

  if (/:/.test(url)) {
    return el.protocol + '//' + el.host;
  }

  return el.protocol + '//' + el.hostname;
};




