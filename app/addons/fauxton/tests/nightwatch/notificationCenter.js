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
  'Notification Center' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .url(baseUrl + '/#login')

      // confirm the btn doesn't appear on the login screen
      .waitForElementPresent('a[href="#login"]', waitTime, false)
      .waitForElementNotPresent('#notification-center-btn div.fonticon-bell', waitTime, false)

      .loginToGUI()
      .waitForElementPresent('#notification-center-btn', waitTime, false)
      .assert.cssClassNotPresent('.notification-center-panel', 'visible')
      .clickWhenVisible('#notification-center-btn .fonticon-bell', waitTime, false)
      .waitForElementPresent('.notification-center-panel.visible', waitTime, false)

      .getText('.notification-center-panel', function (result) {
        var content = result.value;
        this.verify.ok(/You\shave\sbeen\slogged\sin\./.test(content),
          'Confirming login message appears');
      })
    .end();
  }
};
