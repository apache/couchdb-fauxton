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

import databases from '../reducers';
import ActionTypes from '../actiontypes';

describe('Databases Reducer', () => {

  it('sets if partioned database feature is available', () => {
    const action = {
      type: ActionTypes.DATABASES_PARTITIONED_DB_AVAILABLE,
      options: { available: true }
    };
    let newState = databases(undefined, { type: 'DO_NOTHIN'});
    expect(newState.partitionedDatabasesAvailable).toBe(false);

    newState = databases(newState, action);
    expect(newState.partitionedDatabasesAvailable).toBe(true);
  });

  it('sets isPartitioned to false when props is not present', () => {
    const action = {
      type: ActionTypes.DATABASES_FETCH_SELECTED_DB_METADATA_SUCCESS,
      options: {
        metadata: { name: 'dummy_db' }
      }
    };
    const newState = databases(undefined, action);
    expect(newState.isDbPartitioned).toBe(false);
    expect(newState.dbInfo).toBeDefined();
    expect(newState.dbInfo.name).toBe('dummy_db');
  });

  it('sets isPartitioned based on db metadata', () => {
    const action = {
      type: ActionTypes.DATABASES_FETCH_SELECTED_DB_METADATA_SUCCESS,
      options: {
        metadata: {
          name: 'dummy_db',
          props: { partitioned: true }
        }
      }
    };
    const newState = databases(undefined, action);
    expect(newState.isDbPartitioned).toBe(true);

    action.options.metadata.props.partitioned = false;
    const newState2 = databases(undefined, action);
    expect(newState2.isDbPartitioned).toBe(false);
  });

});
