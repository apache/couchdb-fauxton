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

import utils from "../../../../../test/mocha/testUtils";
import Stores from "../stores";

const assert = utils.assert;
const store = Stores.notificationStore;

describe('Notification Store', () => {

  beforeEach(() => {
    store.reset();
  });

  it("sets reasonable defaults", () => {
    assert.equal(store.getNotifications().length, 0);
    assert.equal(store.isNotificationCenterVisible(), false);
    assert.equal(store.getNotificationFilter(), 'all');
  });

  it("confirm only known notification types get added", () => {
    assert.equal(store.getNotifications().length, 0);
    store.addNotification({ type: 'success', msg: 'Success are okay' });

    assert.equal(store.getNotifications().length, 1);
    store.addNotification({ type: 'info', msg: 'Infos are also okay' });

    assert.equal(store.getNotifications().length, 2);
    store.addNotification({ type: 'error', msg: 'Errors? Bring em on' });

    assert.equal(store.getNotifications().length, 3);
    store.addNotification({ type: 'rhubarb', msg: 'But rhubarb is NOT a valid notification type' });

    // confirm it wasn't added
    assert.equal(store.getNotifications().length, 3);
  });

  it("clearNotification clears a specific notification", () => {
    store.addNotification({ type: 'success', msg: 'one' });
    store.addNotification({ type: 'success', msg: 'two' });
    store.addNotification({ type: 'success', msg: 'three' });
    store.addNotification({ type: 'success', msg: 'four' });

    const notifications = store.getNotifications();
    assert.equal(notifications.length, 4);

    // find the notification ID of the "three" message
    const notification = _.find(notifications, { msg: 'three' });
    store.clearNotification(notification.notificationId);

    // confirm it was removed
    const updatedNotifications = store.getNotifications();
    assert.equal(updatedNotifications.length, 3);
    assert.equal(_.find(updatedNotifications, { msg: 'three' }), undefined);
  });

  it("setNotificationFilter only sets for known notification types", () => {
    store.setNotificationFilter('all');
    assert.equal(store.getNotificationFilter(), 'all');

    store.setNotificationFilter('success');
    assert.equal(store.getNotificationFilter(), 'success');

    store.setNotificationFilter('error');
    assert.equal(store.getNotificationFilter(), 'error');

    store.setNotificationFilter('info');
    assert.equal(store.getNotificationFilter(), 'info');

    store.setNotificationFilter('broccoli');
    assert.equal(store.getNotificationFilter(), 'info'); // this check it's still set to the previously set value
  });

  it("clear all notifications", () => {
    store.addNotification({ type: 'success', msg: 'one' });
    store.addNotification({ type: 'success', msg: 'two' });
    store.addNotification({ type: 'success', msg: 'three' });
    store.addNotification({ type: 'success', msg: 'four' });
    assert.equal(store.getNotifications().length, 4);

    store.clearNotifications();
    assert.equal(store.getNotifications().length, 0);
  });

});
