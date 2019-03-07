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

import React from 'react';
import { mount } from 'enzyme';
import { ReplicationTarget } from '../components/target';
import Constants from '../constants';

describe('ReplicationTarget', () => {

  describe('NewTargetDatabaseOptionsRow', () => {

    const defaultProps = {
      databases: ["db1"],
      onTargetChange: () => {},
      onLocalTargetChange: () => {},
      onRemoteTargetChange: () => {},
      remoteTarget: "",
      localTarget: "",
      replicationTarget: Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE,
      onTargetDatabasePartitionedChange: () => {},
      targetDatabasePartitioned: false,
      allowNewPartitionedLocalDbs: false
    };

    it('Does not show partitioned option for existing remote database', () => {
      const repRemoteTarget = mount(<ReplicationTarget
        {...defaultProps}
        replicationTarget={Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE}
      />);

      expect(repRemoteTarget.find('input#target-db-is-partitioned').exists()).toBe(false);
    });

    it('Does not show partitioned option for existing local database', () => {
      const repLocalTarget = mount(<ReplicationTarget
        {...defaultProps}
        replicationTarget={Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE}
      />);

      expect(repLocalTarget.find('input#target-db-is-partitioned').exists()).toBe(false);
    });

    it('Shows partitioned option for new remote database', () => {
      const repRemoteTarget = mount(<ReplicationTarget
        {...defaultProps}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE}
      />);

      expect(repRemoteTarget.find('input#target-db-is-partitioned').exists()).toBe(true);
    });

    it('Shows partitioned option for new local database', () => {
      const repLocalTarget = mount(<ReplicationTarget
        {...defaultProps}
        replicationTarget={Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE}
        allowNewPartitionedLocalDbs={false}
      />);

      var input = repLocalTarget.find('input#target-db-is-partitioned');
      expect(input.exists()).toBe(true);
      expect(input.prop("disabled")).toBeTruthy();

      repLocalTarget.setProps({allowNewPartitionedLocalDbs: true});
      input = repLocalTarget.find('input#target-db-is-partitioned');
      expect(input.exists()).toBe(true);
      expect(input.prop("disabled")).toBeFalsy();
    });

  });

});
