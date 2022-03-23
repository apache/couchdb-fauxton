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
  'is able to show two docs next to each other, and diff them' : function (client) {
    /*jshint multistr: true */
    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = 'animaldb';
    const baseUrl = client.options.launch_url;

    client
      .createAnimalDb()
      .checkForDocumentCreated('zebra', null, newDatabaseName)

      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/zebra')

      .clickWhenVisible('button.conflicts')

      .waitForElementVisible('.revision-diff-area', waitTime, false)

      .assert.textContains('.revision-diff-area', '"black & white"')
      .assert.textContains('.revision-diff-area', '"white"')

      .clickWhenVisible('.two-sides-toggle-button button:last-child')

      .waitForElementVisible('.revision-split-area', waitTime, false)

      .assert.textContains('.revision-split-area [data-id="ours"]', '"black & white"')
      .assert.textContains('.revision-split-area [data-id="theirs"]', '"white"')


      .clickWhenVisible('[data-id="button-select-theirs"]')
      .clickWhenVisible('.modal-footer input[type="checkbox"]')
      .clickWhenVisible('.modal-footer button.btn-danger')
      .clickWhenVisible('.fonticon-json')

      .clickWhenVisible('[data-id="zebra"] a')

      .waitForElementVisible('.panel-section', waitTime, false)
      .assert.not.elementPresent('button.conflicts')

      .url(baseUrl + '/#/database/' + newDatabaseName + '?include_docs=true&conflicts=true')

      .getText('body', function (result) {
        this.verify.ok(result.value.indexOf('"color": "white"') !== -1, 'check if doc version was promoted');
      })

      .end();
  },
  'is able to show two design docs next to each other, and diff them' : function (client) {
    /*jshint multistr: true */
    const waitTime = client.globals.maxWaitTime;
    const newDatabaseName = 'animaldb';
    const baseUrl = client.options.launch_url;

    client
      .createAnimalDb()
      .checkForDocumentCreated('_design/animals', null, newDatabaseName)

      .loginToGUI()
      .url(baseUrl + '/#/database/' + newDatabaseName + '/_design/animals')

      .clickWhenVisible('button.conflicts')

      .waitForElementVisible('.revision-diff-area', waitTime, false)

      .assert.textContains('.revision-diff-area', '"black & white"')
      .assert.textContains('.revision-diff-area', '"white"')

      .clickWhenVisible('.two-sides-toggle-button button:last-child')

      .waitForElementVisible('.revision-split-area', waitTime, false)

      .assert.textContains('.revision-split-area [data-id="ours"]', '"black & white"')
      .assert.textContains('.revision-split-area [data-id="theirs"]', '"white"')


      .clickWhenVisible('[data-id="button-select-theirs"]')
      .clickWhenVisible('.modal-footer input[type="checkbox"]')
      .clickWhenVisible('.modal-footer button.btn-danger')
      .clickWhenVisible('.fonticon-json')
      .waitForElementNotVisible('.Toastify__toast-container .Toastify__toast', waitTime, false)
      .clickWhenVisible('[data-id="_design/animals"] a')

      .waitForElementVisible('.panel-section', waitTime, false)
      .assert.not.elementPresent('button.conflicts')

      .url(baseUrl + '/#/database/' + newDatabaseName + '?include_docs=true&conflicts=true')

      .getText('body', function (result) {
        this.verify.ok(result.value.indexOf('"color": "white"') !== -1, 'check if doc version was promoted');
      })

      .end();
  }
};
