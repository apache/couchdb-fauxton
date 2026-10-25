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

import {
  replicate,
  getReplicationStateFrom,
  deleteDocs,
  setPageLimit,
} from '../actions';
import ActionTypes from '../actiontypes';
import fetchMock from 'fetch-mock';
import FauxtonAPI from '../../../core/api';
import utils from '../../../core/utils';
import { stub } from 'sinon';

FauxtonAPI.session = {
  user () {
    return {
      name: 'test-user-name'
    };
  }
};

describe("Replication Actions:", () => {

  describe('replicate', () => {

    afterEach(() => {
      fetchMock.reset();
    });

    it('creates a new database if it does not exist', () => {
      const dispatch = () => {};
      const pageLimit = 20;
      fetchMock.postOnce('./_replicator', {
        status: 404,
        body: {
          error: "not_found",
          reason: "Database does not exist."
        }
      });

      fetchMock.putOnce('./_replicator', {
        status: 200,
        body: {
          ok: true
        }
      });

      const finalPost = fetchMock.postOnce('./_replicator', {
        status: 200,
        body: {
          ok: true
        }
      }, { overwriteRoutes: false });

      return replicate ({
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
      }, pageLimit)(dispatch).then(() => {
        finalPost.calls('./_replicator');
        expect(finalPost.calls('./_replicator').length).toBe(3);

        //fetchMock.done();
      });
    });

    it('does not try to create new database if it already exist', () => {
      const dispatch = () => {};
      const pageLimit = 20;
      const mockPost = fetchMock.postOnce('./_replicator', {
        status: 200,
        body: {
          ok: true
        }
      });

      return replicate ({
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
      }, pageLimit)(dispatch).then(() => {
        mockPost.calls('./_replicator');
        expect(mockPost.calls('./_replicator').length).toBe(1);
        fetchMock.done();
      });
    });
  });

  describe('getReplicationStateFrom', () => {
    const isLocalStub = stub(utils, 'isLocalToAppHost');

    afterEach(() => {
      fetchMock.reset();
      isLocalStub.reset();
    });

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
        "url": "http://localhost:8000/animaldb"
      },
      "target": {
        "headers": {
          "Authorization": "Basic dGVzdGVyOnRlc3RlcnBhc3M="
        },
        "url": "http://localhost:8000/boom123"
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
      "sourceAuthType":"BASIC_AUTH",
      "sourceAuth":{"username":"tester", "password":"testerpass"},
      "replicationTarget": "REPLICATION_TARGET_EXISTING_LOCAL_DATABASE",
      "localTarget": "boom123",
      "targetAuthType":"BASIC_AUTH",
      "targetAuth":{"username":"tester", "password":"testerpass"},
      "targetDatabasePartitioned": false
    };

    it('builds up correct state', (done) => {
      isLocalStub.returns(true);
      const dispatch = ({type, options}) => {
        if (ActionTypes.REPLICATION_SET_STATE_FROM_DOC === type) {
          expect(options).toEqual(docState);
          done();
        }
      };

      fetchMock.getOnce('./_replicator/7dcea9874a8fcb13c6630a1547001559', doc);
      getReplicationStateFrom(doc._id)(dispatch);
    });

    it('builds up correct state with custom auth', (done) => {
      isLocalStub.returns(true);
      const docWithCustomAuth = Object.assign(
        {}, doc, {
          "_id": "rep_custom_auth",
          "continuous": true,
          "source": {
            "headers": {},
            "url": "http://localhost:8000/animaldb",
            "auth": {
              "creds": "source_user_creds"
            }
          },
          "target": {
            "headers": {},
            "url": "http://localhost:8000/boom123",
            "auth": {
              "creds": "target_user_creds"
            }
          }
        });

      const docStateWithCustomAuth = {
        "replicationDocName": "rep_custom_auth",
        "replicationType": "REPLICATION_TYPE_CONTINUOUS",
        "replicationSource": "REPLICATION_SOURCE_LOCAL",
        "localSource": "animaldb",
        "sourceAuthType":"TEST_CUSTOM_AUTH",
        "sourceAuth":{"creds":"source_user_creds"},
        "replicationTarget": "REPLICATION_TARGET_EXISTING_LOCAL_DATABASE",
        "localTarget": "boom123",
        "targetAuthType":"TEST_CUSTOM_AUTH",
        "targetAuth":{"creds":"target_user_creds"},
        "targetDatabasePartitioned": false
      };
      FauxtonAPI.registerExtension('Replication:Auth', {
        typeValue: 'TEST_CUSTOM_AUTH',
        typeLabel: 'Test Custom Auth',
        getCredentials: (repSourceOrTarget) => {
          if (repSourceOrTarget.auth && repSourceOrTarget.auth.creds) {
            return { creds: repSourceOrTarget.auth.creds };
          }
          return undefined;
        }
      });
      const dispatch = ({type, options}) => {
        if (ActionTypes.REPLICATION_SET_STATE_FROM_DOC === type) {
          expect(options).toEqual(docStateWithCustomAuth);
          done();
        }
      };

      fetchMock.getOnce('./_replicator/rep_custom_auth', docWithCustomAuth);
      getReplicationStateFrom(docWithCustomAuth._id)(dispatch);
    });

    it('classifies remote URLs correctly', (done) => {
      isLocalStub.returns(false);
      const doc = {
        _id: 'remote-rep-1',
        _rev: '1-abc123',
        source: {
          headers: {
            Authorization: 'Basic dGVzdGVyOnRlc3RlcnBhc3M=',
          },
          url: 'http://remote-couchdb.example.com:5984/animaldb',
        },
        target: {
          headers: {
            Authorization: 'Basic dGVzdGVyOnRlc3RlcnBhc3M=',
          },
          url: 'http://localhost:5984/backupdb',
        },
        continuous: false,
        create_target: true,
        owner: 'tester',
        _replication_id: '90ff5a45623aa6821a6b0c20f5d3b5e8',
      };

      fetchMock.getOnce('./_replicator/remote-rep-1', doc);

      const dispatch = ({ type, options }) => {
        if (ActionTypes.REPLICATION_SET_STATE_FROM_DOC === type) {
          expect(options.replicationSource).toBe('REPLICATION_SOURCE_REMOTE');
          expect(options.remoteSource).toBe(
            'http://remote-couchdb.example.com:5984/animaldb',
          );
          expect(options.replicationTarget).toBe(
            'REPLICATION_TARGET_EXISTING_REMOTE_DATABASE',
          );
          expect(options.remoteTarget).toBe('http://localhost:5984/backupdb');
          done();
        }
      };

      getReplicationStateFrom('remote-rep-1')(dispatch);
    });

    it('classifies local URLs correctly', (done) => {
      isLocalStub.returns(true);
      const doc = {
        _id: 'substring-test',
        _rev: '1-ghi789',
        source: {
          headers: {
            Authorization: 'Basic dGVzdGVyOnRlc3RlcnBhc3M=',
          },
          url: 'http://localhost/source-db-local',
        },
        target: {
          headers: {
            Authorization: 'Basic dGVzdGVyOnRlc3RlcnBhc3M=',
          },
          url: 'http://localhost/source-db-local',
        },
        continuous: false,
        create_target: true,
        owner: 'tester',
        _replication_id: '90ff5a45623aa6821a6b0c20f5d3b5e8',
      };

      const dispatch = ({ type, options }) => {
        if (ActionTypes.REPLICATION_SET_STATE_FROM_DOC === type) {
          expect(options.replicationSource).toBe('REPLICATION_SOURCE_LOCAL');
          expect(options.replicationTarget).toBe(
            'REPLICATION_TARGET_EXISTING_LOCAL_DATABASE',
          );
          done();
        }
      };

      fetchMock.getOnce('./_replicator/substring-test', doc);
      getReplicationStateFrom('substring-test')(dispatch);
    });
  });

  describe('deleteDocs', () => {

    afterEach(() => {
      fetchMock.reset();
    });

    it('sends bulk doc request', (done) => {
      const resp = [
        {
          "ok": true,
          "id": "should-fail",
          "rev": "32-14e8495723c34271ef1391adf83defc2"
        },
        {
          "ok": true,
          "id": "my-cool-id",
          "rev": "3-f16f14d11708952b3d787846ef6ef8a9"
        }
      ];

      const docs = [
        {
          _id: "should-fail",
          _rev: "31-cdc233eb8a98e3aa3a87cd72f6a86301",
          raw: {
            _id: "should-fail",
            _rev: "31-cdc233eb8a98e3aa3a87cd72f6a86301"
          },
        },
        {
          _id: "my-cool-id",
          _rev: "2-da6af558740409e61d563769a8044a68",
          raw: {
            _id: "my-cool-id",
            _rev: "2-da6af558740409e61d563769a8044a68"
          }
        }
      ];
      const pageLimit = 20;

      fetchMock.getOnce('./_scheduler/jobs', 404);
      fetchMock.getOnce(`./_replicator/_all_docs?include_docs=true&limit=${pageLimit + 1}`, {rows: []});
      fetchMock.postOnce('./_replicator/_bulk_docs', {
        status: 200,
        body: resp
      });

      const dispatch = ({type}) => {
        if (ActionTypes.REPLICATION_CLEAR_SELECTED_DOCS === type) {
          done();
        }
      };

      deleteDocs(docs, pageLimit)(dispatch);
    });
  });

  describe('setPageLimit', () => {
    afterEach(() => {
      fetchMock.reset();
    });

    it('sends request for new replications list', (done) => {
      const pageLimit = 20;

      fetchMock.getOnce('./_scheduler/jobs', 404);
      fetchMock.getOnce(`./_replicator/_all_docs?include_docs=true&limit=${pageLimit + 1}`, {rows: []});

      const dispatch = ({type, options}) => {
        if (ActionTypes.REPLICATION_SET_PAGE_LIMIT === type) {
          expect(options).toEqual(pageLimit);
          done();
        }
      };

      setPageLimit(pageLimit)(dispatch);
    });
  });
});
