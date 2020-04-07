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

import sinon from 'sinon';
import FauxtonAPI from '../../../core/api';
import testUtils from '../../../../test/mocha/testUtils';
import Actions from '../designdocinfo/actions';

const {restore} = testUtils;

describe('DesignDocInfo Actions', () => {

  describe('fetchDesignDocInfo', () => {

    afterEach(() => {
      restore(window.setInterval);
      testUtils.restore(FauxtonAPI.addNotification);
    });

    it('schedules regular updates on successful fetch', () => {
      const promise = FauxtonAPI.Deferred();
      promise.resolve();
      const fakeDesignDocInfo = {
        fetch: () => {
          return promise;
        }
      };

      const spy = sinon.spy(window, 'setInterval');
      const dispatch = sinon.stub();

      return Actions.fetchDesignDocInfo({
        ddocName: 'test-designdoc-info',
        designDocInfo: fakeDesignDocInfo
      })(dispatch).then(() => {
        expect(spy.calledOnce).toBeTruthy();
      });
    });

    it('shows error message in case of failure', () => {
      const promise = FauxtonAPI.Deferred();
      promise.reject();
      const fakeDesignDocInfo = {
        fetch: () => {
          return promise;
        }
      };

      const notificationSpy = sinon.spy(FauxtonAPI, 'addNotification');
      const dispatch = sinon.stub();

      return Actions.fetchDesignDocInfo({
        ddocName: 'test-designdoc-info',
        designDocInfo: fakeDesignDocInfo
      })(dispatch).then(() => {
        sinon.assert.calledOnce(notificationSpy);
      });
    });
  });
});
