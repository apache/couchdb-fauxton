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
import utils from '../../../../test/mocha/testUtils';
import FauxtonAPI from '../../../core/api';
import Actions from '../actions';
import * as API from '../api';
import '../base';
import '../../documents/base';

const {restore} = utils;
FauxtonAPI.router = new FauxtonAPI.Router([]);

describe('search actions', () => {

  afterEach(() => {
    restore(FauxtonAPI.navigate);
    restore(FauxtonAPI.addNotification);
    restore(API.fetchSearchResults);
  });

  it("should show a notification and redirect if database doesn't exist", () => {
    const navigateSpy = sinon.spy(FauxtonAPI, 'navigate');
    const notificationSpy = sinon.spy(FauxtonAPI, 'addNotification');
    sinon.stub(API, 'fetchSearchResults').rejects(new Error('db not found'));
    FauxtonAPI.reduxDispatch = () => {};

    const params = {
      databaseName: 'safe-id-db',
      designDoc: 'design-doc',
      indexName: 'idx1',
      query: 'a_query'
    };
    return Actions.dispatchInitSearchIndex(params)
      .then(() => {
        expect(notificationSpy.calledOnce).toBeTruthy();
        expect(/db not found/.test(notificationSpy.args[0][0].msg)).toBeTruthy();
        expect(navigateSpy.calledOnce).toBeTruthy();
        expect(navigateSpy.args[0][0]).toBe('database/safe-id-db/_all_docs');
      });
  });

});
