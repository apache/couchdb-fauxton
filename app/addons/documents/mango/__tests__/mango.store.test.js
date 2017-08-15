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

import Stores from "../mango.stores";
import testUtils from "../../../../../test/mocha/testUtils";
var assert = testUtils.assert;
var store;

describe('Mango Store', () => {
  describe('getQueryCode', () => {

    beforeEach(() => {
      window.localStorage.clear();
      store = new Stores.MangoStore();
    });

    it('returns a default query', () => {
      assert.ok(store.getQueryFindCode());
    });

    it('can store query in history', () => {
      store.addQueryHistory({selector: 'foo'});
      const history = store.getHistory();
      assert.equal(history[0].label, '{"selector":"foo"}');
      assert.equal(history[0].value, '{\n   "selector": "foo"\n}');
    });

    it('does not add duplicate history', () => {
      store.addQueryHistory({selector: 'foo'});
      store.addQueryHistory({selector: 'foo'});

      const history = store.getHistory();

      assert.equal(history[0].label, '{"selector":"foo"}');
      assert.equal(history.length, 2);
    });

    it('does not add duplicate history for selector with different formatting', () => {
      store.addQueryHistory({selector: 'foo'});
      store.addQueryHistory('{"selector": "foo"}');
      store.addQueryHistory('{"selector":"foo"\n}');

      const history = store.getHistory();

      assert.equal(history[0].label, '{"selector":"foo"}');
      assert.equal(history.length, 2);
    });

     it('promotes existing history entry to top when used', () => {
      store.addQueryHistory({selector: 'foo'});
      store.addQueryHistory({selector: 'bar'});
      var history = store.getHistory();
      assert.equal(history[0].label, '{"selector":"bar"}');

      store.addQueryHistory({selector: 'foo'});
      history = store.getHistory();
      assert.equal(history[0].label, '{"selector":"foo"}');
      assert.equal(history.length, 3);
    });

    it('limits the number of history items to 5', () => {
      store.addQueryHistory({selector: '1'});
      store.addQueryHistory({selector: '2'});
      store.addQueryHistory({selector: '3'});
      store.addQueryHistory({selector: '4'});
      store.addQueryHistory({selector: '5'});
      store.addQueryHistory({selector: '6'});

      const history = store.getHistory();
      assert.equal(history.length, 5);
    });

    it('can store query in history with custom label', () => {
      store.addQueryHistory({selector: 'foo'}, 'demo');
      const history = store.getHistory();
      assert.equal(history[0].label, 'demo');
      assert.equal(history[0].value, '{\n   "selector": "foo"\n}');
    });

    it('history is persisted by key', () => {
      store.setHistoryKey('test');
      store.addQueryHistory({selector: 'foo'}, 'demo');
      var history = store.getHistory();
      assert.equal(history[0].label, 'demo');

      const store2 = new Stores.MangoStore();
      store2.setHistoryKey('test');
      history = store2.getHistory();
      assert.equal(history[0].label, 'demo');
    });

    it('different history for different keys', () => {
      store.setHistoryKey('test');
      store.addQueryHistory({selector: 'foo'}, 'demo');
      var history = store.getHistory();
      assert.equal(history[0].label, 'demo');
      assert.equal(history.length, 2);

      const store2 = new Stores.MangoStore();
      store2.setHistoryKey('test2');
      store2.addQueryHistory({selector: 'bar'}, 'demo2');
      history = store2.getHistory();
      assert.equal(history[0].label, 'demo2');
      assert.equal(history.length, 2);
    });

    it('initializes default query code with most recent history', () => {
      store.addQueryHistory({selector: 'foo'}, 'demo');
      const history = store.getHistory();
      const code = store.getQueryFindCode();
      assert.equal(history[0].value, code);
    });
  });
});
