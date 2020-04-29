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
import moment from "moment";
import { mount } from 'enzyme';
import sinon from 'sinon';
import NotificationCenterPanel from '../components/NotificationCenterPanel';
import NotificationPanelRow from '../components/NotificationPanelRow';

describe('NotificationPanelRow', () => {
  const notifications = {
    success: {
      toastId: 1,
      type: 'success',
      msg: 'Success!',
      cleanMsg: 'Success!',
      time: moment()
    },
    info: {
      toastId: 2,
      type: 'info',
      msg: 'Error!',
      cleanMsg: 'Error!',
      time: moment()
    },
    error: {
      toastId: 3,
      type: 'error',
      msg: 'Error!',
      cleanMsg: 'Error!',
      time: moment()
    }
  };

  const style = {
    opacity: 1,
    height: 64
  };

  const defaultProps = {
    style,
    isVisible: true,
    filter: 'all',
    clearSingleNotification: () => {}
  };

  it('shows all notification types when "all" filter applied', () => {
    const row1 = mount(<NotificationPanelRow
      {...defaultProps}
      item={notifications.success}
    />);

    expect(row1.find('li').prop('aria-hidden')).toBeFalsy();

    const row2 = mount(<NotificationPanelRow
      {...defaultProps}
      item={notifications.error}
    />
    );
    expect(row2.find('li').prop('aria-hidden')).toBeFalsy();

    const row3 = mount(<NotificationPanelRow
      {...defaultProps}
      item={notifications.info} />
    );
    expect(row3.find('li').prop('aria-hidden')).toBeFalsy();
  });

  it('hides notification when filter doesn\'t match', () => {
    var rowEl = mount(
      <NotificationPanelRow
        {...defaultProps}
        filter="success"
        item={notifications.info}
      />);
    expect(rowEl.find('li').prop('aria-hidden')).toBeTruthy();
  });

  it('shows notification when filter exact match', () => {
    const rowEl = mount(
      <NotificationPanelRow
        {...defaultProps}
        filter="info"
        item={notifications.info}
      />);
    expect(rowEl.find('li').prop('aria-hidden')).toBeFalsy();
  });
});


describe('NotificationCenterPanel', () => {

  const defaultProps = {
    hideNotificationCenter: () => {},
    selectNotificationFilter: () => {},
    clearAllNotifications: () => {},
    clearSingleNotification: () => {},
    isVisible: true,
    style:{ opacity: 1 }
  };

  it('clear all notifications', () => {
    const stub = sinon.stub();
    const panelEl = mount(<NotificationCenterPanel
      {...defaultProps}
      notifications={[]}
      clearAllNotifications={stub}
      filter={'all'} />);

    panelEl.find('footer input').simulate('click');
    sinon.assert.calledOnce(stub);
  });
});
