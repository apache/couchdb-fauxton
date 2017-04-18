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
import { mount } from 'enzyme';
import sinon from "sinon";
import NewReplication from '../components/newreplication';
import Constants from '../constants';

const {assert, restore}  = utils;

describe('New Replication Component', () => {

  describe('validation', () => {

    FauxtonAPI.session.triggerError = () => {};

    afterEach(() => {
      restore(FauxtonAPI.addNotification);
    });

    it('returns true for local source and target selected', () => {
      const newreplication = mount(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"mydb"}
        localSource={"anotherdb"}
        updateFormField={() => {}}
        />);

      assert.ok(newreplication.instance().validate());
    });

    it('returns true for remote source and target selected', () => {
      const newreplication = mount(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE}
        remoteTarget={"mydb"}
        remoteSource={"anotherdb"}
        updateFormField={() => {}}
        />);

      assert.ok(newreplication.instance().validate());
    });

    it("warns if new local database exists", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');

      const newreplication = mount(<NewReplication
        databases={["existingdb"]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"existingdb"}
        localSource={"anotherdb"}
        updateFormField={() => {}}
        />);

      newreplication.instance().validate();
      assert.ok(spy.calledOnce);

      const notification = spy.args[0][0];
      assert.ok(/database already exists/.test(notification.msg));
    });

    it("warns if database name is wrong", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');

      const newreplication = mount(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"existing db"}
        localSource={"anotherdb"}
        updateFormField={() => {}}
        />);

      newreplication.instance().validate();
      assert.ok(spy.calledOnce);

      const notification = spy.args[0][0];
      assert.ok(/may not contain any spaces/.test(notification.msg));
    });

    it("warns if database is same for local", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');

      const newreplication = mount(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"samedb"}
        localSource={"samedb"}
        updateFormField={() => {}}
        />);

      newreplication.instance().validate();
      assert.ok(spy.calledOnce);

      const notification = spy.args[0][0];
      assert.ok(/Cannot replicate a database to itself/.test(notification.msg));
    });

    it("warns if database is same for remote", () => {
      const spy = sinon.spy(FauxtonAPI, 'addNotification');

      const newreplication = mount(<NewReplication
        databases={[]}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        remoteTarget={"samedb"}
        remoteSource={"samedb"}
        updateFormField={() => {}}
        />);

      newreplication.instance().validate();
      assert.ok(spy.calledOnce);

      const notification = spy.args[0][0];
      assert.ok(/Cannot replicate a database to itself/.test(notification.msg));
    });
  });

  describe('confirmButtonEnabled', () => {

    beforeEach(() => {
      sinon.stub(FauxtonAPI.session, 'fetchUser');
    });

    afterEach(() => {
      restore(FauxtonAPI.session.fetchUser);
    });

    it('returns false for default', () => {
      const newreplication = mount(<NewReplication
        updateFormField={() => {}}
        />);

      assert.notOk(newreplication.instance().confirmButtonEnabled());
    });

    it('returns false for empty remote source', () => {
      const newreplication = mount(<NewReplication
        updateFormField={() => {}}
        submittedNoChange={false}
        replicationSource={Constants.REPLICATION_SOURCE.REMOTE}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        locallocalTargetKnown={false}
        locallocalSourceKnown={false}
        />);

      assert.notOk(newreplication.instance().confirmButtonEnabled());
    });

    it('returns false for empty local source', () => {
      const newreplication = mount(<NewReplication
        updateFormField={() => {}}
        submittedNoChange={false}
        replicationSource={Constants.REPLICATION_SOURCE.REMOTE}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        locallocalTargetKnown={false}
        locallocalSourceKnown={false}
        remoteSource={'db'}
        />);


      assert.notOk(newreplication.instance().confirmButtonEnabled());
    });

    it("returns true for all details filled in", () => {
      const newreplication = mount(<NewReplication
        updateFormField={() => {}}
        submittedNoChange={false}
        replicationSource={Constants.REPLICATION_SOURCE.REMOTE}
        remoteSource={'db'}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        localTarget={"new-db"}
        locallocalTargetKnown={false}
        locallocalSourceKnown={false}
        />);


      assert.ok(newreplication.instance().confirmButtonEnabled());
    });

  });

  describe("runReplicationChecks", () => {

    beforeEach(() => {
      sinon.stub(FauxtonAPI.session, 'fetchUser');
    });

    afterEach(() => {
      restore(FauxtonAPI.session.fetchUser);
    });

    it("shows conflict modal for existing replication doc", () => {
      let called = false;
      const showConflictModal = () => { called = true;};
      const checkReplicationDocID = () => {
        const promise = FauxtonAPI.Deferred();
        promise.resolve(true);
        return promise;
      };
      const newreplication = mount(<NewReplication
        updateFormField={() => {}}
        replicationDocName="my-doc-id"
        checkReplicationDocID={checkReplicationDocID}
        showConflictModal={showConflictModal}
        />);

      newreplication.instance().runReplicationChecks();
      assert.ok(called);
    });

    it("Shows password modal", () => {
      let called = false;
      const showPasswordModal = () => {called = true;};
      const checkReplicationDocID = () => {
        const promise = FauxtonAPI.Deferred();
        promise.resolve(false);
        return promise;
      };
      const newreplication = mount(<NewReplication
        updateFormField={() => {}}
        replicationDocName="my-doc-id"
        checkReplicationDocID={checkReplicationDocID}
        />);

      newreplication.instance().showPasswordModal = showPasswordModal;
      newreplication.instance().runReplicationChecks();
      assert.ok(called);
    });

  });

});
