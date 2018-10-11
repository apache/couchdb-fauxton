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
import testUtils from '../../../../test/mocha/testUtils';
import FauxtonAPI from '../../../core/api';
import * as Actions from '../actions';
import ActionTypes from '../actiontypes';
import * as ConfigAPI from '../api';
import sinon from 'sinon';

const restore = testUtils.restore;

describe('Config Actions', () => {
  const node = 'test';
  const option = {
    sectionName: 'test',
    optionName: 'test',
    value: 'test'
  };
  const spySaveConfigOption = sinon.stub(ConfigAPI, 'saveConfigOption');
  const spyDeleteConfigOption = sinon.stub(ConfigAPI, 'deleteConfigOption');
  const dispatch = sinon.stub();

  describe('addOption', () => {

    afterEach(() => {
      spySaveConfigOption.reset();
      dispatch.reset();
      restore(FauxtonAPI.addNotification);
    });

    it('dispatches OPTION_ADD_SUCCESS and shows notification when option add succeeds', () => {
      const promise = FauxtonAPI.Promise.resolve();
      spySaveConfigOption.returns(promise);
      const spyAddNotification = sinon.spy(FauxtonAPI, 'addNotification');

      return Actions.addOption(node, option)(dispatch)
        .then(() => {
          sinon.assert.calledWith(dispatch, {
            type: ActionTypes.OPTION_ADD_SUCCESS,
            options: { optionName: "test", sectionName: "test", value: "test" }
          });
          sinon.assert.called(spyAddNotification);
        });
    });

    it('dispatches OPTION_ADD_FAILURE and shows notification when option add fails', () => {
      const promise = FauxtonAPI.Promise.reject(new Error(''));
      spySaveConfigOption.returns(promise);
      const spyAddNotification = sinon.spy(FauxtonAPI, 'addNotification');

      return Actions.addOption(node, option)(dispatch)
        .then(() => {
          sinon.assert.calledWith(dispatch, {
            type: ActionTypes.OPTION_ADD_FAILURE,
            options: { optionName: "test", sectionName: "test", value: "test" }
          });
          sinon.assert.called(spyAddNotification);
        });
    });
  });

  describe('saveOption', () => {
    afterEach(() => {
      spySaveConfigOption.reset();
      dispatch.reset();
      restore(FauxtonAPI.addNotification);
    });

    it('dispatches OPTION_SAVE_SUCCESS and shows notification when option add succeeds', () => {
      const promise = FauxtonAPI.Promise.resolve();
      spySaveConfigOption.returns(promise);
      const spyAddNotification = sinon.spy(FauxtonAPI, 'addNotification');

      return Actions.saveOption(node, option)(dispatch)
        .then(() => {
          sinon.assert.calledWith(dispatch, {
            type: ActionTypes.OPTION_SAVE_SUCCESS,
            options: { optionName: "test", sectionName: "test", value: "test" }
          });
          sinon.assert.called(spyAddNotification);
        });
    });

    it('dispatches OPTION_SAVE_FAILURE and shows notification when option add fails', () => {
      const promise = FauxtonAPI.Promise.reject(new Error(''));
      spySaveConfigOption.returns(promise);
      const spyAddNotification = sinon.spy(FauxtonAPI, 'addNotification');

      return Actions.saveOption(node, option)(dispatch)
        .then(() => {
          sinon.assert.calledWith(dispatch, {
            type: ActionTypes.OPTION_SAVE_FAILURE,
            options: { optionName: "test", sectionName: "test", value: "test" }
          });
          sinon.assert.called(spyAddNotification);
        });
    });
  });

  describe('deleteOption', () => {
    afterEach(() => {
      spyDeleteConfigOption.reset();
      dispatch.reset();
      restore(FauxtonAPI.addNotification);
    });

    it('dispatches OPTION_DELETE_SUCCESS and shows notification when option add succeeds', () => {
      const promise = FauxtonAPI.Promise.resolve();
      spyDeleteConfigOption.returns(promise);
      const spyAddNotification = sinon.spy(FauxtonAPI, 'addNotification');

      return Actions.deleteOption(node, option)(dispatch)
        .then(() => {
          sinon.assert.calledWith(dispatch, {
            type: ActionTypes.OPTION_DELETE_SUCCESS,
            options: { optionName: "test", sectionName: "test", value: "test" }
          });
          sinon.assert.called(spyAddNotification);
        });
    });

    it('dispatches OPTION_DELETE_FAILURE and shows notification when option add fails', () => {
      const promise = FauxtonAPI.Promise.reject(new Error(''));
      spyDeleteConfigOption.returns(promise);
      const spyAddNotification = sinon.spy(FauxtonAPI, 'addNotification');

      return Actions.deleteOption(node, option)(dispatch)
        .then(() => {
          sinon.assert.calledWith(dispatch, {
            type: ActionTypes.OPTION_DELETE_FAILURE,
            options: { optionName: "test", sectionName: "test", value: "test" }
          });
          sinon.assert.called(spyAddNotification);
        });
    });
  });
});

