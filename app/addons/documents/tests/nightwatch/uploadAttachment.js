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
  'Uploading an attachment works': function (client) {
    /*jshint multistr: true */
    /*globals __dirname */
    var waitTime = client.globals.maxWaitTime,
        newDatabaseName = client.globals.testDatabaseName,
        baseUrl = client.globals.test_settings.launch_url;

    client
      .loginToGUI()
      .createDatabase(newDatabaseName)
      .createDocument('my_doc', newDatabaseName)
      .url(baseUrl + '/#/database/' + newDatabaseName + '/my_doc')
      .clickWhenVisible('.panel-button.upload')
      .waitForElementVisible('input[name="_attachments"]', waitTime)
      .setValue('input[name="_attachments"]', require('path').resolve(__dirname + '/uploadAttachment.js'))
      .clickWhenVisible('#upload-btn')
      .waitForElementVisible('.global-notification', waitTime, false)
      .getText('.global-notification', function (result) {
        var data = result.value;
        this.verify.ok(data, 'Document saved successfully.');
      })
    .end();
  }
};
