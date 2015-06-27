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

define([
  'api'
], function (FauxtonAPI) {

  var Helpers = {};

  Helpers.getPreviousPageForDoc = function (database, wasCloned) {
    var previousPage = database.url('index'), // default to the current database's all_docs page
        lastPages = FauxtonAPI.router.lastPages;

    if (!wasCloned && lastPages.length >= 2) {

      // if we came from "/new", we don't want to link the user there
      if (/(new|new_view)$/.test(lastPages[1])) {
        previousPage = lastPages[0];
      } else {
        previousPage = lastPages[1];
      }
    }

    return previousPage;
  };

  Helpers.getPreviousPage = function (database) {
    return database.url('index');
  };

  // sequence info is an array in couchdb2 with two indexes. On couch 1.x, it's just a string / number
  Helpers.getSeqNum = function (val) {
    return _.isArray(val) ? val[1] : val;
  };

  return Helpers;
});
