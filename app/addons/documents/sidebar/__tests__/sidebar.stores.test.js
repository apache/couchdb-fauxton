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

import FauxtonAPI from "../../../../core/api";
import Stores from "../stores";
import testUtils from "../../../../../test/mocha/testUtils";
const assert = testUtils.assert;
let dispatchToken;
let store;

describe('Sidebar Store', () => {
  beforeEach(() => {
    store = new Stores.SidebarStore();
    dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch.bind(store));
  });

  afterEach(() => {
    FauxtonAPI.dispatcher.unregister(dispatchToken);
  });

  describe('toggle state', () => {

    it('should not be visible if never toggled', () => {
      assert.notOk(store.isVisible('designDoc'));
    });

    it('should be visible after being toggled', () => {
      var designDoc = 'designDoc';
      store.toggleContent(designDoc);
      assert.ok(store.isVisible(designDoc));
    });

    it('should not be visible after being toggled twice', () => {
      var designDoc = 'designDoc';
      store.toggleContent(designDoc);
      store.toggleContent(designDoc);
      assert.notOk(store.isVisible(designDoc));
    });

  });

  describe('toggle state for index', () => {
    var designDoc = 'design-doc';

    beforeEach(() => {
      store.toggleContent(designDoc);
    });

    it('should be hidden if never toggled', () => {
      assert.notOk(store.isVisible(designDoc, 'index'));
    });

    it('should be if toggled', () => {
      store.toggleContent(designDoc, 'index');
      assert.ok(store.isVisible(designDoc, 'index'));
    });

    it('should be hidden after being toggled twice', () => {
      store.toggleContent(designDoc, 'index');
      store.toggleContent(designDoc, 'index');
      assert.notOk(store.isVisible(designDoc, 'index'));
    });

  });
});
