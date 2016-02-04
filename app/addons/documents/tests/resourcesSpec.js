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
  '../../../core/api',
  '../resources',
  '../../../../test/mocha/testUtils',
  '../base'
], function (FauxtonAPI, Models, testUtils) {
  var assert = testUtils.assert;

  describe('IndexCollection', function () {
    var collection;
    beforeEach(function () {
      collection = new Models.IndexCollection([{
        id:'myId1',
        doc: 'num1'
      },
      {
        id:'myId2',
        doc: 'num2'
      }], {
        database: {id: 'databaseId', safeID: function () { return this.id; }},
        design: '_design/myDoc'
      });
    });

    it('creates the right api-url with an absolute url', function () {
      assert.ok(/file:/.test(collection.urlRef('apiurl')));
    });

  });

  describe('Document', function () {
    var doc;
    beforeEach(function () {
      doc = new Models.Doc({}, {});
    });

    it('does not remove an id attribute', function () {
      var res = doc.parse({
        _id: 'be31e531fe131bdf416b479ac1000484',
        _rev: '4-3a1b9f4b988b413e9245cd250769da72',
        id: 'foo'
      });
      assert.equal(res.id, 'foo');
    });

    it('removes the id, if we create a document and get back an "id" instead of "_id"', function () {
      // if we take the document {"_id": "mycustomid", "_rev": "18-9cdeb1b121137233e3466b06a1780c29", id: "foo"}
      // and do a PUT request for an update, CouchDB will return:
      // {"ok":true,"id":"mycustomid","rev":"18-9cdeb1b121137233e3466b06a1780c29"}
      // and our Model will think it has the id "mycustomid" instead of "foo"
      var res = doc.parse({
        id: 'be31e531fe131bdf416b479ac1000484',
        _rev: '4-3a1b9f4b988b413e9245cd250769da72',
        ok: true
      });
      assert.notOk(res.id);
    });

    it('can return the doc url, if id given', function () {
      doc = new Models.Doc({_id: 'scholle'}, {
        database: {id: 'blerg', safeID: function () { return this.id; }}
      });

      assert.ok(/\/blerg/.test(doc.url('apiurl')));
    });

    it('will return the API url to create a new doc, if no doc exists yet', function () {
      doc = new Models.Doc({}, {
        database: {id: 'blerg', safeID: function () { return this.id; }}
      });

      assert.ok(/\/blerg/.test(doc.url('apiurl')));
    });
  });

  describe('MangoIndex', function () {
    var doc;

    it('is deleteable', function () {
      var index = {
        ddoc: null,
        name: '_all_docs',
        type: 'json',
        def: {fields: [{_id: 'asc'}]}
      };
      doc = new Models.MangoIndex(index, {});

      assert.ok(doc.isDeletable());
    });

    it('special docs are not deleteable', function () {
      var index = {
        ddoc: null,
        name: '_all_docs',
        type: 'special',
        def: {fields: [{_id: 'asc'}]}
      };
      doc = new Models.MangoIndex(index, {});

      assert.notOk(doc.isDeletable());
    });
  });

  describe('MangoDocumentCollection', function () {
    var collection;

    it('gets 1 doc more to know if there are more than 20', function () {
      collection = new Models.MangoDocumentCollection([{
        name: 'myId1',
        doc: 'num1'
      },
      {
        name: 'myId2',
        doc: 'num2'
      }], {
        database: {id: 'databaseId', safeID: function () { return this.id; }},
        params: {limit: 20}
      });
      collection.setQuery({
        selector: '$foo',
        fields: 'bla'
      });

      assert.deepEqual({
        selector: '$foo',
        fields: 'bla',
        limit: 21,
        skip: undefined
      }, collection.getPaginatedQuery());
    });

    it('on next page, skips first 20', function () {
      collection = new Models.MangoDocumentCollection([{
        name: 'myId1',
        doc: 'num1'
      },
      {
        name: 'myId2',
        doc: 'num2'
      }], {
        database: {id: 'databaseId', safeID: function () { return this.id; }},
        params: {limit: 20}
      });
      collection.setQuery({
        selector: '$foo',
        fields: 'bla'
      });
      collection.next();
      assert.deepEqual({
        selector: '$foo',
        fields: 'bla',
        limit: 21,
        skip: 20
      }, collection.getPaginatedQuery());
    });

  });

  describe('MangoDocumentCollection', function () {
    var collection;

    it('is not editable', function () {
      collection = new Models.MangoIndexCollection([{
        name: 'myId1',
        doc: 'num1'
      },
      {
        name: 'myId2',
        doc: 'num2'
      }], {
        database: {id: 'databaseId', safeID: function () { return this.id; }},
        params: {limit: 20}
      });

      assert.notOk(collection.isEditable());
    });
  });

  describe('IndexCollection', function () {
    var collection;

    it('design docs are editable', function () {
      collection = new Models.IndexCollection([{
        _id: 'myId1',
        doc: 'num1'
      },
      {
        _id: 'myId2',
        doc: 'num2'
      }], {
        database: {id: 'databaseId', safeID: function () { return this.id; }},
        params: {limit: 20},
        design: '_design/foobar'
      });

      assert.ok(collection.isEditable());
    });

    it('reduced design docs are NOT editable', function () {
      collection = new Models.IndexCollection([{
        _id: 'myId1',
        doc: 'num1'
      },
      {
        _id: 'myId2',
        doc: 'num2'
      }], {
        database: {id: 'databaseId', safeID: function () { return this.id; }},
        params: {limit: 20, reduce: true},
        design: '_design/foobar'
      });

      assert.notOk(collection.isEditable());
    });
  });

  describe('AllDocs', function () {
    var collection;

    it('all-docs-list documents are always editable', function () {
      collection = new Models.AllDocs([{
        _id: 'myId1',
        doc: 'num1'
      },
      {
        _id: 'myId2',
        doc: 'num2'
      }], {
        database: {id: 'databaseId', safeID: function () { return this.id; }},
        params: {limit: 20}
      });

      assert.ok(collection.isEditable());
    });
  });

  describe('QueryParams', function () {
    describe('parse', function () {
      it('should not parse arbitrary parameters', function () {
        var params = {'foo': '[1]]'};
        var result = Models.QueryParams.parse(params);

        assert.deepEqual(result, params);
      });

      it('parses startkey, endkey', function () {
        var params = {
          'startkey':'[\"a\",\"b\"]',
          'endkey':'[\"c\",\"d\"]'
        };
        var result = Models.QueryParams.parse(params);

        assert.deepEqual(result, {
          'startkey': ['a', 'b'],
          'endkey': ['c', 'd']
        });
      });

      it('parses key', function () {
        var params = {
          key:'[1,2]'
        };
        var result = Models.QueryParams.parse(params);

        assert.deepEqual(result, {'key': [1, 2]});
      });

      it('does not modify input', function () {
        var params = {
          key:'[\"a\",\"b\"]'
        };
        var clone = _.clone(params);
        var result = Models.QueryParams.parse(params);

        assert.deepEqual(params, clone);
      });
    });

    describe('stringify', function () {
      it('should not stringify arbitrary parameters', function () {
        var params = {'foo': [1, 2, 3]};
        var result = Models.QueryParams.stringify(params);

        assert.deepEqual(result, params);
      });

      it('stringifies startkey, endkey', function () {
        var params = {
          'startkey': ['a', 'b'],
          'endkey': ['c', 'd']
        };

        var result = Models.QueryParams.stringify(params);

        assert.deepEqual(result, {
          'startkey':'[\"a\",\"b\"]',
          'endkey':'[\"c\",\"d\"]'
        });
      });

      it('stringifies key', function () {
        var params = {'key':['a', 'b']};
        var result = Models.QueryParams.stringify(params);

        assert.deepEqual(result, { 'key': '[\"a\",\"b\"]' });
      });

      it('does not modify input', function () {
        var params = {'key': ['a', 'b']};
        var clone = _.clone(params);
        var result = Models.QueryParams.stringify(params);

        assert.deepEqual(params, clone);
      });

      it('is symmetrical with parse', function () {
        var params = {
          'startkey': ['a', 'b'],
          'endkey': ['c', 'd'],
          'foo': '[1,2]',
          'bar': 'abc'
        };

        var clone = _.clone(params);
        var json = Models.QueryParams.stringify(params);
        var result = Models.QueryParams.parse(json);

        assert.deepEqual(result, clone);
      });
    });
  });

  describe('Bulk Delete', function () {
    var databaseId = 'ente',
        collection,
        promise,
        values;

    values = [{
      _id: '1',
      _rev: '1234561',
      _deleted: true
    },
    {
      _id: '2',
      _rev: '1234562',
      _deleted: true
    },
    {
      _id: '3',
      _rev: '1234563',
      _deleted: true
    }];

    beforeEach(function () {
      collection = new Models.BulkDeleteDocCollection(values, {
        databaseId: databaseId
      });

      promise = FauxtonAPI.Deferred();
    });

    it('contains the models', function () {
      collection = new Models.BulkDeleteDocCollection(values, {
        databaseId: databaseId
      });

      assert.equal(collection.length, 3);
    });

    it('clears the memory if no errors happened', function () {
      collection.handleResponse([
        {'ok': true, 'id': '1', 'rev': '10-72cd2edbcc0d197ce96188a229a7af01'},
        {'ok': true, 'id': '2', 'rev': '6-da537822b9672a4b2f42adb1be04a5b1'}
      ], promise);

      assert.equal(collection.length, 1);
    });

    it('triggers a removed event with all ids', function () {
      collection.listenToOnce(collection, 'removed', function (ids) {
        assert.deepEqual(ids, ['Deferred', 'DeskSet']);
      });

      collection.handleResponse([
        {'ok': true, 'id': 'Deferred', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
        {'ok': true, 'id': 'DeskSet', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'}
      ], promise);
    });

    it('triggers a error event with all errored ids', function () {
      collection.listenToOnce(collection, 'error', function (ids) {
        assert.deepEqual(ids, ['Deferred']);
      });
      collection.handleResponse([
        {'error':'conflict', 'id':'Deferred', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
        {'ok':true, 'id':'DeskSet', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'}
      ], promise);
    });

    it('removes successfull deleted from the collection but keeps one with errors', function () {
      collection.handleResponse([
        {'error':'conflict', 'id':'1', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
        {'ok':true, 'id':'2', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'},
        {'error':'conflict', 'id':'3', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'}
      ], promise);
      assert.ok(collection.get('1'));
      assert.ok(collection.get('3'));
      assert.notOk(collection.get('2'));
    });

    it('triggers resolve for successful delete', function () {
      var spy = sinon.spy();
      promise.then(spy);

      collection.handleResponse([
        {'ok':true, 'id':'Deferred', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
        {'ok':true, 'id':'DeskSet', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'}
      ], promise);

      assert.ok(spy.calledOnce);

    });

    it('triggers resolve for successful delete with errors as well', function () {
      var spy = sinon.spy();
      promise.then(spy);
      var ids = {
        errorIds: ['1'],
        successIds: ['Deferred', 'DeskSet']
      };

      collection.handleResponse([
        {'ok':true, 'id':'Deferred', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
        {'ok':true, 'id':'DeskSet', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'},
        {'error':'conflict', 'id':'1', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
      ], promise);

      assert.ok(spy.calledWith(ids));
    });

    it('triggers reject for failed delete', function () {
      var spy = sinon.spy();
      promise.fail(spy);

      collection.handleResponse([
        {'error':'conflict', 'id':'1', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'}
      ], promise);

      assert.ok(spy.calledWith(['1']));

    });


  });
});
