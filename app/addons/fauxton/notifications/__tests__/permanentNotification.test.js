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
import { PermanentNotification } from "../notifications";
import Stores from "../stores";
import FauxtonAPI from "../../../../core/api";
import ActionTypes from "../actiontypes";
import { mount } from "enzyme";
import React from "react";
import ReactDOM from "react-dom";

const store = Stores.notificationStore;

describe('PermanentNotification', () => {
  beforeEach(() => {
    store.reset();
  });

  it('doesn\'t render content by default', () => {
    const wrapper = mount(<PermanentNotification />);
    expect(wrapper.find('.perma-warning__content').length).toBe(0);
  });

  it('shows/hides content when the display flag is switched', () => {
    const wrapper = mount(<PermanentNotification />);

    FauxtonAPI.dispatch({
      type: ActionTypes.SHOW_PERMANENT_NOTIFICATION,
      options: {
        msg: "Hello World!"
      }
    });

    expect(wrapper.find('.perma-warning__content').html()).toMatch(/Hello World!/);

    FauxtonAPI.dispatch({
      type: ActionTypes.HIDE_PERMANENT_NOTIFICATION
    });

    expect(wrapper.find('.perma-warning__content').length).toBe(0);
  });
});
