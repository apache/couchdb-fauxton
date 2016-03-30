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
define([
  '../../../../core/api',
  '../notifications.react',
  '../stores',
  '../actions',
  '../../../../../test/mocha/testUtils',
  'react',
  'react-dom',
  'moment',
  'react-addons-test-utils',
  'sinon'
], function (FauxtonAPI, Views, Stores, Actions, utils, React, ReactDOM, moment, TestUtils) {
  var assert = utils.assert;
  var store = Stores.notificationStore;


  describe('NotificationController', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
      store.reset();
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('notifications should be escaped by default', function () {
      var component = TestUtils.renderIntoDocument(<Views.NotificationController />, container);
      FauxtonAPI.addNotification({ msg: '<script>window.whatever=1;</script>' });
      assert.ok(/&lt;script&gt;window.whatever=1;&lt;\/script&gt;/.test(ReactDOM.findDOMNode(component).innerHTML));
    });

    it('notifications should be able to render unescaped', function () {
      var component = TestUtils.renderIntoDocument(<Views.NotificationController />, container);
      FauxtonAPI.addNotification({ msg: '<script>window.whatever=1;</script>', escape: false });
      assert.ok(/<script>window.whatever=1;<\/script>/.test(ReactDOM.findDOMNode(component).innerHTML));
    });
  });

  describe('NotificationPanelRow', function () {
    var container;

    var notifications = {
      success: {
        notificationId: 1,
        type: 'success',
        msg: 'Success!',
        time: moment()
      },
      info: {
        notificationId: 2,
        type: 'info',
        msg: 'Error!',
        time: moment()
      },
      error: {
        notificationId: 3,
        type: 'error',
        msg: 'Error!',
        time: moment()
      }
    };

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('shows all notification types when "all" filter applied', function () {
      var row1 = TestUtils.renderIntoDocument(
        <Views.NotificationPanelRow filter="all" item={notifications.success}/>,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(row1)).attr('aria-hidden'), 'false');
      ReactDOM.unmountComponentAtNode(container);

      var row2 = TestUtils.renderIntoDocument(
        <Views.NotificationPanelRow filter="all" item={notifications.error}/>,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(row2)).attr('aria-hidden'), 'false');
      ReactDOM.unmountComponentAtNode(container);

      var row3 = TestUtils.renderIntoDocument(
        <Views.NotificationPanelRow filter="all" item={notifications.info}/>,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(row3)).attr('aria-hidden'), 'false');
      ReactDOM.unmountComponentAtNode(container);
    });

    it('hides notification when filter doesn\'t match', function () {
      var rowEl = TestUtils.renderIntoDocument(
        <Views.NotificationPanelRow filter="success" item={notifications.info}/>,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(rowEl)).attr('aria-hidden'), 'true');
    });

    it('shows notification when filter exact match', function () {
      var rowEl = TestUtils.renderIntoDocument(
        <Views.NotificationPanelRow filter="info" item={notifications.info}/>,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(rowEl)).attr('aria-hidden'), 'false');
    });
  });


  describe('NotificationCenterPanel', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
      store.reset();
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('shows all notifications by default', function () {
      store.addNotification({type: 'success', msg: 'Success are okay'});
      store.addNotification({type: 'success', msg: 'another success.'});
      store.addNotification({type: 'info', msg: 'A single info message'});
      store.addNotification({type: 'error', msg: 'Error #1'});
      store.addNotification({type: 'error', msg: 'Error #2'});
      store.addNotification({type: 'error', msg: 'Error #3'});

      var panelEl = TestUtils.renderIntoDocument(
        <Views.NotificationCenterPanel
          filter="all"
          notifications={store.getNotifications()}
        />, container);

      assert.equal($(ReactDOM.findDOMNode(panelEl)).find('.notification-list li[aria-hidden=false]').length, 6);
    });

    it('appropriate filters are applied - 1', function () {
      store.addNotification({type: 'success', msg: 'Success are okay'});
      store.addNotification({type: 'success', msg: 'another success.'});
      store.addNotification({type: 'info', msg: 'A single info message'});
      store.addNotification({type: 'error', msg: 'Error #1'});
      store.addNotification({type: 'error', msg: 'Error #2'});
      store.addNotification({type: 'error', msg: 'Error #3'});

      var panelEl = TestUtils.renderIntoDocument(
        <Views.NotificationCenterPanel
          filter="success"
          notifications={store.getNotifications()}
        />, container);

      // there are 2 success messages
      assert.equal($(ReactDOM.findDOMNode(panelEl)).find('.notification-list li[aria-hidden=false]').length, 2);
    });

    it('appropriate filters are applied - 2', function () {
      store.addNotification({type: 'success', msg: 'Success are okay'});
      store.addNotification({type: 'success', msg: 'another success.'});
      store.addNotification({type: 'info', msg: 'A single info message'});
      store.addNotification({type: 'error', msg: 'Error #1'});
      store.addNotification({type: 'error', msg: 'Error #2'});
      store.addNotification({type: 'error', msg: 'Error #3'});

      var panelEl = TestUtils.renderIntoDocument(
        <Views.NotificationCenterPanel
          filter="error"
          notifications={store.getNotifications()}
        />, container);

      // 3 errors
      assert.equal($(ReactDOM.findDOMNode(panelEl)).find('.notification-list li[aria-hidden=false]').length, 3);
    });

  });

});
