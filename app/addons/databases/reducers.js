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

import ActionTypes from './actiontypes';
const initialState = {
  partitionedDatabasesAvailable: false,
  isLoadingDbInfo: true,
  dbInfo: undefined,
  isDbPartitioned: false
};

export function isPartitioned(metadata) {
  if (metadata && metadata.props && metadata.props.partitioned === true) {
    return true;
  }
  return false;
}

export default function databases(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.DATABASES_PARTITIONED_DB_AVAILABLE:
      return {
        ...state,
        partitionedDatabasesAvailable: action.options.available
      };
    case ActionTypes.DATABASES_FETCH_SELECTED_DB_METADATA:
      return {
        ...state,
        isLoadingDbInfo: true,
        dbInfo: undefined,
        isDbPartitioned: false
      };
    case ActionTypes.DATABASES_FETCH_SELECTED_DB_METADATA_SUCCESS:
      return {
        ...state,
        isLoadingDbInfo: false,
        dbInfo: action.options.metadata,
        isDbPartitioned: isPartitioned(action.options.metadata)
      };
    default:
      return state;
  }
}
