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

const {assert, restore}  = utils;

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

      assert.ok(newreplication.instance().validate());
    });

    it('returns true for remote source and target selected', () => {
      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE}
        remoteTarget={"mydb"}
        remoteSource={"anotherdb"}
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

      assert.ok(newreplication.instance().validate());
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

      newreplication.instance().validate();
      assert.ok(spy.calledOnce);

      const notification = spy.args[0][0];
      assert.ok(/database already exists/.test(notification.msg));
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

      newreplication.instance().validate();
      assert.ok(spy.calledOnce);

      const notification = spy.args[0][0];
      assert.ok(/may not contain any spaces/.test(notification.msg));
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

      newreplication.instance().validate();
      assert.ok(spy.calledOnce);

      const notification = spy.args[0][0];
      assert.ok(/Cannot replicate a database to itself/.test(notification.msg));
    });

    it("warns if database is same for remote", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');

      const newreplication = shallow(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        remoteTarget={"samedb"}
        remoteSource={"samedb"}
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

      newreplication.instance().validate();
      assert.ok(spy.calledOnce);

      const notification = spy.args[0][0];
      assert.ok(/Cannot replicate a database to itself/.test(notification.msg));
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

      assert.notOk(newreplication.instance().confirmButtonEnabled());
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

      assert.notOk(newreplication.instance().confirmButtonEnabled());
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


      assert.notOk(newreplication.instance().confirmButtonEnabled());
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


      assert.ok(newreplication.instance().confirmButtonEnabled());
    });

  });

  describe("runReplicationChecks", () => {

    it("shows conflict modal for existing replication doc", (done) => {
      const showConflictModal = () => {
        assert.ok(true);
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

    it("Shows password modal", () => {
      let called = false;
      const showPasswordModal = () => {called = true;};
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

      newreplication.instance().showPasswordModal = showPasswordModal;
      newreplication.instance().runReplicationChecks();
      assert.ok(called);
    });

  });

});
