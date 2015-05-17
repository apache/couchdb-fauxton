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
  'app',
  'api',
  'react',
  'testUtils',
  'addons/verifyinstall/constants',
  'addons/verifyinstall/components.react'

], function (app, FauxtonAPI, React, testUtils, Constants, Components) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = testUtils.assert;
  var ReactTestUtils = React.addons.TestUtils;


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
      React.unmountComponentAtNode(container);
    });

    it('confirm all result fields blank before tests ran', function () {
      container = document.createElement('div');
      el = ReactTestUtils.renderIntoDocument(<Components.VerifyInstallResults testResults={testResults} />, container);

      tests.forEach(function (test) {
        assert.equal($(el.getDOMNode()).find('#' + test.id).html(), '');
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

        el = ReactTestUtils.renderIntoDocument(<Components.VerifyInstallResults testResults={copy} />, container);

        // now look at the DOM for that element. It should contain a tick char
        assert.equal($(el.getDOMNode()).find('#' + test.id + ' span').html(), '✓');
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

        el = ReactTestUtils.renderIntoDocument(<Components.VerifyInstallResults testResults={copy} />, container);

        // now look at the DOM for that element. It should contain an error char
        assert.equal($(el.getDOMNode()).find('#' + test.id + ' span').html(), '✗');
      });
    });
  });


  describe('VerifyInstallButton', function () {
    var container, el;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('calls verify function on click', function () {
      var stub = { func: function () { } };
      var spy = sinon.spy(stub, 'func');
      el = ReactTestUtils.renderIntoDocument(<Components.VerifyInstallButton verify={stub.func} isVerifying={false} />, container);
      ReactTestUtils.Simulate.click($(el.getDOMNode())[0]);
      assert.ok(spy.calledOnce);
    });

    it('does not call verify function when verification already ongoing', function () {
      var stub = { func: function () { } };
      var spy = sinon.spy(stub, 'func');
      el = ReactTestUtils.renderIntoDocument(<Components.VerifyInstallButton verify={stub.func} isVerifying={true} />, container);
      ReactTestUtils.Simulate.click($(el.getDOMNode())[0]);
      assert.notOk(spy.calledOnce);
    });

    it('shows appropriate default label', function () {
      var stub = { func: function () { } };
      el = ReactTestUtils.renderIntoDocument(<Components.VerifyInstallButton verify={stub.func} isVerifying={false} />, container);
      assert.equal($(el.getDOMNode()).html(), 'Verify Installation');
    });

    it('shows appropriate label during verification', function () {
      var stub = { func: function () { } };
      el = ReactTestUtils.renderIntoDocument(<Components.VerifyInstallButton verify={stub.func} isVerifying={true} />, container);
      assert.equal($(el.getDOMNode()).html(), 'Verifying');
    });

  });


});
