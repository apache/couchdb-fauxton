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
      "docs":[
        {
          "_id": "c94d4839d1897105cb75e1251e0003ea",
          "_rev": "3-4559cb522de85ce03bd0e1991025e89a",
          "user_ctx": {
            "name": "tester",
            "roles": ["_admin", "_reader", "_writer"]
          },
          "source": {
            "headers": {
              "Authorization": "Basic dGVzdGVyOnRlc3RlcnBhc3M="
            },
            "url": "http://dev:5984/animaldb"
          },
          "target": {
            "headers": {
              "Authorization": "Basic dGVzdGVyOnRlc3RlcnBhc3M="
            },
            "url": "http://dev:5984/animaldb-clone"
          },
          "create_target": true,
          "continuous": false,
          "owner": "tester",
          "_replication_state": "completed",
          "_replication_state_time": "2017-02-28T12:16:28+00:00",
          "_replication_id": "0ce2939af29317b5dbe11c15570ddfda",
          "_replication_stats": {
            "revisions_checked": 14,
            "missing_revisions_found": 14,
            "docs_read": 14,
            "docs_written": 14,
            "changes_pending": null,
            "doc_write_failures": 0,
            "checkpointed_source_seq": "15-g1AAAAJDeJyV0N0NgjAQAOAKRnlzBJ3AcKWl9Uk20ZbSEII4gm6im-gmugke1AQJ8aFpck3u50vuakJIVIaGrJqzKSADKrYxPqixECii123bVmWoFidMLGVsqEjYtP0voTcY9f6rzHqFKcglsz5K1imHkcJTnoJVPsqxUy4jxepEioJ7KM0cI7nih9BtkDSlkAif2zjp7qRHJwW9lLNdDkZ6S08nvQZJMsNT4b_d20k_d4oVE1aK6VT1AXTajes"
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
        fetchMock.getOnce('/_scheduler/jobs', 404);
        fetchMock.post((url,  options) => {
          const body = JSON.parse(options.body);
          return url === "/_replicator/_find"
            && body.limit === 6
            && body.skip === 0;
        }, _repDocs);
        return supportNewApi(true)
          .then(() => fetchReplicationDocs({docsPerPage: 5, page: 1}))
          .then(({docs}) => {
            expect(docs).toHaveLength(1);
            expect(docs[0]._id).toBe("c94d4839d1897105cb75e1251e0003ea");
          });
      });

      it("paginates to page 2 correctly", () => {
        fetchMock.getOnce('/_scheduler/jobs', 200);
        fetchMock.post((url,  options) => {
          const body = JSON.parse(options.body);
          return url === "/_replicator/_find"
            && body.limit === 11
            && body.skip === 10;
        }, _repDocs);
        fetchMock.get('/_scheduler/docs?limit=11&skip=10', _schedDocs);
        return supportNewApi(true)
          .then(() => fetchReplicationDocs({docsPerPage: 10, page: 2}))
          .then(({canShowNext}) => {
            expect(canShowNext).toBeFalsy;
          });
      });

      it("sets canShowNext true and trims docs correctly", () => {
        const clonedDoc = _repDocs.docs[2];
        const repDocs = {
          docs: [{
            ...clonedDoc,
            _id: '1',
          }, {
            ...clonedDoc,
            _id: '2',
          }, {

            ...clonedDoc,
            _id: '3',
          }, {
            ...clonedDoc,
            _id: '4',
          }]
        };

        fetchMock.getOnce('/_scheduler/jobs', 200);
        fetchMock.post((url,  options) => {
          const body = JSON.parse(options.body);
          return url === "/_replicator/_find"
            && body.limit === 4
            && body.skip === 6;
        }, repDocs);
        fetchMock.get('/_scheduler/docs?limit=4&skip=6', _schedDocs);
        return supportNewApi(true)
          .then(() => fetchReplicationDocs({docsPerPage: 3, page: 3}))
          .then(({docs, canShowNext}) => {
            expect(canShowNext).toBeTruthy();
            expect(docs).toHaveLength(3);
          });
      });
    });

    describe('new api', () => {
      afterEach(() => {
        fetchMock.reset();
      });

      it("returns parsedReplicationDocs", () => {
        fetchMock.getOnce('/_scheduler/jobs', 200);
        fetchMock.post((url,  options) => {
          const body = JSON.parse(options.body);
          return url === "/_replicator/_find"
            && body.limit === 6
            && body.skip === 0;
        }, _repDocs);
        fetchMock.get('/_scheduler/docs?limit=6&skip=0', _schedDocs);
        return supportNewApi(true)
          .then(() => fetchReplicationDocs({docsPerPage: 5, page: 1}))
          .then(({docs}) => {
            expect(docs).toHaveLength(1);
            expect(docs[0]._id).toBe("c94d4839d1897105cb75e1251e0003ea");
            expect(docs[0].stateTime.toDateString()).toBe(new Date('2017-03-07T14:46:17').toDateString());
          });
      });

      it("paginates to page 2 correctly", () => {
        fetchMock.getOnce('/_scheduler/jobs', 200);
        fetchMock.post((url,  options) => {
          const body = JSON.parse(options.body);
          return url === "/_replicator/_find"
            && body.limit === 11
            && body.skip === 10;
        }, _repDocs);
        fetchMock.get('/_scheduler/docs?limit=11&skip=10', _schedDocs);
        return supportNewApi(true)
          .then(() => fetchReplicationDocs({docsPerPage: 10, page: 2}))
          .then(({canShowNext}) => {
            expect(canShowNext).toBeFalsy();
          });
      });

      it("sets canShowNext true and trims docs correctly", () => {
        const clonedDoc = _repDocs.docs[2];
        const repDocs = {
          docs: [{
            ...clonedDoc,
            _id: '1',
          }, {
            ...clonedDoc,
            _id: '2',
          }, {

            ...clonedDoc,
            _id: '3',
          }, {
            ...clonedDoc,
            _id: '4',
          }]
        };

        fetchMock.getOnce('/_scheduler/jobs', 200);
        fetchMock.post((url,  options) => {
          const body = JSON.parse(options.body);
          return url === "/_replicator/_find"
            && body.limit === 4
            && body.skip === 6;
        }, repDocs);
        fetchMock.get('/_scheduler/docs?limit=4&skip=6', _schedDocs);
        return supportNewApi(true)
          .then(() => fetchReplicationDocs({docsPerPage: 3, page: 3}))
          .then(({docs, canShowNext}) => {
            expect(canShowNext).toBeTruthy();
            expect(docs).toHaveLength(3);
          });
      });
    });
  });
});
