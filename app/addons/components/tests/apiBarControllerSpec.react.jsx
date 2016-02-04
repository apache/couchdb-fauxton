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
  '../actions',
  '../stores',
  '../react-components.react',
  '../../../../test/mocha/testUtils',
  'react-addons-test-utils',
  'sinon',
  'react',
  'react-dom'
], function (FauxtonAPI, Actions, Stores, ReactComponents, utils, TestUtils, sinon, React, ReactDOM) {

  var assert = utils.assert;
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
        buttonVisible: false,
        endpoint: 'http://link.example.com',
        docURL: 'http://link.example.com',
        contentVisible: false
      });
      assert.equal($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url').length, 0);
    });

    it('Shows up when set to visible', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: 'http://link.example.com',
        docURL: 'http://link.example.com',
        contentVisible: false
      });
      assert.equal($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url').length, 1);
    });

    it('Doesn\'t show up when set to visible BUT there\'s no endpoint defined', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: '',
        docURL: 'http://link.example.com',
        contentVisible: false
      });
      assert.equal($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url').length, 0);
    });

    it('Confirm hide/show actions update component', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);

      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: 'http://rocko.example.com',
        docURL: 'http://link.example.com',
        contentVisible: false
      });

      Actions.showAPIBarButton();
      assert.equal($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url').length, 1, 'showAPIBarButton');

      Actions.hideAPIBarButton();
      assert.equal($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url').length, 0, 'hideAPIBarButton');
    });

    it('Confirm doc link icon appears when docURL set', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: 'http://rocko.example.com',
        docURL: 'http://doc.example.com',
        contentVisible: false
      });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.help-link').length, 1);
    });

    it('Confirm doc link icon doesn\'t appear with no docURL', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: 'http://rocko.example.com',
        docURL: null,
        contentVisible: false
      });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.help-link').length, 0);
    });

    it('Confirm endpoint appears in markup', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      var link = 'http://booyah.example.com';
      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: link,
        docURL: null,
        contentVisible: false
      });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.text-field-to-copy').val(), link);
    });

    it('Confirm endpoint is updated in markup', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      var link = 'http://booyah.example.com';
      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: link,
        docURL: null,
        contentVisible: false
      });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.text-field-to-copy').val(), link);

      var newLink = 'http://chickensarenoisy.example.com';
      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: newLink,
        docURL: null,
        contentVisible: true
      });

      assert.equal($(ReactDOM.findDOMNode(el)).find('.text-field-to-copy').val(), newLink);
    });

    it('Confirm doc URL is updated in markup after a change', function () {
      var el = TestUtils.renderIntoDocument(<ApiBarController />, container);
      var docLink = 'http://mydoc.example.com';
      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: 'http://whatever.example.com',
        docURL: docLink,
        contentVisible: false
      });

      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el)).find('.control-toggle-api-url')[0]);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.help-link').attr('href'), docLink);

      var newDocLink = 'http://newawesomedoclink.example.com';
      Actions.updateAPIBar({
        buttonVisible: true,
        endpoint: 'http://whatever.example.com',
        docURL: newDocLink,
        contentVisible: true
      });
      assert.equal($(ReactDOM.findDOMNode(el)).find('.help-link').attr('href'), newDocLink);
    });

  });
});
