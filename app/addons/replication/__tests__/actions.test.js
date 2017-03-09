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
import {replicate, getReplicationStateFrom} from '../actions';
import ActionTypes from '../actiontypes';
import fetchMock from 'fetch-mock';
import app from '../../../app';
import FauxtonAPI from '../../../core/api';

app.session = {
  get () {
    return 'test-user-name';
  }
};

Object.defineProperty(window.location, 'origin', {
  writable: true,
  value: 'http://dev:8000'
});

const assert = utils.assert;

describe("Replication Actions", () => {

  describe('replicate', () => {
    afterEach(fetchMock.restore);

    it('creates a new database if it does not exist', (done) => {
      fetchMock.postOnce('/_replicator', {
        status: 404,
        body: {
          error: "not_found",
          reason: "Database does not exist."
        }
      });

      fetchMock.putOnce('/_replicator', {
        status: 200,
        body: {
          ok: true
        }
      });

      const finalPost = fetchMock.postOnce('/_replicator', {
        status: 200,
        body: {
          ok: true
        }
      });

      replicate ({
        localSource: "animaldb",
        localTarget: "boom123",
        password: "testerpass",
        remoteSource: "",
        remoteTarget: "",
        replicationDocName: "",
        replicationSource: "REPLICATION_SOURCE_LOCAL",
        replicationTarget: "REPLICATION_TARGET_NEW_LOCAL_DATABASE",
        replicationType: "",
        username: "tester"
      });

      //this is not pretty, and might cause some false errors. But its tricky to tell when this test has completed
      setTimeout(() => {
        assert.ok(finalPost.called('/_replicator'));
        done();
      }, 100);
    });
  });

  describe('getReplicationStateFrom', () => {
    const doc = {
      "_id": "7dcea9874a8fcb13c6630a1547001559",
      "_rev": "2-98d29cc74e77b6dc38f5fc0dcec0033c",
      "user_ctx": {
        "name": "tester",
        "roles": [
          "_admin",
          "_reader",
          "_writer"
        ]
      },
      "source": {
        "headers": {
          "Authorization": "Basic dGVzdGVyOnRlc3RlcnBhc3M="
        },
        "url": "http://dev:8000/animaldb"
      },
      "target": {
        "headers": {
          "Authorization": "Basic dGVzdGVyOnRlc3RlcnBhc3M="
        },
        "url": "http://dev:8000/boom123"
      },
      "create_target": true,
      "continuous": false,
      "owner": "tester",
      "_replication_id": "90ff5a45623aa6821a6b0c20f5d3b5e8"
    };

    const docState = {
      "replicationDocName": "7dcea9874a8fcb13c6630a1547001559",
      "replicationType": "REPLICATION_TYPE_ONE_TIME",
      "replicationSource": "REPLICATION_SOURCE_LOCAL",
      "localSource": "animaldb",
      "replicationTarget": "REPLICATION_TARGET_EXISTING_LOCAL_DATABASE",
      "localTarget": "boom123"
    };

    it('builds up correct state', (done) => {
      FauxtonAPI.dispatcher.register(({type, options}) => {
        if (ActionTypes.REPLICATION_SET_STATE_FROM_DOC === type) {
          assert.deepEqual(docState, options);
          done();
        }
      });

      fetchMock.getOnce('/_replicator/7dcea9874a8fcb13c6630a1547001559', doc);
      getReplicationStateFrom(doc._id);
    });
  });
});
