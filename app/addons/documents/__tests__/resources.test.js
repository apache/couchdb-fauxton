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

import FauxtonAPI from "../../../core/api";
import Helpers from '../../../helpers';
import Models from "../resources";
import "../base";
import sinon from 'sinon';

describe('Document', () => {
  let doc;
  beforeEach(() => {
    doc = new Models.Doc({}, {});
  });

  it('does not remove an id attribute', () => {
    const res = doc.parse({
      _id: 'be31e531fe131bdf416b479ac1000484',
      _rev: '4-3a1b9f4b988b413e9245cd250769da72',
      id: 'foo'
    });
    expect(res.id).toBe('foo');
  });

  it('removes the id, if we create a document and get back an "id" instead of "_id"', () => {
    // if we take the document {"_id": "mycustomid", "_rev": "18-9cdeb1b121137233e3466b06a1780c29", id: "foo"}
    // and do a PUT request for an update, CouchDB will return:
    // {"ok":true,"id":"mycustomid","rev":"18-9cdeb1b121137233e3466b06a1780c29"}
    // and our Model will think it has the id "mycustomid" instead of "foo"
    const res = doc.parse({
      id: 'be31e531fe131bdf416b479ac1000484',
      _rev: '4-3a1b9f4b988b413e9245cd250769da72',
      ok: true
    });
    expect(res.id).toBeFalsy();
  });

  it('can return the doc url, if id given', () => {
    doc = new Models.Doc({_id: 'scholle'}, {
      database: {id: 'blerg', safeID: function () { return this.id; }}
    });

    expect(doc.url('apiurl')).toMatch(/\/blerg/);
  });

  it('will return the API url to create a new doc, if no doc exists yet', () => {
    doc = new Models.Doc({}, {
      database: {id: 'blerg', safeID: function () { return this.id; }}
    });

    expect(doc.url('apiurl')).toMatch(/\/blerg/);
  });
});

describe('AllDocs', () => {
  let collection;

  it('all-docs-list documents are always editable', () => {
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

    expect(collection.isEditable()).toBeTruthy();
  });
});

describe('NewDoc', () => {

  let getUUID;
  beforeEach(() => {
    getUUID = sinon.stub(Helpers, 'getUUID').resolves({ uuids: ['abc9876'] });
  });

  afterEach(() => {
    getUUID.restore();
  });

  it('adds partition key to auto-generated ID', () => {
    const newDoc = new Models.NewDoc(null, { database: {}, partitionKey: 'part_key' });
    return newDoc.fetch().then(() => {
      expect(newDoc.get('_id')).toMatch(/part_key:abc9876/);
    });
  });
});

describe('QueryParams', () => {
  describe('parse', () => {
    it('should not parse arbitrary parameters', () => {
      const params = {'foo': '[1]]'};
      const result = Models.QueryParams.parse(params);

      expect(result).toEqual(params);
    });

    it('parses startkey, endkey', () => {
      const params = {
        'startkey':'["a","b"]',
        'endkey':'["c","d"]'
      };
      const result = Models.QueryParams.parse(params);

      expect(result).toEqual({
        'startkey': ['a', 'b'],
        'endkey': ['c', 'd']
      });
    });

    it('parses key', () => {
      const params = {
        key:'[1,2]'
      };
      const result = Models.QueryParams.parse(params);

      expect(result).toEqual({'key': [1, 2]});
    });

    it('does not modify input', () => {
      const params = {
        key:'["a","b"]'
      };
      const clone = _.clone(params);
      Models.QueryParams.parse(params);
      expect(params).toEqual(clone);
    });
  });

  describe('stringify', () => {
    it('should not stringify arbitrary parameters', () => {
      const params = {'foo': [1, 2, 3]};
      const result = Models.QueryParams.stringify(params);

      expect(result).toEqual(params);
    });

    it('stringifies startkey, endkey', () => {
      const params = {
        'startkey': ['a', 'b'],
        'endkey': ['c', 'd']
      };

      const result = Models.QueryParams.stringify(params);

      expect(result).toEqual({
        'startkey':'["a","b"]',
        'endkey':'["c","d"]'
      });
    });

    it('stringifies key', () => {
      const params = {'key':['a', 'b']};
      const result = Models.QueryParams.stringify(params);

      expect(result).toEqual({ 'key': '["a","b"]' });
    });

    it('does not modify input', () => {
      const params = {'key': ['a', 'b']};
      const clone = _.clone(params);
      Models.QueryParams.stringify(params);

      expect(params).toEqual(clone);
    });

    it('is symmetrical with parse', () => {
      const params = {
        'startkey': ['a', 'b'],
        'endkey': ['c', 'd'],
        'foo': '[1,2]',
        'bar': 'abc'
      };

      const clone = _.clone(params);
      const json = Models.QueryParams.stringify(params);
      const result = Models.QueryParams.parse(json);

      expect(result).toEqual(clone);
    });
  });
});

