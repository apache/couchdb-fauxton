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
import FauxtonAPI from "../../../../core/api";
import Views from "../notifications";
import Stores from "../stores";
import utils from "../../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import {mount} from 'enzyme';
import "sinon";
const assert = utils.assert;
var store = Stores.notificationStore;


describe('NotificationController', () => {

  beforeEach(() => {
    store.reset();
  });

  it('notifications should be escaped by default', (done) => {
    store._notificationCenterVisible = true;
    const component = mount(<Views.NotificationController />);
    FauxtonAPI.addNotification({ msg: '<script>window.whatever=1;</script>' });
    //use timer so that controller is displayed first
    setTimeout(() => {
      done();
      assert.ok(/&lt;script&gt;window.whatever=1;&lt;\/script&gt;/.test(component.html()));
    });
  });

  it('notifications should be able to render unescaped', (done) => {
    store._notificationCenterVisible = true;
    const component = mount(<Views.NotificationController />);
    FauxtonAPI.addNotification({ msg: '<script>window.whatever=1;</script>', escape: false });
    setTimeout(() => {
      done();
      assert.ok(/<script>window.whatever=1;<\/script>/.test(component.html()));
    });
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

  it('shows all notification types when "all" filter applied', () => {
    const row1 = mount(<Views.NotificationPanelRow
      style={style}
      isVisible={true}
      filter="all"
      item={notifications.success}
      />);

    assert.notOk(row1.find('li').prop('aria-hidden'));

    const row2 = mount(<Views.NotificationPanelRow
      style={style}
      isVisible={true}
      filter="all"
      item={notifications.error}
      />
    );
    assert.notOk(row2.find('li').prop('aria-hidden'));

    const row3 = mount(<Views.NotificationPanelRow
      style={style}
      isVisible={true}
      filter="all"
      item={notifications.info}/>
    );
    assert.notOk(row3.find('li').prop('aria-hidden'));
  });

  it('hides notification when filter doesn\'t match', () => {
    var rowEl = mount(
      <Views.NotificationPanelRow
      style={style}
      isVisible={true}
      filter="success"
      item={notifications.info}
      />);
    assert.ok(rowEl.find('li').prop('aria-hidden'));
  });

  it('shows notification when filter exact match', () => {
    const rowEl = mount(
      <Views.NotificationPanelRow
      style={style}
      isVisible={true}
      filter="info"
      item={notifications.info}
      />);
    assert.notOk(rowEl.find('li').prop('aria-hidden'));
  });
});


describe('NotificationCenterPanel', () => {
  beforeEach(() => {
    store.reset();
  });

  it('shows all notifications by default', (done) => {
    store.addNotification({type: 'success', msg: 'Success are okay'});
    store.addNotification({type: 'success', msg: 'another success.'});
    store.addNotification({type: 'info', msg: 'A single info message'});
    store.addNotification({type: 'error', msg: 'Error #1'});
    store.addNotification({type: 'error', msg: 'Error #2'});
    store.addNotification({type: 'error', msg: 'Error #3'});

    var panelEl = mount(
      <Views.NotificationCenterPanel
        style={{x: 1}}
        visible={true}
        filter="all"
        notifications={store.getNotifications()}
      />);

    setTimeout(() => {
      done();
      assert.equal(panelEl.find('.notification-list li[aria-hidden=false]').length, 6);
    });
  });

  it('appropriate filters are applied - 1', (done) => {
    store.addNotification({type: 'success', msg: 'Success are okay'});
    store.addNotification({type: 'success', msg: 'another success.'});
    store.addNotification({type: 'info', msg: 'A single info message'});
    store.addNotification({type: 'error', msg: 'Error #1'});
    store.addNotification({type: 'error', msg: 'Error #2'});
    store.addNotification({type: 'error', msg: 'Error #3'});

    var panelEl = mount(
      <Views.NotificationCenterPanel
        style={{x: 1}}
        visible={true}
        filter="success"
        notifications={store.getNotifications()}
      />);

    // there are 2 success messages
    setTimeout(() => {
      done();
      assert.equal(panelEl.find('.notification-list li[aria-hidden=false]').length, 2);
    });
  });

  it('appropriate filters are applied - 2', (done) => {
    store.addNotification({type: 'success', msg: 'Success are okay'});
    store.addNotification({type: 'success', msg: 'another success.'});
    store.addNotification({type: 'info', msg: 'A single info message'});
    store.addNotification({type: 'error', msg: 'Error #1'});
    store.addNotification({type: 'error', msg: 'Error #2'});
    store.addNotification({type: 'error', msg: 'Error #3'});

    var panelEl = mount(
      <Views.NotificationCenterPanel
        style={{x: 1}}
        visible={true}
        filter="error"
        notifications={store.getNotifications()}
      />);

    // 3 errors
    setTimeout(() => {
      done();
      assert.equal(panelEl.find('.notification-list li[aria-hidden=false]').length, 3);
    });
  });
});
