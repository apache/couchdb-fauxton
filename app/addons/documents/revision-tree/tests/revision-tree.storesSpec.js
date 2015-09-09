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
  'api',
  'react',
  'testUtils',
  'addons/documents/revision-tree/actiontypes',
  'addons/documents/revision-tree/stores',
  'addons/documents/revision-tree/actions'
], function (FauxtonAPI, React, testUtils, ActionTypes, Stores, Actions) {

  var assert = testUtils.assert;
  var store;
  var testOptions;
  var dispatchToken;

  beforeEach(function () {
    store = new Stores.RevTreeStore();
    dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
    testOptions = {id:"12"};
  });

  afterEach(function () {
    FauxtonAPI.dispatcher.unregister(dispatchToken);
  });

  describe('Revision Tree Store', function () {

    describe('#Get_tree_options', function () {

      it('get the revision tree options from the store successfully', function () {
        store._treeOptions = {'id': 12};
        store.newRevTree(testOptions);
        assert.equal(store.getTreeOptions().id, 12);
      });

    });

  });

});