describe('Bulk Delete', () => {
  let databaseId = 'ente',
      collection,
      promise,
      resolve,
      reject,
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

  beforeEach(() => {
    collection = new Models.BulkDeleteDocCollection(values, {
      databaseId: databaseId
    });

    promise = new FauxtonAPI.Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  });

  it('contains the models', () => {
    collection = new Models.BulkDeleteDocCollection(values, {
      databaseId: databaseId
    });

    expect(collection.length).toBe(3);
  });

  it('clears the memory if no errors happened', () => {
    collection.handleResponse([
      {'ok': true, 'id': '1', 'rev': '10-72cd2edbcc0d197ce96188a229a7af01'},
      {'ok': true, 'id': '2', 'rev': '6-da537822b9672a4b2f42adb1be04a5b1'}
    ], resolve, reject);

    return promise.then(() => {
      expect(collection.length).toBe(1);
    });
  });

  it('triggers a removed event with all ids', (done) => {
    collection.listenToOnce(collection, 'removed', function (ids) {
      expect(ids).toEqual(['Deferred', 'DeskSet']);
      done();
    });

    collection.handleResponse([
      {'ok': true, 'id': 'Deferred', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
      {'ok': true, 'id': 'DeskSet', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'}
    ], resolve, reject);
  });

  it('triggers a error event with all errored ids', (done) => {
    collection.listenToOnce(collection, 'error', function (ids) {
      done();
      expect(ids).toEqual(['Deferred']);
    });

    collection.handleResponse([
      {'error':'conflict', 'id':'Deferred', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
      {'ok':true, 'id':'DeskSet', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'}
    ], resolve, reject);
  });

  it('removes successfull deleted from the collection but keeps one with errors', () => {
    collection.handleResponse([
      {'error':'conflict', 'id':'1', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
      {'ok':true, 'id':'2', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'},
      {'error':'conflict', 'id':'3', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'}
    ], resolve, reject);

    return promise.then(() => {
      expect(collection.get('1')).toBeTruthy();
      expect(collection.get('3')).toBeTruthy();
      expect(collection.get('2')).toBeFalsy();
    });
  });

  it('triggers resolve for successful delete', () => {
    const spy = sinon.spy();
    promise.then(spy);

    collection.handleResponse([
      {'ok':true, 'id':'Deferred', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
      {'ok':true, 'id':'DeskSet', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'}
    ], resolve, reject);

    return promise.then(() => {
      expect(spy.calledOnce).toBeTruthy();
    });
  });

  it('triggers resolve for successful delete with errors as well', () => {
    const spy = sinon.spy();
    promise.then(spy);
    const ids = {
      errorIds: ['1'],
      successIds: ['Deferred', 'DeskSet']
    };

    collection.handleResponse([
      {'ok':true, 'id':'Deferred', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
      {'ok':true, 'id':'DeskSet', 'rev':'6-da537822b9672a4b2f42adb1be04a5b1'},
      {'error':'conflict', 'id':'1', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'},
    ], resolve, reject);

    return promise.then(() => {
      expect(spy.calledWith(ids)).toBeTruthy();
    });
  });

  it('triggers reject for failed delete', () => {
    collection.handleResponse([
      {'error':'conflict', 'id':'1', 'rev':'10-72cd2edbcc0d197ce96188a229a7af01'}
    ], resolve, reject);

    return promise.catch((errors) => {
      expect(errors).toEqual(['1']);
    });
  });

});
