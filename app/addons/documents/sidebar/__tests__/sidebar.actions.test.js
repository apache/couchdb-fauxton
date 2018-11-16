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

import utils from '../../../../../test/mocha/testUtils';
import FauxtonAPI from "../../../../core/api";
import Actions from '../actions';
import sinon from 'sinon';

const {restore} = utils;
FauxtonAPI.router = new FauxtonAPI.Router([]);

describe('Sidebar actions', () => {

  beforeEach(() => {
    FauxtonAPI.reduxState = sinon.stub().returns({
      sidebar:{
        loading: true
      }
    });
    FauxtonAPI.reduxDispatch = sinon.stub();
  });

  afterEach(() => {
    restore(FauxtonAPI.navigate);
    restore(FauxtonAPI.addNotification);
  });

  it("should show a notification and redirect if database doesn't exist", (done) => {
    const navigateSpy = sinon.spy(FauxtonAPI, 'navigate');
    const notificationSpy = sinon.spy(FauxtonAPI, 'addNotification');

    const database = {
      safeID : () => 'safe-id-db'
    };

    const options = {
      database,
      designDocs: {
        database,
        fetch: () => {
          return Promise.reject({
            responseJSON: {
              error: 'not_found'
            }
          });
        },
      }
    };

    Actions.dispatchNewOptions(options);
    process.nextTick(() => {
      expect(notificationSpy.calledOnce).toBeTruthy();
      expect(/not exist/.test(notificationSpy.args[0][0].msg)).toBeTruthy();
      expect(navigateSpy.calledOnce).toBeTruthy();
      expect(navigateSpy.args[0][0]).toEqual('/');
      done();
    });
  });

});
