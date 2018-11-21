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
import FauxtonAPI from '../../../core/api';
import {
  getSource,
  getTarget,
  continuous,
  createTarget,
  addDocIdAndRev,
  getDocUrl,
  encodeFullUrl,
  decodeFullUrl,
  getCredentialsFromUrl,
  removeCredentialsFromUrl,
  removeSensitiveUrlInfo,
  supportNewApi,
  fetchReplicationDocs
} from '../api';
import Constants from '../constants';
import fetchMock from 'fetch-mock';

describe('Replication API', () => {

  describe("removeSensiteiveUrlInfo", () => {
    it('removes password username', () => {
      const url = 'http://tester:testerpass@127.0.0.1/fancy/db/name';

      const res = removeSensitiveUrlInfo(url);

      expect(res).toBe('http://127.0.0.1/fancy/db/name');
    });

    // see https://issues.apache.org/jira/browse/COUCHDB-3257
    // CouchDB accepts and returns invalid urls
    it('does not throw on invalid urls', () => {
      const url = 'http://tester:tes#terpass@127.0.0.1/fancy/db/name';

      const res = removeSensitiveUrlInfo(url);

      expect(res).toBe('http://tester:tes#terpass@127.0.0.1/fancy/db/name');
    });
  });

  describe('getSource', () => {

    it('encodes remote db', () => {
      const remoteSource = 'http://remote-couchdb.com/my/db/here';
      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        remoteSource
      });

      expect(source.url).toEqual('http://remote-couchdb.com/my%2Fdb%2Fhere');
    });

    it('returns local source with auth info and encoded', () => {
      const localSource = 'my/db';
      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.LOCAL,
        localSource,
        sourceAuth: {
          username: 'the-user',
          password: 'password'
        },
        sourceAuthType: Constants.REPLICATION_AUTH_METHOD.BASIC
      }, {origin: 'http://dev:6767'});

      expect(source.headers).toEqual({Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      expect(source.url).toMatch(/my%2Fdb/);
    });

    it('returns local source with auth info and encoded when use relative url', () => {
      const localSource = 'my/db';
      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.LOCAL,
        localSource,
        sourceAuth: {
          username: 'the-user',
          password: 'password'
        },
        sourceAuthType: Constants.REPLICATION_AUTH_METHOD.BASIC
      }, {origin: 'http://dev:6767', pathname:'/db/_utils'});

      expect(source.headers).toEqual({Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      expect(source.url).toMatch(/\/db\/my%2Fdb/);
    });

    it('returns remote source url and auth header', () => {
      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        remoteSource: 'http://my-couchdb.com/my-db',
        localSource: "local",
        sourceAuth: {
          username: 'the-user',
          password: 'password'
        },
        sourceAuthType: Constants.REPLICATION_AUTH_METHOD.BASIC
      }, {origin: 'http://dev:6767'});

      expect(source.headers).toEqual({Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      expect(source.url).toBe('http://my-couchdb.com/my-db');
    });

    it('returns source with no auth', () => {
      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        remoteSource: 'http://my-couchdb.com/my-db',
        localSource: "local",
        sourceAuth: {
          username: 'the-user',
          password: 'password'
        },
        sourceAuthType: Constants.REPLICATION_AUTH_METHOD.NO_AUTH
      }, {origin: 'http://dev:6767'});

      expect(source.headers).toEqual({});

      const source2 = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        remoteSource: 'http://my-couchdb.com/my-db',
        localSource: "local"
      }, {origin: 'http://dev:6767'});

      expect(source2.headers).toEqual({});
    });

    it('returns source with custom auth', () => {
      FauxtonAPI.registerExtension('Replication:Auth', {
        typeValue: 'TEST_CUSTOM_AUTH',
        typeLabel: 'Test Custom Auth',
        setCredentials: (repSourceOrTarget, auth) => {
          repSourceOrTarget.auth = {
            auth_creds: auth.creds
          };
        }
      });
      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        remoteSource: 'http://my-couchdb.com/my-db',
        localSource: "local",
        sourceAuth: { creds: 'sample_creds' },
        sourceAuthType: 'TEST_CUSTOM_AUTH'
      }, {origin: 'http://dev:6767'});

      expect(source.auth).toEqual({ auth_creds: 'sample_creds' });
    });
  });

  describe('getTarget', () => {

    it('returns remote encoded target', () => {
      const remoteTarget = 'http://remote-couchdb.com/my/db';

      const url = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE,
        remoteTarget: remoteTarget
      }).url;
      expect(url).toBe("http://remote-couchdb.com/my%2Fdb");
    });

    it("encodes username and password for remote", () => {
      const remoteTarget = 'http://remote-couchdb.com/my/db';
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE,
        remoteTarget: remoteTarget,
        targetAuth: {
          username: 'jimi',
          password: 'my-password'
        },
        targetAuthType: Constants.REPLICATION_AUTH_METHOD.BASIC
      });

      expect(target.url).toEqual('http://remote-couchdb.com/my%2Fdb');
      expect(target.headers).toEqual({Authorization:"Basic amltaTpteS1wYXNzd29yZA=="});
    });

    it('returns existing local database', () => {
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE,
        localTarget: 'my-existing/db',
        targetAuth: {
          username: 'the-user',
          password: 'password'
        },
        targetAuthType: Constants.REPLICATION_AUTH_METHOD.BASIC
      });

      expect(target.headers).toEqual({Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      expect(target.url).toMatch(/my-existing%2Fdb/);
    });

    it('returns existing local database even with relative urls', () => {
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE,
        localTarget: 'my-existing/db',
        targetAuth: {
          username: 'the-user',
          password: 'password'
        },
        targetAuthType: Constants.REPLICATION_AUTH_METHOD.BASIC
      }, {origin:'http://dev:6767', pathname:'/db/_utils'});

      expect(target.headers).toEqual({Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      expect(target.url).toMatch(/my-existing%2Fdb/);
    });

    it('returns new local database', () => {
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE,
        replicationSource: Constants.REPLICATION_SOURCE.LOCAL,
        localTarget: 'my-new/db',
        targetAuth: {
          username: 'the-user',
          password: 'password'
        },
        targetAuthType: Constants.REPLICATION_AUTH_METHOD.BASIC
      });

      expect(target.headers).toEqual({Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      expect(target.url).toMatch(/my-new%2Fdb/);
    });

    it('returns new local for remote source', () => {
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE,
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        localTarget: 'my-new/db',
        targetAuth: {
          username: 'the-user',
          password: 'password'
        },
        targetAuthType: Constants.REPLICATION_AUTH_METHOD.BASIC
      }, {origin: 'http://dev:5555'});

      expect(target.headers).toEqual({Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      expect(target.url).toMatch(/my-new%2Fdb/);
    });

    it("doesn't encode username and password if it is not supplied", () => {
      const location = {
        host: "dev:8000",
        hostname: "dev",
        href: "http://dev:8000/#database/animaldb/_all_docs",
        origin: "http://dev:8000",
        pathname: "/",
        port: "8000",
        protocol: "http:",
      };

      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE,
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        localTarget: 'my-new/db'
      }, location);

      expect(target.url).toBe("http://dev:8000/my-new%2Fdb");
      expect(target.headers).toEqual({});

      const targetNoAuth = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE,
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        localTarget: 'my-new/db',
        targetAuthType: Constants.REPLICATION_AUTH_METHOD.NO_AUTH
      }, location);
      expect(targetNoAuth.headers).toEqual({});
    });

    it('returns target with custom auth', () => {
      FauxtonAPI.registerExtension('Replication:Auth', {
        typeValue: 'TEST_CUSTOM_AUTH',
        typeLabel: 'Test Custom Auth',
        setCredentials: (repSourceOrTarget, auth) => {
          repSourceOrTarget.auth = {
            auth_creds: auth.creds
          };
        }
      });
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE,
        replicationSource: Constants.REPLICATION_SOURCE.LOCAL,
        localTarget: 'my-new/db',
        targetAuth: { creds: 'sample_creds' },
        targetAuthType: 'TEST_CUSTOM_AUTH'
      });

      expect(target.auth).toEqual({ auth_creds: 'sample_creds' });
    });

  });

  describe('continuous', () => {

    it('returns true for continuous', () => {
      expect(continuous(Constants.REPLICATION_TYPE.CONTINUOUS)).toBeTruthy();
    });

    it('returns false for once', () => {
      expect(continuous(Constants.REPLICATION_TYPE.ONE_TIME)).toBeFalsy();
    });
  });

  describe('create target', () => {

    it('returns true for new local', () => {
      expect(createTarget(Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE)).toBeTruthy();
    });

    it('returns true for new remote', () => {
      expect(createTarget(Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE)).toBeTruthy();
    });

    it('returns false for existing', () => {
      expect(createTarget(Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE)).toBeFalsy();
    });

  });

  describe('addDocId', () => {

    it('adds doc id if it exists', () => {
      const docId = 'docId';

      expect(addDocIdAndRev(docId, null,  {})).toEqual({
        _id: docId
      });
    });

    it('adds doc and Rev if it exists', () => {
      const docId = 'docId';
      const _rev = "1-rev123";

      expect(addDocIdAndRev(docId, _rev, {})).toEqual({
        _id: docId,
        _rev: _rev
      });
    });

    it('does not add doc id if it does not exists', () => {
      expect(addDocIdAndRev(null, null, {})).toEqual({});
    });
  });

  describe("getDocUrl", () => {
    it("scrubs passwords and decodes", () => {
      const url = "http://userone:theirpassword@couchdb-host.com/my%2Fdb%2fhere";
      const cleanedUrl = "http://couchdb-host.com/my/db/here";

      expect(getDocUrl(url)).toEqual(cleanedUrl);
    });
  });

  describe("encodeFullUrl", () => {
    it("encodes db correctly", () => {
      const url = "http://dev:5984/boom/aaaa";
      const encodedUrl = encodeFullUrl(url);

      expect(encodedUrl).toBe("http://dev:5984/boom%2Faaaa");
    });

  });

  describe("decodeFullUrl", () => {

    it("encodes db correctly", () => {
      const url = "http://dev:5984/boom%2Faaaa";
      const encodedUrl = decodeFullUrl(url);

      expect(encodedUrl).toBe("http://dev:5984/boom/aaaa");
    });

  });

  describe("getCredentialsFromUrl", () => {

    it("can get username and password", () => {
      const {username, password } = getCredentialsFromUrl("https://bob:marley@my-couchdb.com/db");

      expect(username).toBe('bob');
      expect(password).toBe('marley');
    });

    it("can get username and password with special characters", () => {
      const {username, password } = getCredentialsFromUrl("http://bob:m@:/rley@my-couchdb.com/db");

      expect(username).toBe('bob');
      expect(password).toBe('m@:/rley');
    });

    it("returns nothing for no username and password", () => {
      const {username, password } = getCredentialsFromUrl("http://my-couchdb.com/db");

      expect(username).toBe('');
      expect(password).toBe('');
    });
  });

  describe("removeCredentialsFromUrl", () => {

    it("can remove username and password", () => {
      const url = removeCredentialsFromUrl("https://bob:marley@my-couchdb.com/db");
      expect(url).toBe('https://my-couchdb.com/db');
    });

    it("returns url if no password", () => {
      const url = removeCredentialsFromUrl("https://my-couchdb.com/db");
      expect(url).toBe('https://my-couchdb.com/db');
    });

    it("can remove username and password with special characters", () => {
      const url = removeCredentialsFromUrl("https://bob:m@:/rley@my-couchdb.com/db");
      expect(url).toBe('https://my-couchdb.com/db');
    });
  });

  describe('supportNewApi', () => {
    afterEach(() => {
      fetchMock.reset();
    });

    it('returns true for support', () => {
      fetchMock.getOnce('./_scheduler/jobs', {});
      return supportNewApi(true)
        .then(resp => {
          expect(resp).toBeTruthy();
        });
    });

    it('returns false for no support', () => {
      fetchMock.getOnce('./_scheduler/jobs', {
        status: 404,
        body: {error: "missing"}
      });

      return supportNewApi(true)
        .then(resp => {
          expect(resp).toBeFalsy();
        });
    });

  });

  describe('setCredentials', () => {

    afterEach(() => {
      fetchMock.reset();
    });

    it('returns true for support', () => {
      fetchMock.getOnce('./_scheduler/jobs', {});
      return supportNewApi(true)
        .then(resp => {
          expect(resp).toBeTruthy();
        });
    });

    it('returns false for no support', () => {
      fetchMock.getOnce('./_scheduler/jobs', {
        status: 404,
        body: {error: "missing"}
      });

      return supportNewApi(true)
        .then(resp => {
          expect(resp).toBeFalsy();
        });
    });

  });

  describe("fetchReplicationDocs", () => {
    const _repDocs = {
      "total_rows":2,
      "offset":0,
      "rows":[
        {
          "id":"_design/_replicator",
          "key":"_design/_replicator",
          "value":{
            "rev":"1-1390740c4877979dbe8998382876556c"
          },
          "doc":{"_id":"_design/_replicator",
            "_rev":"1-1390740c4877979dbe8998382876556c",
            "language":"javascript",
            "validate_doc_update":"\n    function(newDoc, oldDoc, userCtx) {\n        function reportError(error_msg) {\n            log('Error writing document `' + newDoc._id +\n                '\\' to the replicator database: ' + error_msg);\n            throw({forbidden: error_msg});\n        }\n\n        function validateEndpoint(endpoint, fieldName) {\n            if ((typeof endpoint !== 'string') &&\n                ((typeof endpoint !== 'object') || (endpoint === null))) {\n\n                reportError('The `' + fieldName + '\\' property must exist' +\n                    ' and be either a string or an object.');\n            }\n\n            if (typeof endpoint === 'object') {\n                if ((typeof endpoint.url !== 'string') || !endpoint.url) {\n                    reportError('The url property must exist in the `' +\n                        fieldName + '\\' field and must be a non-empty string.');\n                }\n\n                if ((typeof endpoint.auth !== 'undefined') &&\n                    ((typeof endpoint.auth !== 'object') ||\n                        endpoint.auth === null)) {\n\n                    reportError('`' + fieldName +\n                        '.auth\\' must be a non-null object.');\n                }\n\n                if ((typeof endpoint.headers !== 'undefined') &&\n                    ((typeof endpoint.headers !== 'object') ||\n                        endpoint.headers === null)) {\n\n                    reportError('`' + fieldName +\n                        '.headers\\' must be a non-null object.');\n                }\n            }\n        }\n\n        var isReplicator = (userCtx.roles.indexOf('_replicator') >= 0);\n        var isAdmin = (userCtx.roles.indexOf('_admin') >= 0);\n\n        if (oldDoc && !newDoc._deleted && !isReplicator &&\n            (oldDoc._replication_state === 'triggered')) {\n            reportError('Only the replicator can edit replication documents ' +\n                'that are in the triggered state.');\n        }\n\n        if (!newDoc._deleted) {\n            validateEndpoint(newDoc.source, 'source');\n            validateEndpoint(newDoc.target, 'target');\n\n            if ((typeof newDoc.create_target !== 'undefined') &&\n                (typeof newDoc.create_target !== 'boolean')) {\n\n                reportError('The `create_target\\' field must be a boolean.');\n            }\n\n            if ((typeof newDoc.continuous !== 'undefined') &&\n                (typeof newDoc.continuous !== 'boolean')) {\n\n                reportError('The `continuous\\' field must be a boolean.');\n            }\n\n            if ((typeof newDoc.doc_ids !== 'undefined') &&\n                !isArray(newDoc.doc_ids)) {\n\n                reportError('The `doc_ids\\' field must be an array of strings.');\n            }\n\n            if ((typeof newDoc.selector !== 'undefined') &&\n                (typeof newDoc.selector !== 'object')) {\n\n                reportError('The `selector\\' field must be an object.');\n            }\n\n            if ((typeof newDoc.filter !== 'undefined') &&\n                ((typeof newDoc.filter !== 'string') || !newDoc.filter)) {\n\n                reportError('The `filter\\' field must be a non-empty string.');\n            }\n\n            if ((typeof newDoc.doc_ids !== 'undefined') &&\n                (typeof newDoc.selector !== 'undefined')) {\n\n                reportError('`doc_ids\\' field is incompatible with `selector\\'.');\n            }\n\n            if ( ((typeof newDoc.doc_ids !== 'undefined') ||\n                  (typeof newDoc.selector !== 'undefined')) &&\n                 (typeof newDoc.filter !== 'undefined') ) {\n\n                reportError('`filter\\' field is incompatible with `selector\\' and `doc_ids\\'.');\n            }\n\n            if ((typeof newDoc.query_params !== 'undefined') &&\n                ((typeof newDoc.query_params !== 'object') ||\n                    newDoc.query_params === null)) {\n\n                reportError('The `query_params\\' field must be an object.');\n            }\n\n            if (newDoc.user_ctx) {\n                var user_ctx = newDoc.user_ctx;\n\n                if ((typeof user_ctx !== 'object') || (user_ctx === null)) {\n                    reportError('The `user_ctx\\' property must be a ' +\n                        'non-null object.');\n                }\n\n                if (!(user_ctx.name === null ||\n                    (typeof user_ctx.name === 'undefined') ||\n                    ((typeof user_ctx.name === 'string') &&\n                        user_ctx.name.length > 0))) {\n\n                    reportError('The `user_ctx.name\\' property must be a ' +\n                        'non-empty string or null.');\n                }\n\n                if (!isAdmin && (user_ctx.name !== userCtx.name)) {\n                    reportError('The given `user_ctx.name\\' is not valid');\n                }\n\n                if (user_ctx.roles && !isArray(user_ctx.roles)) {\n                    reportError('The `user_ctx.roles\\' property must be ' +\n                        'an array of strings.');\n                }\n\n                if (!isAdmin && user_ctx.roles) {\n                    for (var i = 0; i < user_ctx.roles.length; i++) {\n                        var role = user_ctx.roles[i];\n\n                        if (typeof role !== 'string' || role.length === 0) {\n                            reportError('Roles must be non-empty strings.');\n                        }\n                        if (userCtx.roles.indexOf(role) === -1) {\n                            reportError('Invalid role (`' + role +\n                                '\\') in the `user_ctx\\'');\n                        }\n                    }\n                }\n            } else {\n                if (!isAdmin) {\n                    reportError('The `user_ctx\\' property is missing (it is ' +\n                       'optional for admins only).');\n                }\n            }\n        } else {\n            if (!isAdmin) {\n                if (!oldDoc.user_ctx || (oldDoc.user_ctx.name !== userCtx.name)) {\n                    reportError('Replication documents can only be deleted by ' +\n                        'admins or by the users who created them.');\n                }\n            }\n        }\n    }\n"
          }
        },
        {
          "id":"_design/filters",
          "key":"_design/filters",
          "value":{
            "rev":"1-1390740c4877979dbe8998382876556c"
          },
          "doc":{
            "_id":"_design/filters",
            "_rev":"1-1390740c4877979dbe8998382876556c",
            "filters": {
              "afilter": "\n function (doc, req) { if (doc.type === 'a-doc') { return true; } \n return false }"
            }
          }
        },
        {
          "id":"c94d4839d1897105cb75e1251e0003ea",
          "key":"c94d4839d1897105cb75e1251e0003ea",
          "value":{
            "rev":"3-4559cb522de85ce03bd0e1991025e89a"
          },
          "doc":{"_id":"c94d4839d1897105cb75e1251e0003ea",
            "_rev":"3-4559cb522de85ce03bd0e1991025e89a",
            "user_ctx":{
              "name":"tester",
              "roles":["_admin", "_reader", "_writer"]},
            "source":{
              "headers":{
                "Authorization":"Basic dGVzdGVyOnRlc3RlcnBhc3M="
              },
              "url":"http://dev:5984/animaldb"},
            "target":{
              "headers":{
                "Authorization":"Basic dGVzdGVyOnRlc3RlcnBhc3M="},
              "url":"http://dev:5984/animaldb-clone"
            },
            "create_target":true,
            "continuous":false,
            "owner":"tester",
            "_replication_state":"completed",
            "_replication_state_time":"2017-02-28T12:16:28+00:00",
            "_replication_id":"0ce2939af29317b5dbe11c15570ddfda",
            "_replication_stats":{
              "revisions_checked":14,
              "missing_revisions_found":14,
              "docs_read":14,
              "docs_written":14,
              "changes_pending":null,
              "doc_write_failures":0,
              "checkpointed_source_seq":"15-g1AAAAJDeJyV0N0NgjAQAOAKRnlzBJ3AcKWl9Uk20ZbSEII4gm6im-gmugke1AQJ8aFpck3u50vuakJIVIaGrJqzKSADKrYxPqixECii123bVmWoFidMLGVsqEjYtP0voTcY9f6rzHqFKcglsz5K1imHkcJTnoJVPsqxUy4jxepEioJ7KM0cI7nih9BtkDSlkAif2zjp7qRHJwW9lLNdDkZ6S08nvQZJMsNT4b_d20k_d4oVE1aK6VT1AXTajes"
            }
          }
        }
      ]};

    const _schedDocs = {
      "offset": 0,
      "docs": [
        {
          "database":"_replicator",
          "doc_id":"c94d4839d1897105cb75e1251e0003ea",
          "id":null,
          "state":"completed",
          "error_count":0,
          "info":{
            "revisions_checked":0,
            "missing_revisions_found":0,
            "docs_read":0,
            "docs_written":0,
            "changes_pending":null,
            "doc_write_failures":0,
            "checkpointed_source_seq":"56-g1AAAAGweJzLYWBgYMlgTmFQTElKzi9KdUhJMjTQy00tyixJTE_VS87JL01JzCvRy0styQEqZUpkSLL___9_VgZzIm8uUIDd1NIkNSk5LYVBAW6AKXb9aLYY47ElyQFIJtVDLeIBW2ScbGJiYGJKjBloNhnisSmPBUgyNAApoGX7QbaJg21LTDEwNE8zR_aWCVGW4VCFZNkBiGVgr3GALTNLSzQ0T0xEtgyHm7MAbEaMZw"},
          "last_updated":"2017-03-07T14:46:17Z",
          "start_time":"2017-03-07T14:46:16Z"
        }
      ],
      "total": 1
    };

    describe('old api', () => {
      afterEach(() => {
        fetchMock.reset();
      });

      it("returns parsedReplicationDocs and ignores all design docs", () => {
        fetchMock.getOnce('./_scheduler/jobs', 404);
        fetchMock.get('./_replicator/_all_docs?include_docs=true&limit=100', _repDocs);
        return supportNewApi(true)
          .then(fetchReplicationDocs)
          .then(docs => {
            expect(docs.length).toBe(1);
            expect(docs[0]._id).toBe("c94d4839d1897105cb75e1251e0003ea");
          });
      });
    });

    describe('new api', () => {
      afterEach(() => {
        fetchMock.reset();
      });

      it("returns parsedReplicationDocs", () => {
        fetchMock.getOnce('./_scheduler/jobs', 200);
        fetchMock.get('./_replicator/_all_docs?include_docs=true&limit=100', _repDocs);
        fetchMock.get('./_scheduler/docs?include_docs=true', _schedDocs);
        return supportNewApi(true)
          .then(fetchReplicationDocs)
          .then(docs => {
            expect(docs.length).toBe(1);
            expect(docs[0]._id).toBe("c94d4839d1897105cb75e1251e0003ea");
            expect(docs[0].stateTime.toDateString()).toBe((new Date('2017-03-07T14:46:17')).toDateString());
          });
      });
    });
  });
});
