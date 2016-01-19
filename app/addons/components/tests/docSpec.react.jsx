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
  'react',
  'react-dom'
], function (FauxtonAPI, ReactComponents, utils, React, ReactDOM) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('Document', function () {
    var container, el;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('hosts child elements', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document>
          <div className="foo-children"></div>
        </ReactComponents.Document>,
        container
      );
      assert.ok($(ReactDOM.findDOMNode(el)).find('.foo-children').length);
    });

    it('does not require child elements', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document />,
        container
      );
      assert.notOk($(ReactDOM.findDOMNode(el)).find('.doc-edit-symbol').length);
    });

    it('you can check it', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document isDeletable={true} checked={true} docIdentifier="foo" />,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(el)).find('input[type="checkbox"]').attr('checked'), 'checked');
    });

    it('you can uncheck it', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document isDeletable={true} docIdentifier="foo" />,
        container
      );
      assert.equal($(ReactDOM.findDOMNode(el)).find('input[type="checkbox"]').attr('checked'), undefined);
    });

    it('it calls an onchange callback', function () {
      var spy = sinon.spy();

      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document doc={{id: "foo"}} isDeletable={true} docChecked={spy} docIdentifier="foo" />,
        container
      );
      var testEl = $(ReactDOM.findDOMNode(el)).find('input[type="checkbox"]')[0];
      React.addons.TestUtils.Simulate.change(testEl, {target: {value: 'Hello, world'}});
      assert.ok(spy.calledOnce);
    });

    it('it calls an dblclick callback', function () {
      var spy = sinon.spy();

      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document isDeletable={true} onDoubleClick={spy} docIdentifier="foo" />,
        container
      );
      React.addons.TestUtils.Simulate.doubleClick(ReactDOM.findDOMNode(el));
      assert.ok(spy.calledOnce);
    });

    it('can render without checkbox', function () {
      var spy = sinon.spy();

      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document isDeletable={false} onDoubleClick={spy} docIdentifier="foo" />,
        container
      );
      assert.notOk($(ReactDOM.findDOMNode(el)).find('input[type="checkbox"]').length);
      assert.ok($(ReactDOM.findDOMNode(el)).find('.checkbox-dummy').length);
    });

    it('contains a doc-data element when there\'s doc content', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document isDeletable={true} checked={true} docIdentifier="foo" docContent='{ "content": true }' />,
        container
      );
      assert.equal(1, $(ReactDOM.findDOMNode(el)).find('.doc-data').length);
    });

    it('doesn\'t contain a doc-data element when there\'s no doc content', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document isDeletable={true} checked={true} docIdentifier="foo" docContent='' />,
        container
      );
      assert.equal(0, $(ReactDOM.findDOMNode(el)).find('.doc-data').length);
    });

    it('allows empty headers', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document header={null} isDeletable={true} checked={true} docIdentifier="foo" docContent='' />,
        container
      );
      assert.equal('', $(ReactDOM.findDOMNode(el)).find('.header-doc-id').text());
    });

    it('allows supports headers with "', function () {
      el = TestUtils.renderIntoDocument(
        <ReactComponents.Document header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent='' />,
        container
      );
      assert.equal('"foo"', $(ReactDOM.findDOMNode(el)).find('.header-doc-id').text());
    });
  });

});
