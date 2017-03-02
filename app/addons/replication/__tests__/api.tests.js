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
import utils from '../../../../test/mocha/testUtils';
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
  removeSensitiveUrlInfo
} from '../api';
import Constants from '../constants';

const assert = utils.assert;

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

      assert.deepEqual(source.url, 'http://remote-couchdb.com/my%2Fdb%2Fhere');
    });

    it('returns local source with auth info and encoded', () => {
      const localSource = 'my/db';

      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.LOCAL,
        localSource,
        username: 'the-user',
        password: 'password'
      }, {origin: 'http://dev:6767'});

      assert.deepEqual(source.headers, {Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      assert.ok(/my%2Fdb/.test(source.url));
    });

    it('returns remote source url and auth header', () => {
      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        remoteSource: 'http://eddie:my-password@my-couchdb.com/my-db',
        localSource: "local",
        username: 'the-user',
        password: 'password'
      }, {origin: 'http://dev:6767'});

      assert.deepEqual(source.headers, {Authorization:"Basic ZWRkaWU6bXktcGFzc3dvcmQ="});
      assert.deepEqual('http://my-couchdb.com/my-db', source.url);
    });
  });

  describe('getTarget', () => {

    it('returns remote encoded target', () => {
      const remoteTarget = 'http://remote-couchdb.com/my/db';

      assert.deepEqual("http://remote-couchdb.com/my%2Fdb", getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE,
        remoteTarget: remoteTarget
      }).url);
    });

    it("encodes username and password for remote", () => {
      const remoteTarget = 'http://jimi:my-password@remote-couchdb.com/my/db';
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE,
        remoteTarget: remoteTarget,
        username: 'fake',
        password: 'fake'
      });

      assert.deepEqual(target.url, 'http://remote-couchdb.com/my%2Fdb');
      assert.deepEqual(target.headers, {Authorization:"Basic amltaTpteS1wYXNzd29yZA=="});
    });

    it('returns existing local database', () => {
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE,
        localTarget: 'my-existing/db',
        username: 'the-user',
        password: 'password'
      });

      assert.deepEqual(target.headers, {Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      assert.ok(/my-existing%2Fdb/.test(target.url));
    });

    it('returns new local database', () => {
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE,
        replicationSource: Constants.REPLICATION_SOURCE.LOCAL,
        localTarget: 'my-new/db',
        username: 'the-user',
        password: 'password'
      });

      assert.deepEqual(target.headers, {Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      assert.ok(/my-new%2Fdb/.test(target.url));
    });

    it('returns new local for remote source', () => {
      const target = getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE,
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        localTarget: 'my-new/db',
        username: 'the-user',
        password: 'password'
      }, {origin: 'http://dev:5555'});

      assert.deepEqual(target.headers, {Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      assert.ok(/my-new%2Fdb/.test(target.url));
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

      assert.deepEqual("http://dev:8000/my-new%2Fdb", target.url);
      assert.deepEqual({}, target.headers);
    });

  });

  describe('continuous', () => {

    it('returns true for continuous', () => {
      assert.ok(continuous(Constants.REPLICATION_TYPE.CONTINUOUS));
    });

    it('returns false for once', () => {
      assert.notOk(continuous(Constants.REPLICATION_TYPE.ONE_TIME));
    });
  });

  describe('create target', () => {

    it('returns true for new local', () => {
      assert.ok(createTarget(Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE));
    });

    it('returns true for new remote', () => {
      assert.ok(createTarget(Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE));
    });

    it('returns false for existing', () => {
      assert.notOk(createTarget(Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE));
    });

  });

  describe('addDocId', () => {

    it('adds doc id if it exists', () => {
      const docId = 'docId';

      assert.deepEqual(
        addDocIdAndRev(docId, null,  {}), {
          _id: docId
        });
    });

    it('adds doc and Rev if it exists', () => {
      const docId = 'docId';
      const _rev = "1-rev123";

      assert.deepEqual(
        addDocIdAndRev(docId, _rev, {}), {
          _id: docId,
          _rev: _rev
        });
    });

    it('does not add doc id if it does not exists', () => {
      assert.deepEqual(
        addDocIdAndRev(null, null, {}), {});
    });
  });

  describe("getDocUrl", () => {
    it("scrubs passwords and decodes", () => {
      const url = "http://userone:theirpassword@couchdb-host.com/my%2Fdb%2fhere";
      const cleanedUrl = "http://couchdb-host.com/my/db/here";

      assert.deepEqual(getDocUrl(url), cleanedUrl);
    });
  });

  describe("encodeFullUrl", () => {
    it("encodes db correctly", () => {
      const url = "http://dev:5984/boom/aaaa";
      const encodedUrl = encodeFullUrl(url);

      assert.deepEqual("http://dev:5984/boom%2Faaaa", encodedUrl);
    });

  });

  describe("decodeFullUrl", () => {

    it("encodes db correctly", () => {
      const url = "http://dev:5984/boom%2Faaaa";
      const encodedUrl = decodeFullUrl(url);

      assert.deepEqual("http://dev:5984/boom/aaaa", encodedUrl);
    });

  });

  describe("getCredentialsFromUrl", () => {

    it("can get username and password", () => {
      const {username, password } = getCredentialsFromUrl("https://bob:marley@my-couchdb.com/db");

      assert.deepEqual(username, 'bob');
      assert.deepEqual(password, 'marley');
    });

    it("can get username and password with special characters", () => {
      const {username, password } = getCredentialsFromUrl("http://bob:m@:/rley@my-couchdb.com/db");

      assert.deepEqual(username, 'bob');
      assert.deepEqual(password, 'm@:/rley');
    });

    it("returns nothing for no username and password", () => {
      const {username, password } = getCredentialsFromUrl("http://my-couchdb.com/db");

      assert.deepEqual(username, '');
      assert.deepEqual(password, '');
    });
  });

  describe("removeCredentialsFromUrl", () => {

    it("can remove username and password", () => {
      const url = removeCredentialsFromUrl("https://bob:marley@my-couchdb.com/db");
      assert.deepEqual(url, 'https://my-couchdb.com/db');
    });

    it("returns url if no password", () => {
      const url = removeCredentialsFromUrl("https://my-couchdb.com/db");
      assert.deepEqual(url, 'https://my-couchdb.com/db');
    });

    it("can remove username and password with special characters", () => {
      const url = removeCredentialsFromUrl("https://bob:m@:/rley@my-couchdb.com/db");
      assert.deepEqual(url, 'https://my-couchdb.com/db');
    });

  });
});
