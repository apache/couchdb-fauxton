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

  describe('Document', function () {
    var container, el;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('hosts child elements', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document>
          <div className="foo-children"></div>
        </ReactComponents.Document>,
        container
      );
      assert.ok($(el.getDOMNode()).find('.foo-children').length);
    });

    it('does not require child elements', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document />,
        container
      );
      assert.notOk($(el.getDOMNode()).find('.doc-edit-symbol').length);
    });

    it('you can check it', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document checked={true} docIdentifier="foo" />,
        container
      );
      assert.equal($(el.getDOMNode()).find('#checkbox-foo').attr('checked'), 'checked');
    });

    it('you can uncheck it', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document docIdentifier="foo" />,
        container
      );
      assert.equal($(el.getDOMNode()).find('#checkbox-foo').attr('checked'), undefined);
    });

    it('it calls an onchange callback', function () {
      var spy = sinon.spy();

      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document onChange={spy} docIdentifier="foo" />,
        container
      );
      var testEl = $(el.getDOMNode()).find('#checkbox-foo')[0];
      React.addons.TestUtils.Simulate.change(testEl, {target: {value: 'Hello, world'}});
      assert.ok(spy.calledOnce);
    });

    it('it calls an dblclick callback', function () {
      var spy = sinon.spy();

      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document onDoubleClick={spy} docIdentifier="foo" />,
        container
      );
      React.addons.TestUtils.Simulate.doubleClick(el.getDOMNode());
      assert.ok(spy.calledOnce);
    });
  });

});
