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
import Notification from '../components/Notification';
import NotificationCenterPanel from '../components/NotificationCenterPanel';
import NotificationPanelRow from '../components/NotificationPanelRow';
import utils from '../../../../../test/mocha/testUtils';

const assert = utils.assert;

describe('Notification', () => {
  it('startHide is only called after visible time is out', (done) => {
    const spy = sinon.spy();
    const component = mount(<Notification
      notificationId={'some id'}
      isHiding={false}
      key={11}
      msg={'a msg'}
      type={'error'}
      escape={true}
      style={{opacity:1}}
      visibleTime={1000}
      onStartHide={spy}
      onHideComplete={() => {}}
    />);

    assert.notOk(spy.called);

    setTimeout(() => {
      component.update();
      assert.ok(spy.called);
      done();
    }, 3000);
  });

  it('notification text should be escaped by default', () => {
    const wrapper = mount(<Notification
      notificationId={123}
      isHiding={false}
      msg={'<script>window.whatever=1;</script>'}
      type={'error'}
      style={{opacity:1}}
      onStartHide={() => {}}
      onHideComplete={() => {}}
    />);
    assert.ok(/&lt;script&gt;window.whatever=1;&lt;\/script&gt;/.test(wrapper.html()));
  });

  it('notification text can be rendered unescaped', () => {
    const wrapper = mount(<Notification
      notificationId={123}
      isHiding={false}
      msg={'<script>window.whatever=1;</script>'}
      type={'error'}
      escape={false}
      style={{opacity:1}}
      onStartHide={() => {}}
      onHideComplete={() => {}}
    />);
    assert.ok(/<script>window.whatever=1;<\/script>/.test(wrapper.html()));
  });
});

describe('NotificationPanelRow', () => {
  const notifications = {
    success: {
      notificationId: 1,
      type: 'success',
      msg: 'Success!',
      cleanMsg: 'Success!',
      time: moment()
    },
    info: {
      notificationId: 2,
      type: 'info',
      msg: 'Error!',
      cleanMsg: 'Error!',
      time: moment()
    },
    error: {
      notificationId: 3,
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

    assert.notOk(row1.find('li').prop('aria-hidden'));

    const row2 = mount(<NotificationPanelRow
      {...defaultProps}
      item={notifications.error}
    />
    );
    assert.notOk(row2.find('li').prop('aria-hidden'));

    const row3 = mount(<NotificationPanelRow
      {...defaultProps}
      item={notifications.info} />
    );
    assert.notOk(row3.find('li').prop('aria-hidden'));
  });

  it('hides notification when filter doesn\'t match', () => {
    var rowEl = mount(
      <NotificationPanelRow
        {...defaultProps}
        filter="success"
        item={notifications.info}
      />);
    assert.ok(rowEl.find('li').prop('aria-hidden'));
  });

  it('shows notification when filter exact match', () => {
    const rowEl = mount(
      <NotificationPanelRow
        {...defaultProps}
        filter="info"
        item={notifications.info}
      />);
    assert.notOk(rowEl.find('li').prop('aria-hidden'));
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
