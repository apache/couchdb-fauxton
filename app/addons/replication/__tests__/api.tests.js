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
  combineDocsAndScheduler
} from '../api';
import Constants from '../constants';

const assert = utils.assert;

describe('Replication API', () => {

  describe('getSource', () => {

    it('encodes remote db', () => {
      const remoteSource = 'http://remote-couchdb.com/my/db/here';
      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
        remoteSource
      });

      assert.deepEqual(source, 'http://remote-couchdb.com/my%2Fdb%2Fhere');
    });

    it('returns local source with auth info and encoded', () => {
      const localSource = 'my/db';

      const source = getSource({
        replicationSource: Constants.REPLICATION_SOURCE.LOCAL,
        localSource,
        username: 'the-user',
        password: 'password'
      });

      assert.deepEqual(source.headers, {Authorization:"Basic dGhlLXVzZXI6cGFzc3dvcmQ="});
      assert.ok(/my%2Fdb/.test(source.url));
    });
  });

  describe('getTarget', () => {

    it('returns remote encoded target', () => {
      const remoteTarget = 'http://remote-couchdb.com/my/db';

      assert.deepEqual("http://remote-couchdb.com/my%2Fdb", getTarget({
        replicationTarget: Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE,
        remoteTarget: remoteTarget
      }));
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
      });

      assert.ok(/the-user:password@/.test(target));
      assert.ok(/my-new%2Fdb/.test(target));
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

  describe("combine docs and schedulerDocs", () => {
    const docs = [
      {
        "_id": "4cb18c43bf16b2f953026d4fd100073e",
        "_rev": "5-1163fecc6516aae02e031153ab4d5d19",
        "selected": false,
        "source": "https://examples.couchdb.com/db1",
        "target": "https://examples.couchdb.com/db1-rep",
        "createTarget": true,
        "continuous": false,
        "status": "error",
        "errorMsg": "unauthorized: unauthorized to access or create database https://examples.couchdb.com/db1/",
        "statusTime": null,
        "url": "#/database/_replicator/4cb18c43bf16b2f953026d4fd100073e",
      },
      {
        "_id": "c6540e08dafbcbb3800c25ab12000e75",
        "_rev": "3-386a0e83182f1ebff5c269e141e796b2",
        "selected": false,
        "source": "https://examples.couchdb.com/animaldb",
        "target": "https://examples.couchdb.com/animaldb-rep",
        "createTarget": true,
        "continuous": false,
        "status": "completed",
        "errorMsg": "",
        "statusTime": null,
        "url": "#/database/_replicator/c6540e08dafbcbb3800c25ab12000e75"
      }];

      const schedulerDocs = [{
          "database": "_replicator",
          "doc_id": "4cb18c43bf16b2f953026d4fd100073e",
          "id": "d5e24c90d8578f5c6eb043be147b3e39+create_target",
          "node": "node@couchdb",
          "source": "https://examples.couchdb.com/db1/",
          "target": "https://examples.couchdb.com/db1-rep",
          "state": "crashing",
          "info": "unauthorized: unauthorized to access or create database https://examples.couchdb.com/db1/",
          "error_count": 10,
          "last_updated": "2017-01-23T06:17:06Z",
          "start_time": "2017-01-16T11:38:24Z",
          "proxy": null
        },
        {
          "database": "_replicator",
          "doc_id": "c6540e08dafbcbb3800c25ab12000e75",
          "id": null,
          "state": "completed",
          "error_count": 0,
          "info": {
            "revisions_checked": 15,
            "missing_revisions_found": 15,
            "docs_read": 15,
            "docs_written": 15,
            "changes_pending": null,
            "doc_write_failures": 0,
            "checkpointed_source_seq": "44-g1AAAAGweJytz10KgkAQB_AhhYLqDnUBURyVnvIqM7trJn6AbM91s7rZtm0RIiI99DIDw8z_x9QA4JeehL1k0fUqlxyFQaP6s6aTCkTdXSS1OmiVru3qgoCPxpiq9Gjb2MEyOaBiUUjYfQOS6fuREs8onNvK1w-0cVAsEENMfskYSTgjtb6tcLPNYveXtnYaypQL5OFb2Z-wxxtzr60clhYUZURDLJqOqZ6FHoyT"
          },
          "last_updated": "2017-01-16T11:38:04Z",
          "start_time": "2017-01-16T11:38:02Z"
        }
      ];

      it("should parse and join the docs correctly", () => {
        const clonedDocs = docs.map(d => Object.assign({}, d));
        const [doc1, doc2] = combineDocsAndScheduler(clonedDocs, schedulerDocs);

        assert.deepEqual(doc2.status, "completed");

        assert.deepEqual(doc1.status, "crashing");
        assert.deepEqual(doc1.startTime, new Date("2017-01-16T11:38:24Z"));
        assert.deepEqual(doc1.stateTime, new Date("2017-01-23T06:17:06Z"));
      });

      it("won't crash on no scheduler docs", () => {
        const [doc1, doc2] = combineDocsAndScheduler(docs, []);

        assert.deepEqual(doc2.status, "completed");
        assert.deepEqual(doc1.status, "error");
      });
  });

});
