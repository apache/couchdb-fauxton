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
import Views from "../notifications";
import Stores from "../stores";
import Actions from "../actions";
import utils from "../../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import {mount} from 'enzyme';
import sinon from "sinon";

const store = Stores.notificationStore;
const {restore, assert} = utils;

describe('NotificationPanel', () => {
  beforeEach(() => {
    store.reset();
  });

  afterEach(() => {
    restore(Actions.clearAllNotifications);
  });

  it('clear all action fires', () => {
    var stub = sinon.stub(Actions, 'clearAllNotifications');

    var panelEl = mount(<Views.NotificationCenterPanel
      notifications={[]}
      style={{x: 1}}
      filter={'all'}
      visible={true} />);

    panelEl.find('footer input').simulate('click');
    assert.ok(stub.calledOnce);
  });
});
