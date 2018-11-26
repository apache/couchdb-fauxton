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
import Resources from '../resources';
import Helpers from '../helpers';

const defaultMap = 'function (doc) {\n  emit(doc._id, 1);\n}';
const defaultReduce = 'function (keys, values, rereduce) {\n  if (rereduce) {\n    return sum(values);\n  } else {\n    return values.length;\n  }\n}';
const builtInReducers = ['_sum', '_count', '_stats', '_approx_count_distinct'];
const allReducers = builtInReducers.concat(['CUSTOM', 'NONE']);

const initialState = {
  designDocs: new Backbone.Collection(),
  isLoading: true,
  view: { reduce: '', map: defaultMap },
  database: { id: '0' },
  designDocId: '',
  isNewDesignDoc: false,
  newDesignDocName: '',
  newDesignDocPartitioned: true,
  isNewView: false,
  viewName: '',
  originalViewName: '',
  originalDesignDocName: '',
  reduceOptions: allReducers
};

function editIndex(state, options) {
  const newState = {
    ...state,
    isLoading: false,
    newDesignDocName: '',
    isNewView: options.isNewView,
    viewName: options.viewName || 'viewName',
    isNewDesignDoc: options.isNewDesignDoc || false,
    designDocs: options.designDocs,
    designDocId: options.designDocId,
    originalDesignDocName: options.designDocId,
    database: options.database
  };
  newState.originalViewName = newState.viewName;
  newState.view = getView(newState);
  return newState;
}

function getView(state) {
  if (state.isNewView || state.isNewDesignDoc) {
    return { reduce: '', map: defaultMap };
  }

  const designDoc = state.designDocs.find(ddoc => {
    return state.designDocId == ddoc.id;
  }).dDocModel();
  return designDoc.get('views')[state.viewName];
}

export function getSelectedDesignDocPartitioned(state, isDbPartitioned) {
  const designDoc = state.designDocs.find(ddoc => {
    return state.designDocId === ddoc.id;
  });
  if (designDoc) {
    return Helpers.isDDocPartitioned(designDoc.get('doc'), isDbPartitioned);
  }
  return false;
}

export function reduceSelectedOption(state) {
  if (!state.view.reduce) {
    return 'NONE';
  }
  if (hasCustomReduce(state)) {
    return 'CUSTOM';
  }
  return state.view.reduce;
}

export function hasCustomReduce(state) {
  if (state.view.reduce) {
    return !builtInReducers.includes(state.view.reduce);
  }
  return false;
}

export function getSaveDesignDoc(state, isDbPartitioned) {
  if (state.designDocId === 'new-doc') {
    const doc = {
      _id: '_design/' + state.newDesignDocName,
      views: {},
      language: 'javascript'
    };
    const dDoc = new Resources.Doc(doc, { database: state.database });
    if (isDbPartitioned) {
      dDoc.setDDocPartitionedOption(state.newDesignDocPartitioned);
    }
    return dDoc;
  }

  if (!state.designDocs) {
    return null;
  }

  const foundDoc = state.designDocs.find(ddoc => {
    return ddoc.id === state.designDocId;
  });

  return foundDoc ? foundDoc.dDocModel() : null;
}

// returns a simple array of design doc IDs. Omits mango docs
export function getDesignDocList(state) {
  if (!state.designDocs) {
    return [];
  }
  return state.designDocs.filter(doc => {
    return !doc.isMangoDoc();
  }).map(doc => {
    return doc.id;
  });
}

export default function indexEditor(state = initialState, action) {
  const { options } = action;
  switch (action.type) {

    case ActionTypes.CLEAR_INDEX:
      return {
        ...initialState
      };

    case ActionTypes.EDIT_INDEX:
      return editIndex(state, options);

    case ActionTypes.EDIT_NEW_INDEX:
      return editIndex(state, options);

    case ActionTypes.VIEW_NAME_CHANGE:
      return {
        ...state,
        viewName: action.name
      };

    case ActionTypes.SELECT_REDUCE_CHANGE:
      let newReduce = action.reduceSelectedOption;
      if (newReduce === 'NONE') {
        newReduce = '';
      }
      if (newReduce === 'CUSTOM') {
        newReduce = defaultReduce;
      }
      return {
        ...state,
        view: {
          ...state.view,
          reduce: newReduce
        }
      };

    case ActionTypes.DESIGN_DOC_CHANGE:
      return {
        ...state,
        designDocId: options.value
      };

    case ActionTypes.VIEW_SAVED:
      return state;

    case ActionTypes.VIEW_CREATED:
      return state;

    case ActionTypes.VIEW_ADD_DESIGN_DOC:
      return {
        ...state,
        designDocId: action.designDoc._id
      };

    case ActionTypes.VIEW_UPDATE_MAP_CODE:
      return {
        ...state,
        view: {
          ...state.view,
          map: action.code
        }
      };

    case ActionTypes.VIEW_UPDATE_REDUCE_CODE:
      return {
        ...state,
        view: {
          ...state.view,
          reduce: action.code
        }
      };

    case ActionTypes.DESIGN_DOC_NEW_NAME_UPDATED:
      return {
        ...state,
        newDesignDocName: options.value
      };

    case ActionTypes.DESIGN_DOC_NEW_PARTITIONED_UPDATED:
      return {
        ...state,
        newDesignDocPartitioned: options.value
      };

    default:
      return state;
  }
}
