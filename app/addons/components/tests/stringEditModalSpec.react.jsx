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
  'api',
  'addons/components/react-components.react',
  'testUtils',
  'react'
], function (FauxtonAPI, ReactComponents, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('String Edit Modal', function () {
    var container, modalEl;
    var stub = function () { };

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    describe('event methods called', function () {
      it('onClose called by top (x)', function () {
        var spy = sinon.spy();
        modalEl = TestUtils.renderIntoDocument(
          <ReactComponents.StringEditModal visible={true} onClose={spy} onSave={stub} />,
          container
        );
        TestUtils.Simulate.click($(modalEl.getDOMNode()).find('.close')[0]);
        assert.ok(spy.calledOnce);
      });

      it('onClose called by cancel button', function () {
        var spy = sinon.spy();
        modalEl = TestUtils.renderIntoDocument(
          <ReactComponents.StringEditModal visible={true} onClose={spy} onSave={stub} />,
          container
        );
        TestUtils.Simulate.click($(modalEl.getDOMNode()).find('.cancel-button')[0]);
        assert.ok(spy.calledOnce);
      });
    });

    describe('setValue / onSave', function () {
      it('setValue ensures same content returns on saving', function () {
        var spy = sinon.spy();
        modalEl = TestUtils.renderIntoDocument(
          <ReactComponents.StringEditModal visible={true} onClose={stub} onSave={spy} />,
          container
        );

        var string = "a string!";

        modalEl.setValue(string);
        TestUtils.Simulate.click($(modalEl.getDOMNode()).find('#string-edit-save-btn')[0]);
        assert.ok(spy.calledOnce);
        assert.ok(spy.calledWith(string));
      });
    });

  });

});
