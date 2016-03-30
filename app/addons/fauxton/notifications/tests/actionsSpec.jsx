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
  '../../../../../test/mocha/testUtils',
  'react',
  'react-dom',
  'moment',
  'react-addons-test-utils',
  'sinon'
], function (FauxtonAPI, Views, Stores, utils, React, ReactDOM, moment, TestUtils) {
  var assert = utils.assert;
  var store = Stores.notificationStore;


  describe('NotificationPanel', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
      store.reset();
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('clear all action fires', function () {
      var panelEl = TestUtils.renderIntoDocument(<Views.NotificationPanel />, container);

      var stub = sinon.stub(Actions, 'clearAllNotifications');
      TestUtils.Simulate.click($(ReactDOM.findDOMNode(panelEl)).find('footer input')[0]);
      assert.ok(stub.calledOnce);
      Actions.clearAllNotifications.restore();
    });

    it('switch filter action fires', function () {
      var panelEl = TestUtils.renderIntoDocument(<Views.NotificationPanel />, container);

      var stub = sinon.stub(Actions, 'clearAllNotifications');
      TestUtils.Simulate.click($(ReactDOM.findDOMNode(panelEl)).find('footer input')[0]);
      assert.ok(stub.calledOnce);
      Actions.clearAllNotifications.restore();
    });

  });
});
