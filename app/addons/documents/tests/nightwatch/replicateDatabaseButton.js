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


var helpers = require('../../../../../test/nightwatch_tests/helpers/helpers.js');
var testDbName = 'test_database';
module.exports = {
    before: function (client, done) {
        var nano = helpers.getNanoInstance(client.globals.test_settings.db_url);
        nano.db.create(testDbName, function () {
            done();
        });
    },

    after: function (client, done) {
        var nano = helpers.getNanoInstance(client.globals.test_settings.db_url);
        nano.db.destroy(testDbName, function () {
            done();
        });
    },

    'Shows correct view on replicate database': function (client) {
        var waitTime = client.globals.maxWaitTime,
            baseUrl = client.globals.test_settings.launch_url;
        var srcDbSelector = '.replication__page .replication__section:nth-child(2) .replication__input-react-select .Select-value-label';
        client
            .loginToGUI()
            .url(baseUrl + '/#/database/' + testDbName + '/_all_docs')
            .waitForElementNotPresent('.global-notification .fonticon-cancel', waitTime, false)

            .clickWhenVisible('.faux-header__doc-header-dropdown-toggle')
            .clickWhenVisible('.faux-header__doc-header-dropdown-itemwrapper .fonticon-replicate')

            //Wait for replication page to show up
            .waitForElementVisible('.replication__page', waitTime, false)

            //Wait for source select to show
            .waitForElementVisible(srcDbSelector, waitTime, false)

            //Get the text values
            .getText(srcDbSelector, function (data) {
                this.verify.ok(data.value === testDbName,
                    'Check if database name is filled in source name');
            })
            .end();
    }
};

