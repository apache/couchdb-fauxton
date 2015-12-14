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
  'libs/react-bootstrap',
  'testUtils',
  'react'
], function (FauxtonAPI, ReactComponents, ReactBootstrap, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var Modal = ReactBootstrap.Modal;


  describe('String Edit Modal', function () {
    var container, el;
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
        el = TestUtils.renderIntoDocument(
          <ReactComponents.StringEditModal visible={true} onClose={spy} onSave={stub} />,
          container
        );
        var modal = TestUtils.findRenderedComponentWithType(el, Modal);
        var modalEl = React.findDOMNode(modal.refs.modal);

        TestUtils.Simulate.click($(modalEl).find('.close')[0]);
        assert.ok(spy.calledOnce);
      });

      it('onClose called by cancel button', function () {
        var spy = sinon.spy();
        el = TestUtils.renderIntoDocument(
          <ReactComponents.StringEditModal visible={true} onClose={spy} onSave={stub} />,
          container
        );
        var modal = TestUtils.findRenderedComponentWithType(el, Modal);
        var modalEl = React.findDOMNode(modal.refs.modal);
        TestUtils.Simulate.click($(modalEl).find('.cancel-button')[0]);
        assert.ok(spy.calledOnce);
      });
    });

    describe('onSave', function () {
      it('ensures same content returns on saving', function () {
        var string = "a string!";
        var spy = sinon.spy();
        el = TestUtils.renderIntoDocument(
          <ReactComponents.StringEditModal visible={true} onClose={stub} onSave={spy} value={string} />,
          container
        );
        var modal = TestUtils.findRenderedComponentWithType(el, Modal);
        var modalEl = React.findDOMNode(modal.refs.modal);

        TestUtils.Simulate.click($(modalEl).find('#string-edit-save-btn')[0]);
        assert.ok(spy.calledOnce);
        assert.ok(spy.calledWith(string));
      });

      it('replaces "\\n" with actual newlines', function () {
        var spy = sinon.spy();
        var string = 'I am a string\\nwith\\nlinebreaks\\nin\\nit';
        el = TestUtils.renderIntoDocument(
          <ReactComponents.StringEditModal visible={true} onSave={spy} value={string} />,
          container
        );

        var modal = TestUtils.findRenderedComponentWithType(el, Modal);
        var modalEl = React.findDOMNode(modal.refs.modal);

        TestUtils.Simulate.click($(modalEl).find('#string-edit-save-btn')[0]);
        assert.ok(spy.calledOnce);
      });
    });
  });
});
