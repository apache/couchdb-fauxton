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
  'addons/components/actions',
  'addons/components/stores',
  'addons/components/react-components.react',
  'testUtils',
  'react',
  'react-dom'
], function (FauxtonAPI, Actions, Stores, ReactComponents, utils, React, ReactDOM) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var componentStore = Stores.componentStore;
  var ApiBarController = ReactComponents.ApiBarController;


  describe('ApiBarController', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
      componentStore.reset();
    });

    it('Doesn\'t show up when explicitly set to visible false', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      Actions.updateAPIBar({
        visible: false,
        endpoint: 'http://link.com',
        docURL: 'http://link.com'
      });
      assert.equal(el.getDOMNode(), null);
    });

    it('Shows up when set to visible', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      Actions.updateAPIBar({
        visible: true,
        endpoint: 'http://link.com',
        docURL: 'http://link.com'
      });
      assert.notEqual(el.getDOMNode(), null);
    });

    it('Doesn\'t show up when set to visible BUT there\'s no endpoint defined', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      Actions.updateAPIBar({
        visible: true,
        endpoint: '',
        docURL: 'http://link.com'
      });
      assert.equal(el.getDOMNode(), null);
    });

    it('Confirm hide/show actions update component', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);

      // set an initial value
      Actions.updateAPIBar({ endpoint: 'http://link.com' });

      Actions.showAPIBar();
      assert.notEqual(el.getDOMNode(), null);

      Actions.hideAPIBar();
      assert.equal(el.getDOMNode(), null);
    });

    it('Confirm doc link icon appears when docURL set', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      Actions.updateAPIBar({ visible: true, endpoint: 'http://link.com', docURL: 'http://doc.com' });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.help-link').length, 1);
    });

    it('Confirm doc link icon doesn\'t appear with no docURL', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      Actions.updateAPIBar({ visible: true, endpoint: 'http://link.com', docURL: null });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.help-link').length, 0);
    });

    it('Confirm endpoint appears in markup', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      var link = 'http://booyah.ca';
      Actions.updateAPIBar({ visible: true, endpoint: link, docURL: null });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.text-field-to-copy').val(), link);
    });

    it('Confirm endpoint is updated in markup', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      var link = 'http://booyah.ca';
      Actions.updateAPIBar({ visible: true, endpoint: link, docURL: null });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.text-field-to-copy').val(), link);

      var newLink = 'http://chickensarenoisy.com';
      Actions.updateAPIBar({ endpoint: newLink });
      assert.equal($(ReactDOM.findDOMNode(el)).find('.text-field-to-copy').val(), newLink);
    });

    it('Confirm doc URL is updated in markup after a change', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      var docLink = 'http://mydoc.org';
      Actions.updateAPIBar({ visible: true, endpoint: 'http://whatever.com', docURL: docLink });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.help-link').attr('href'), docLink);

      var newDocLink = 'http://newawesomedoclink.xxx';
      Actions.updateAPIBar({ docURL: newDocLink });
      assert.equal($(ReactDOM.findDOMNode(el)).find('.help-link').attr('href'), newDocLink);
    });

  });
});
