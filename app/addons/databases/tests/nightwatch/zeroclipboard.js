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



var os = require('os');

module.exports = {
  'ZeroClipboard copies' : function (client) {
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    var controlOrCommandKey = client.Keys.CONTROL;
    if (os.type() === 'Darwin') {
      controlOrCommandKey = client.Keys.COMMAND;
    }

    client
      .deleteDatabase(newDatabaseName)
      .loginToGUI()
      .url(baseUrl)
      .clickWhenVisible('.control-toggle-api-url')
      .pause(1000) // needed for reliability. The tray slides in from the top so the pos of the copy button changes
      .waitForElementVisible('.copy-button', waitTime, false)
      .moveToElement('.copy-button', 10, 10)
      .mouseButtonDown('left')
      .mouseButtonUp('left')
      .closeNotification()
      .clickWhenVisible('.search-autocomplete', waitTime, false)
      .setValue('.search-autocomplete', '')
      .pause(1)
      .keys([controlOrCommandKey, 'v'])
      .assert.value('.search-autocomplete', 'http://localhost:8000/_all_dbs')

    .end();
  }
};
