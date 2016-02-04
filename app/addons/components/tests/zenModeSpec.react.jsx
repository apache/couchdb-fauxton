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
  '../../../core/api',
  '../react-components.react',
  '../../../../test/mocha/testUtils',
  'react',
  'react-dom',
  'react-addons-test-utils',
  'sinon'
], function (FauxtonAPI, ReactComponents, utils, React, ReactDOM, TestUtils, sinon) {

  var assert = utils.assert;
  var code = 'function (doc) {\n  emit(doc._id, 1);\n}';

  describe('Zen Mode', function () {
    var container, el, spy;

    beforeEach(function () {
      spy = sinon.spy();
      container = document.createElement('div');
      el = TestUtils.renderIntoDocument(
        <ReactComponents.ZenModeOverlay defaultCode={code} onExit={spy} />,
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
      window.localStorage.removeItem('zenTheme');
    });

    describe('Toggle theme', function () {
      it('defaults to dark theme', function () {
        assert.ok($(ReactDOM.findDOMNode(el)).hasClass('zen-theme-dark'));
      });

      it('switch to light theme on click', function () {
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.js-toggle-theme')[0]);
        assert.ok($(ReactDOM.findDOMNode(el)).hasClass('zen-theme-light'));
        // reset
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.js-toggle-theme')[0]);
      });
    });

    describe('Closing zen mode', function () {
      it('method called', function () {
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.js-exit-zen-mode')[0]);
        assert.ok(spy.calledOnce);
      });
    });

  });
});
