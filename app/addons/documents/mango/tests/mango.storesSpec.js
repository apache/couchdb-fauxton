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
  '../../../../core/api',
  '../mango.stores',
  '../mango.actiontypes',
  '../../resources',
  '../../../../../test/mocha/testUtils',

], function (FauxtonAPI, Stores, ActionTypes, Resources, testUtils) {
  var assert = testUtils.assert;
  var dispatchToken;
  var store;

  describe('Mango Store', function () {

    describe('queryBuilder', function () {
      beforeEach(function () {
        store = new Stores.MangoStore();
        dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
      });

      afterEach(function () {
        FauxtonAPI.dispatcher.unregister(dispatchToken);
      });

      it('adds selectors', function () {
        store.addSelector({field: 'name', operator: '$eq', fieldValue: 'John Rambo'});

        assert.deepEqual([{field: 'name', operator: '$eq', fieldValue: 'John Rambo'}], store.getSelectors());
      });

      it('is not possible to add the same selector twice', function () {
        store.addSelector({field: 'name', operator: '$eq', fieldValue: 'John Rambo'});
        store.addSelector({field: 'name', operator: '$eq', fieldValue: 'John Rambo'});

        assert.equal(1, store.getSelectors().length);
      });

      it('is not possible to add incomplete selectors: missing field', function () {
        store.addSelector({operator: '$eq', fieldValue: 'John Rambo'});

        assert.equal(0, store.getSelectors().length);
      });

      it('is not possible to add incomplete selectors: missing fieldValue', function () {
        store.addSelector({field: 'name', operator: '$eq'});

        assert.equal(0, store.getSelectors().length);
      });

      it('removes selectors', function () {
        store.addSelector({field: 'name', operator: '$eq', fieldValue: 'John Rambo'});
        store.removeSelector({field: 'name', operator: '$eq', fieldValue: 'John Rambo'});

        assert.equal(0, store.getSelectors().length);
      });

      it('does not remove selectors that dont match', function () {
        store.addSelector({field: 'name', operator: '$eq', fieldValue: 'John Rambo'});
        store.removeSelector({field: 'name', operator: '$ne', fieldValue: 'John Rambo'});

        assert.equal(1, store.getSelectors().length);
      });

      it('returns an empty selectorset if no selectors were added', function () {
        assert.deepEqual(store.getEmptyQuery(), store.getQuery());
      });

      describe('buildQuery', function () {
        it('builds queries for $eq operators', function () {
          var selectorList = [{field: 'name', operator: '$eq', fieldValue: 'John Rambo'}];

          var res = store.buildQuery(selectorList);

          assert.deepEqual({selector: {name: 'John Rambo'}}, res);
        });

      });

    });

    describe('getQueryCode', function () {

      beforeEach(function () {
        store = new Stores.MangoStore();
        dispatchToken = FauxtonAPI.dispatcher.register(store.dispatch);
      });

      afterEach(function () {
        FauxtonAPI.dispatcher.unregister(dispatchToken);
      });

      it('returns a default query', function () {
        assert.ok(store.getQueryFindCode());
      });

      it('can set new selectors', function () {
        store.newQueryFindCodeFromFields({fields: ['foo', 'bar']});
        var res = store.getQueryFindCode();
        assert.equal(res, JSON.stringify({
          "selector": {
            "foo": {"$gt": null},
            "bar": {"$gt": null}
          }
        }, null, '  '));
      });

      it('indicates that we set another query for the user', function () {
        assert.notOk(store.getQueryFindCodeChanged());
        store.newQueryFindCodeFromFields({fields: ['mussman', 'zetti']});
        assert.ok(store.getQueryFindCodeChanged());
      });

      it('alters the default query', function () {
        assert.notOk(store.getQueryFindCodeChanged());
        store.newQueryFindCodeFromFields({fields: ['mussman', 'zetti']});
        assert.deepEqual(store.getQueryFindCode(), JSON.stringify({
          "selector": {
            "mussman": {"$gt": null},
            "zetti": {"$gt": null}
          }
        }, null, '  '));
      });

      it('filters querytypes that are not needed', function () {

        var collection = new Resources.MangoIndexCollection([
          new Resources.MangoIndex({
            ddoc: null,
            name: 'emma',
            type: 'special',
            def: {fields: [{_id: 'asc'}]}
          }, {}),
          new Resources.MangoIndex({
            ddoc: null,
            name: 'biene',
            type: 'json',
            def: {fields: [{_id: 'desc'}]}
          }, {}),
          new Resources.MangoIndex({
            ddoc: null,
            name: 'alf',
            type: 'nickname',
            def: {fields: [{_id: 'asc'}]}
          }, {})
        ], {
          database: {id: 'databaseId', safeID: function () { return this.id; }},
          params: {limit: 20}
        });
        store._availableIndexes = collection;
        assert.equal(store.getAvailableQueryIndexes().length, 2);
      });

    });
  });
});
