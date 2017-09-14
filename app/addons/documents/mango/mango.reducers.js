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

import app from "../../../app";
import ActionTypes from "./mango.actiontypes";
import MangoHelper from "./mango.helper";
import constants from "./mango.constants";

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

const createSelectItem = (code) => {
  // ensure we're working with a deserialized query object
  const object = typeof code === "string" ? JSON.parse(code) : code;

  const singleLineValue = JSON.stringify(object);
  const multiLineValue = MangoHelper.formatCode(object);

  return {
    label: singleLineValue,
    value: multiLineValue,
    className: 'mango-select-entry'
  };
};

const getDefaultHistory = () => {
  return [createSelectItem(defaultQueryFindCode)];
};

const getDefaultQueryIndexTemplates = () => {
  return constants.INDEX_TEMPLATES.map((el) => {
    const item = createSelectItem(el.code);
    item.label = el.label || item.label;
    return item;
  });
};

const HISTORY_LIMIT = 5;

const initialState = {
  queryFindCode: defaultQueryFindCode,
  queryIndexCode: defaultQueryIndexCode,
  queryFindCodeChanged: false,
  explainPlan: undefined,
  history: getDefaultHistory(),
  historyKey: 'default',
  queryIndexTemplates: getDefaultQueryIndexTemplates()
};

const loadQueryHistory = (databaseName) => {
  const historyKey = databaseName + '_queryhistory';
  return app.utils.localStorageGet(historyKey) || getDefaultHistory();
};

const updateQueryHistory = ({ historyKey, history }, queryCode, label) => {
  const newHistory = history.slice();

  const historyEntry = createSelectItem(queryCode);
  historyEntry.label = label || historyEntry.label;

  // remove existing entry if it exists
  const indexOfExisting = newHistory.findIndex(el => el.value === historyEntry.value);
  if (indexOfExisting > -1) {
    newHistory.splice(indexOfExisting, 1);
  }

  // insert item at head of array
  newHistory.unshift(historyEntry);

  // limit array length
  if (newHistory.length > HISTORY_LIMIT) {
    newHistory.splice(HISTORY_LIMIT, 1);
  }

  app.utils.localStorageSet(historyKey, newHistory);

  return newHistory;
};

const updateQueryIndexTemplates = ({ queryIndexTemplates }, value, label) => {
  const newTemplates = queryIndexTemplates.slice();
  const templateItem = createSelectItem(value);
  templateItem.label = label || templateItem.label;

  const existing = newTemplates.find(i => i.value === templateItem.value);
  if (!existing) {
    newTemplates.push(templateItem);
  }
};

export default function mangoquery(state = initialState, action) {
  const { options } = action;
  switch (action.type) {

    case ActionTypes.MANGO_SET_DB:
      return {
        ...state,
        database: options.database,
        historyKey: options.database ? options.database.id : 'default'
      };

    case ActionTypes.MANGO_LOAD_QUERY_HISTORY:
      return {
        ...state,
        history: loadQueryHistory(options.databaseName),
        historyKey: options.databaseName + '_queryhistory'
      };

    case ActionTypes.MANGO_NEW_QUERY_FIND_CODE:
      return {
        ...state,
        queryFindCode: options.queryCode,
        history: updateQueryHistory(state, options.queryCode)
      };

    case ActionTypes.MANGO_RESET:
      return {
        ...state,
        getLoadingIndexes: options.isLoading
      };

    case ActionTypes.MANGO_NEW_QUERY_CREATE_INDEX_TEMPLATE:
      return {
        ...state,
        queryIndexCode: options.code,
        queryIndexTemplates: updateQueryIndexTemplates(state, options.code, options.label)
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
