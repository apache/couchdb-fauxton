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

import FauxtonAPI from "../../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import testUtils from "../../../../test/mocha/testUtils";
import Constants from "../constants";
import Components from "../components";
import {mount} from 'enzyme';
import sinon from "sinon";
FauxtonAPI.router = new FauxtonAPI.Router([]);

var assert = testUtils.assert;

describe('VerifyInstallResults', function () {
  let el;

  const tests = [
    { key: 'CREATE_DATABASE', id: 'js-test-create-db' },
    { key: 'CREATE_DOCUMENT', id: 'js-test-create-doc' },
    { key: 'UPDATE_DOCUMENT', id: 'js-test-update-doc' },
    { key: 'DELETE_DOCUMENT', id: 'js-test-delete-doc' },
    { key: 'CREATE_VIEW', id: 'js-test-create-view' },
    { key: 'REPLICATION', id: 'js-test-replication' }
  ];

  const testResults = {};
  tests.forEach((test) => {
    testResults[Constants.TESTS[test.key]] = { complete: false };
  });

  it('confirm all result fields blank before tests ran', function () {

    el = mount(<Components.VerifyInstallResults testResults={testResults} />);

    tests.forEach((test) => {
      assert.equal(el.find('#' + test.id).text(), '');
    });
  });

  it('confirm each result field shows success after successful test', function () {
    tests.forEach((test) => {
      const copy = _.clone(testResults);

      // mark this single test as complete
      copy[Constants.TESTS[test.key]] = {
        complete: true,
        success: true
      };

      el = mount(<Components.VerifyInstallResults testResults={copy} />);

      // now look at the DOM for that element. It should contain a tick char
      assert.equal(el.find('#' + test.id + ' span').text(), '✓');
    });
  });

  it('confirm each result field shows error marker after failed test', function () {
    tests.forEach((test) => {
      const copy = _.clone(testResults);

      // mark this single test as complete
      copy[Constants.TESTS[test.key]] = {
        complete: true,
        success: false
      };

      el = mount(<Components.VerifyInstallResults testResults={copy} />);

      // now look at the DOM for that element. It should contain an error char
      assert.equal(el.find('#' + test.id + ' span').text(), '✗');
    });
  });
});


describe('VerifyInstallButton', function () {
  let el;

  it('calls verify function on click', function () {
    const stub = { func: () => { } };
    const spy = sinon.spy(stub, 'func');
    el = mount(<Components.VerifyInstallButton verify={stub.func} isVerifying={false} />);
    el.simulate('click');
    assert.ok(spy.calledOnce);
  });

  it('shows appropriate default label', function () {
    const stub = { func: () => { } };
    el = mount(<Components.VerifyInstallButton verify={stub.func} isVerifying={false} />);
    assert.equal(el.text(), 'Verify Installation');
  });

  it('shows appropriate label during verification', function () {
    const stub = { func: () => { } };
    el = mount(<Components.VerifyInstallButton verify={stub.func} isVerifying={true} />);
    assert.equal(el.text(), 'Verifying');
  });

});
