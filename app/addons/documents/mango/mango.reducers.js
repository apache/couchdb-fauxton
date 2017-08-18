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

import ActionTypes from "./mango.actiontypes";

const defaultQueryIndexCode = {
  "index": {
    "fields": ["_id"]
  },
  "type": "json"
};

const defaultQueryFindCode = {
  "selector": {
    "_id": { "$gt": null }
  }
};

const initialState = {
  queryFindCode: defaultQueryFindCode,
  queryIndexCode: defaultQueryIndexCode,
  queryFindCodeChanged: false,
  explainPlan: undefined
};

export default function mangoquery(state = initialState, action) {
  const { options } = action;
  switch (action.type) {

    case ActionTypes.MANGO_SET_DB:
      return {
        ...state,
        database: options.database
      };

    case ActionTypes.MANGO_NEW_QUERY_FIND_CODE:
      return {
        ...state,
        queryFindCode: options.queryCode
      };

    case ActionTypes.MANGO_RESET:
      return {
        ...state,
        getLoadingIndexes: options.isLoading
      };

    case ActionTypes.MANGO_NEW_QUERY_CREATE_INDEX_CODE:
      return {
        ...state,
        queryIndexCode: options.code
      };

    case ActionTypes.MANGO_SHOW_EXPLAIN_RESULTS:
      return {
        ...state,
        explainPlan: options.explainPlan
      };

    case ActionTypes.MANGO_HIDE_EXPLAIN_RESULTS:
      return {
        ...state,
        explainPlan: false
      };

    default:
      return state;
  }
};
