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
import Backbone from "backbone";
import sinon from "sinon";

const assert = testUtils.assert;
const restore = testUtils.restore;

describe('Config Actions', () => {
  const node = 'test';
  const option = {
    sectionName: 'test',
    optionName: 'test',
    value: 'test'
  };
  const failXhr = { responseText: '{}' };

  describe('add', () => {
    afterEach(() => {
      restore(Actions.optionAddSuccess);
      restore(Actions.optionAddFailure);
      restore(FauxtonAPI.when);
      restore(FauxtonAPI.addNotification);
      restore(Backbone.Model.prototype.save);
    });

    it('calls optionAddSuccess when option add succeeds', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'save');
      const spy = sinon.spy(Actions, 'optionAddSuccess');
      const promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      return Actions.addOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });

    it('shows notification when option add succeeds', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'save');
      const spy = sinon.spy(FauxtonAPI, 'addNotification');
      const promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      return Actions.addOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });

    it('calls optionAddFailure when option add fails', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'save');
      const spy = sinon.spy(Actions, 'optionAddFailure');
      const promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      return Actions.addOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });

    it('shows notification when option add fails', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'save');
      const spy = sinon.spy(FauxtonAPI, 'addNotification');
      const promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      return Actions.addOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });
  });

  describe('save', () => {
    afterEach(() => {
      restore(Actions.optionSaveSuccess);
      restore(Actions.optionSaveFailure);
      restore(FauxtonAPI.when);
      restore(FauxtonAPI.addNotification);
      restore(Backbone.Model.prototype.save);
    });

    it('calls optionSaveSuccess when option save succeeds', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'save');
      const spy = sinon.spy(Actions, 'optionSaveSuccess');
      const promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      return Actions.saveOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });

    it('shows notification when option save succeeds', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'save');
      const spy = sinon.spy(FauxtonAPI, 'addNotification');
      const promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      return Actions.saveOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });

    it('calls optionSaveFailure when option save fails', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'save');
      const spy = sinon.spy(Actions, 'optionSaveFailure');
      const promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      return Actions.saveOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });

    it('shows notification when option save fails', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'save');
      const spy = sinon.spy(FauxtonAPI, 'addNotification');
      const promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      return Actions.saveOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });
  });

  describe('delete', () => {
    afterEach(() => {
      restore(Actions.optionDeleteSuccess);
      restore(Actions.optionDeleteFailure);
      restore(FauxtonAPI.when);
      restore(FauxtonAPI.addNotification);
      restore(Backbone.Model.prototype.destroy);
    });

    it('calls optionDeleteSuccess when option delete succeeds', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'destroy');
      const spy = sinon.spy(Actions, 'optionDeleteSuccess');
      const promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      return Actions.deleteOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });

    it('shows notification when option delete succeeds', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'destroy');
      const spy = sinon.spy(FauxtonAPI, 'addNotification');
      const promise = FauxtonAPI.Deferred();
      promise.resolve();
      stub.returns(promise);

      return Actions.deleteOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });

    it('calls optionDeleteFailure when option delete fails', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'destroy');
      const spy = sinon.spy(Actions, 'optionDeleteFailure');
      const promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      return Actions.deleteOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });

    it('shows notification when option delete fails', () => {
      const stub = sinon.stub(Backbone.Model.prototype, 'destroy');
      const spy = sinon.spy(FauxtonAPI, 'addNotification');
      const promise = FauxtonAPI.Deferred();
      promise.reject(failXhr);
      stub.returns(promise);

      return Actions.deleteOption(node, option)
      .then(() => {
        assert.ok(spy.calledOnce);
      });
    });
  });
});

