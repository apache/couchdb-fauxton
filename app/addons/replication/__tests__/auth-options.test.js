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

import { mount } from 'enzyme';
import React from "react";
import sinon from "sinon";
import utils from "../../../../test/mocha/testUtils";
import FauxtonAPI from '../../../core/api';
import { ReplicationAuth } from '../components/auth-options';
import Constants from '../constants';

const {restore}  = utils;

describe('ReplicationAuth', () => {

  describe('custom help shows up when correct auth type is selected', () => {

    afterEach(() => {
      restore(FauxtonAPI.getExtensions);
    });

    it('returns true for local source and target selected', () => {
      const testAuthHelp = {
        authType: Constants.REPLICATION_AUTH_METHOD.BASIC,
        helpText: 'test_help'
      };
      sinon.stub(FauxtonAPI, 'getExtensions').withArgs('Replication:Auth-help').returns([testAuthHelp]);

      const newRepAuth = mount(<ReplicationAuth
        authId="test-auth"
        authType=""
        credentials={{}}
        onChangeAuth={() => {}}
        onChangeAuthType={(newType) => {
          newRepAuth.setProps({authType: newType});
        }} />);

      expect(newRepAuth.find('div.replication__help-tile').exists()).toBe(false);
      newRepAuth.find('select#select-test-auth').first().simulate('change', {
        target: {
          value: 'BASIC_AUTH'
        }
      });
      // Help is displayed after selecting the associated auth type
      expect(newRepAuth.find('div.replication__help-tile').exists()).toBe(true);
    });
  });
});
