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

export const sendRequest = (url, method = "GET", body) => {
  const options = {
    method,
    credentials: "include",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "Pragma":"no-cache"
    },
    cache: "no-cache",
    body: body ? JSON.stringify(body) : undefined
  };
  return fetch(url, options).then(res => {
    if (!res.ok) {
      return res.text().then(errAsText => {
        const err = new Error(errAsText);
        // Add these fields for compatibility with XHR response that backbone uses
        err.status = res.status;
        err.responseText = errAsText;
        try {
          err.responseJSON = JSON.parse(errAsText);
        } catch (e) {
          //ignore
        }
        throw err;
      });
    }
    return res.json();
  });
};

export function isObject(value) {
  return typeof value === 'object' && value !== null;
}
