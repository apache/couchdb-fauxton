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
import React from "react";
import utils from "../../../../test/mocha/testUtils";
import FauxtonAPI from '../../../core/api';
import { shallow } from 'enzyme';
import sinon from "sinon";
import NewReplication from '../components/newreplication';
import Constants from '../constants';

const {restore}  = utils;

describe('New Replication Component', () => {

  describe('validation', () => {

    afterEach(() => {
      restore(FauxtonAPI.addNotification);
    });

    it('returns true for local source and target selected', () => {
      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"mydb"}
        localSource={"anotherdb"}
        replicationSource={""}
        replicationType={""}
        replicationDocName={""}
        remoteSource={""}
        remoteTarget={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      expect(newreplication.instance().checkSourceTargetDatabases()).toBeTruthy();
    });

    it('returns true for remote source and target selected', () => {
      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE}
        remoteTarget={"https://mydb.com/db2"}
        remoteSource={"https://mydb.com/db1"}
        localTarget={""}
        localSource={""}
        replicationSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      expect(newreplication.instance().checkSourceTargetDatabases()).toBeTruthy();
    });

    it('returns false for invalid remote source', () => {
      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE}
        remoteTarget={"https://mydb.com/db"}
        remoteSource={"anotherdb"}
        localTarget={""}
        localSource={""}
        replicationSource={Constants.REPLICATION_SOURCE.REMOTE}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      expect(newreplication.instance().checkSourceTargetDatabases()).toBeFalsy();
    });

    it('returns false for invalid remote target', () => {
      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE}
        remoteTarget={"anotherdb"}
        remoteSource={"https://mydb.com/db"}
        localTarget={""}
        localSource={""}
        replicationSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      expect(newreplication.instance().checkSourceTargetDatabases()).toBeFalsy();
    });

    it("warns if new local database exists", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');

      const newreplication = shallow(<NewReplication
        databases={["existingdb"]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"existingdb"}
        localSource={"anotherdb"}
        remoteTarget={""}
        remoteSource={""}
        replicationSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      newreplication.instance().checkSourceTargetDatabases();
      expect(spy.calledOnce).toBeTruthy();

      const notification = spy.args[0][0];
      expect(notification.msg).toMatch(/database already exists/);
    });

    it("warns if database name is wrong", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');

      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"existing db"}
        localSource={"anotherdb"}
        remoteTarget={""}
        remoteSource={""}
        replicationSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      newreplication.instance().checkSourceTargetDatabases();
      expect(spy.calledOnce).toBeTruthy();

      const notification = spy.args[0][0];
      expect(notification.msg).toMatch(/may not contain any spaces/);
    });

    it("warns if database is same for local", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');

      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"samedb"}
        localSource={"samedb"}
        remoteTarget={""}
        remoteSource={""}
        replicationSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      newreplication.instance().checkSourceTargetDatabases();
      expect(spy.calledOnce).toBeTruthy();

      const notification = spy.args[0][0];
      expect(notification.msg).toMatch(/Cannot replicate a database to itself/);
    });

    it("warns if database is same for remote", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');

      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        remoteTarget={"http://localhost/samedb"}
        remoteSource={"http://localhost/samedb"}
        localTarget={""}
        localSource={""}
        replicationSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      newreplication.instance().checkSourceTargetDatabases();
      expect(spy.calledOnce).toBeTruthy();

      const notification = spy.args[0][0];
      expect(notification.msg).toMatch(/Cannot replicate a database to itself/);
    });
  });

  describe('confirmButtonEnabled', () => {

    it('returns false for default', () => {
      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        remoteTarget={""}
        remoteSource={""}
        localTarget={""}
        localSource={""}
        replicationSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      expect(newreplication.instance().confirmButtonEnabled()).toBeFalsy();
    });

    it('returns false for empty remote source', () => {
      const newreplication = shallow(<NewReplication
        submittedNoChange={false}
        replicationSource={Constants.REPLICATION_SOURCE.REMOTE}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        locallocalTargetKnown={false}
        locallocalSourceKnown={false}
        databases={[]}
        remoteTarget={""}
        remoteSource={""}
        localTarget={""}
        localSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      expect(newreplication.instance().confirmButtonEnabled()).toBeFalsy();
    });

    it('returns false for empty local source', () => {
      const newreplication = shallow(<NewReplication
        submittedNoChange={false}
        replicationSource={Constants.REPLICATION_SOURCE.REMOTE}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        locallocalTargetKnown={false}
        locallocalSourceKnown={false}
        remoteSource={'db'}
        databases={[]}
        remoteTarget={""}
        localTarget={""}
        localSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);


      expect(newreplication.instance().confirmButtonEnabled()).toBeFalsy();
    });

    it("returns true for all details filled in", () => {
      const newreplication = shallow(<NewReplication
        submittedNoChange={false}
        replicationSource={Constants.REPLICATION_SOURCE.REMOTE}
        remoteSource={'db'}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"new-db"}
        locallocalTargetKnown={false}
        locallocalSourceKnown={false}
        databases={[]}
        remoteTarget={""}
        localSource={""}
        replicationType={""}
        replicationDocName={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);


      expect(newreplication.instance().confirmButtonEnabled()).toBeTruthy();
    });

  });

  describe("runReplicationChecks", () => {

    it("shows conflict modal for existing replication doc", (done) => {
      const showConflictModal = () => {
        expect(true).toBeTruthy();
        done();
      };

      const checkReplicationDocID = () => {
        const promise = FauxtonAPI.Deferred();
        promise.resolve(true);
        return promise;
      };
      const newreplication = shallow(<NewReplication
        replicationDocName="my-doc-id"
        checkReplicationDocID={checkReplicationDocID}
        showConflictModal={showConflictModal}
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        remoteTarget={""}
        remoteSource={""}
        localTarget={""}
        localSource={""}
        replicationSource={""}
        replicationType={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      newreplication.instance().runReplicationChecks();
    });

    it("calls auth checks", () => {
      let called = false;
      const checkAuth = () => {called = true;};
      const checkReplicationDocID = () => {
        const promise = FauxtonAPI.Deferred();
        promise.resolve(false);
        return promise;
      };
      const newreplication = shallow(<NewReplication
        replicationDocName={''}
        checkReplicationDocID={checkReplicationDocID}
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        remoteTarget={""}
        remoteSource={""}
        localTarget={""}
        localSource={""}
        replicationSource={""}
        replicationType={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      newreplication.instance().checkAuth = checkAuth;
      newreplication.instance().runReplicationChecks();
      expect(called).toBeTruthy();
    });

  });

  describe("checkAuth", () => {

    afterEach(() => {
      restore(FauxtonAPI.addNotification);
      FauxtonAPI.session = undefined;
    });

    it("prompts user for local target auth method", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');
      FauxtonAPI.session = {
        isAdminParty: () => false
      };
      const newreplication = shallow(<NewReplication
        replicationDocName="my-doc-id"
        checkReplicationDocID={() => {}}
        showConflictModal={() => {}}
        databases={[]}
        replicationSource={Constants.REPLICATION_SOURCE.REMOTE}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        targetAuthType={Constants.REPLICATION_AUTH_METHOD.NO_AUTH}
        remoteTarget={""}
        remoteSource={""}
        localTarget={""}
        localSource={""}
        replicationType={""}
        conflictModalVisible={false}
        clearReplicationForm={() => {}}
        hideConflictModal={() => {}}
        updateFormField={() => { return () => {}; }}
      />);

      newreplication.instance().checkAuth();
      sinon.assert.calledWith(spy, {
        msg: 'Missing credentials for local target database.',
        clear: true,
        type: 'error'
      });
    });
  });

});
