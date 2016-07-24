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
import testUtils from "../../../../test/mocha/testUtils";
import FauxtonAPI from "../../../core/api";
import Actions from "../actions";
import Resources from "../resources";
import sinon from "sinon";

const assert = testUtils.assert;
const restore = testUtils.restore;

describe('Config Actions', function () {
  var node = 'test';
  var option = {
    sectionName: 'test',
    optionName: 'test',
    value: 'test'
  };
  var failXhr = { responseText: '{}' };

  beforeEach(function () {
    var optionStub = sinon.stub(Resources, 'OptionModel');
    optionStub.returns({
      save: () => null,
      destroy: () => null
    });
  });

  afterEach(function () {
    restore(Resources.OptionModel);
  });

  describe('add', function () {
    afterEach(function () {
      restore(Actions.optionAddSuccess);
      restore(Actions.optionAddFailure);
      restore(FauxtonAPI.when);
      restore(FauxtonAPI.addNotification);
    });

    it('calls optionAddSuccess when option add succeeds', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(Actions, 'optionAddSuccess');
      var promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      Actions.addOption(node, option);
      assert.ok(spy.calledOnce);
    });

    it('shows notification when option add succeeds', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(FauxtonAPI, 'addNotification');
      var promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      Actions.addOption(node, option);
      assert.ok(spy.calledOnce);
    });

    it('calls optionAddFailure when option add fails', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(Actions, 'optionAddFailure');
      var promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      Actions.addOption(node, option);
      assert.ok(spy.calledOnce);
    });

    it('shows notification when option add fails', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(FauxtonAPI, 'addNotification');
      var promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      Actions.addOption(node, option);
      assert.ok(spy.calledOnce);
    });
  });

  describe('save', function () {
    afterEach(function () {
      restore(Actions.optionSaveSuccess);
      restore(Actions.optionSaveFailure);
      restore(FauxtonAPI.when);
      restore(FauxtonAPI.addNotification);
    });

    it('calls optionSaveSuccess when option save succeeds', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(Actions, 'optionSaveSuccess');
      var promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      Actions.saveOption(node, option);
      assert.ok(spy.calledOnce);
    });

    it('shows notification when option save succeeds', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(FauxtonAPI, 'addNotification');
      var promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      Actions.saveOption(node, option);
      assert.ok(spy.calledOnce);
    });

    it('calls optionSaveFailure when option save fails', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(Actions, 'optionSaveFailure');
      var promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      Actions.saveOption(node, option);
      assert.ok(spy.calledOnce);
    });

    it('shows notification when option save fails', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(FauxtonAPI, 'addNotification');
      var promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      Actions.saveOption(node, option);
      assert.ok(spy.calledOnce);
    });
  });

  describe('delete', function () {
    afterEach(function () {
      restore(Actions.optionDeleteSuccess);
      restore(Actions.optionDeleteFailure);
      restore(FauxtonAPI.when);
      restore(FauxtonAPI.addNotification);
    });

    it('calls optionDeleteSuccess when option delete succeeds', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(Actions, 'optionDeleteSuccess');
      var promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      Actions.deleteOption(node, option);
      assert.ok(spy.calledOnce);
    });

    it('shows notification when option delete succeeds', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(FauxtonAPI, 'addNotification');
      var promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      Actions.deleteOption(node, option);
      assert.ok(spy.calledOnce);
    });

    it('calls optionDeleteFailure when option delete fails', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(Actions, 'optionDeleteFailure');
      var promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      Actions.deleteOption(node, option);
      assert.ok(spy.calledOnce);
    });

    it('shows notification when option delete fails', function () {
      var stub = sinon.stub(FauxtonAPI, 'when');
      var spy = sinon.spy(FauxtonAPI, 'addNotification');
      var promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      Actions.deleteOption(node, option);
      assert.ok(spy.calledOnce);
    });
  });
});

