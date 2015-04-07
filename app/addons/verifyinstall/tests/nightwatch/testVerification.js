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
  'Run the Verification test' : function (client) {
    var waitTime = client.globals.maxWaitTime,
      baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .url(baseUrl + '#verifyinstall')
      .waitForElementPresent('#start', waitTime, false)
      .click('#start')
      .waitForElementVisible('.alert-success', waitTime, false)
      .getText('html', function (result) {
        var testPassed = result.value.indexOf('Success! Your CouchDB installation is working. Time to Relax.') !== -1;
        this.verify.ok(testPassed, 'Checking the verification set passed.');
      })
      .end();
  }
};
