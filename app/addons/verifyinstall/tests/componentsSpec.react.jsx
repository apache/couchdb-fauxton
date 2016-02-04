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
  '../../../app',
  '../../../core/api',
  'react',
  'react-dom',
  '../../../../test/mocha/testUtils',
  '../constants',
  '../components.react',
  'react-addons-test-utils',
  'sinon'

], function (app, FauxtonAPI, React, ReactDOM, testUtils, Constants, Components, TestUtils, sinon) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = testUtils.assert;

  describe('VerifyInstallResults', function () {
    var container, el;

    var tests = [
      { key: 'CREATE_DATABASE', id: 'js-test-create-db' },
      { key: 'CREATE_DOCUMENT', id: 'js-test-create-doc' },
      { key: 'UPDATE_DOCUMENT', id: 'js-test-update-doc' },
      { key: 'DELETE_DOCUMENT', id: 'js-test-delete-doc' },
      { key: 'CREATE_VIEW', id: 'js-test-create-view' },
      { key: 'REPLICATION', id: 'js-test-replication' }
    ];

    var testResults = {};
    tests.forEach(function (test) {
      testResults[Constants.TESTS[test.key]] = { complete: false };
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('confirm all result fields blank before tests ran', function () {
      container = document.createElement('div');
      el = TestUtils.renderIntoDocument(<Components.VerifyInstallResults testResults={testResults} />, container);

      tests.forEach(function (test) {
        assert.equal($(ReactDOM.findDOMNode(el)).find('#' + test.id).html(), '');
      });
    });

    it('confirm each result field shows success after successful test', function () {
      tests.forEach(function (test) {
        var copy = _.clone(testResults);

        // mark this single test as complete
        copy[Constants.TESTS[test.key]] = {
          complete: true,
          success: true
        };

        el = TestUtils.renderIntoDocument(<Components.VerifyInstallResults testResults={copy} />, container);

        // now look at the DOM for that element. It should contain a tick char
        assert.equal($(ReactDOM.findDOMNode(el)).find('#' + test.id + ' span').html(), '✓');
      });
    });

    it('confirm each result field shows error marker after failed test', function () {
      tests.forEach(function (test) {
        var copy = _.clone(testResults);

        // mark this single test as complete
        copy[Constants.TESTS[test.key]] = {
          complete: true,
          success: false
        };

        el = TestUtils.renderIntoDocument(<Components.VerifyInstallResults testResults={copy} />, container);

        // now look at the DOM for that element. It should contain an error char
        assert.equal($(ReactDOM.findDOMNode(el)).find('#' + test.id + ' span').html(), '✗');
      });
    });
  });


  describe('VerifyInstallButton', function () {
    var container, el;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('calls verify function on click', function () {
      var stub = { func: function () { } };
      var spy = sinon.spy(stub, 'func');
      el = TestUtils.renderIntoDocument(<Components.VerifyInstallButton verify={stub.func} isVerifying={false} />, container);
      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el))[0]);
      assert.ok(spy.calledOnce);
    });

    it('does not call verify function when verification already ongoing', function () {
      var stub = { func: function () { } };
      var spy = sinon.spy(stub, 'func');
      el = TestUtils.renderIntoDocument(<Components.VerifyInstallButton verify={stub.func} isVerifying={true} />, container);
      TestUtils.Simulate.click($(ReactDOM.findDOMNode(el))[0]);
      assert.notOk(spy.calledOnce);
    });

    it('shows appropriate default label', function () {
      var stub = { func: function () { } };
      el = TestUtils.renderIntoDocument(<Components.VerifyInstallButton verify={stub.func} isVerifying={false} />, container);
      assert.equal($(ReactDOM.findDOMNode(el)).html(), 'Verify Installation');
    });

    it('shows appropriate label during verification', function () {
      var stub = { func: function () { } };
      el = TestUtils.renderIntoDocument(<Components.VerifyInstallButton verify={stub.func} isVerifying={true} />, container);
      assert.equal($(ReactDOM.findDOMNode(el)).html(), 'Verifying');
    });

  });


});
