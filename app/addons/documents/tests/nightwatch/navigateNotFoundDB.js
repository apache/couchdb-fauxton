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



module.exports = {

  // this tests that the user is able to just navigate to and from the New View page without errors [it confirms
  // a bug fix for where the Ace Editor threw a JS error preventing the subsequent page from loading]
  'Navigate to a database that does not exist' : function (client) {
    const waitTime = client.globals.maxWaitTime,
          baseUrl = client.options.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '/#/database/does-not-exist/_all_docs')
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--error', waitTime, false)
      // We wait for the first toasts to be cleared
      .pause(3000)
      .waitForElementVisible('.Toastify__toast-container .Toastify__toast--error', waitTime, false)
      .assert.textContains('.Toastify__toast-container .Toastify__toast--error .Toastify__toast-body', 'does not exist')
      .verify.urlEquals(baseUrl + '/#');
  }
};
