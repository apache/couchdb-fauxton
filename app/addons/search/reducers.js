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
import Constants from './constants';
import SearchResources from './resources';
import DocumentsHelpers from '../documents/helpers';

const initialState = {
  designDocs: new Backbone.Collection(),
  database: {},
  loading: true,
  ddocName: 'new-doc',
  partitionKey: '',
  indexName: '',
  databaseName: '',
  ...softReset()
};

var keys = [];
function getUniqueKey() {
  function keygen () {
    return Math.random().toString(36).substring(7);
  }

  var newKey = keygen();
  while (keys.includes(newKey)) {
    newKey = keygen();
  }
  keys.push(newKey);
  return newKey;
}

// called on first load (e.g. editing a search index) and every time the create search index page loads
function softReset() {
  return {
    noResultsWarning: '',
    hasActiveQuery: false,
    searchQuery: '',
    searchResults: undefined,
    searchPerformed: false,
    newDesignDocName: '',
    newDesignDocPartitioned: true,
    lastSavedSearchIndexName: '',
    searchIndexFunction: Constants.DEFAULT_SEARCH_INDEX_FUNCTION,
    searchIndexName: Constants.DEFAULT_SEARCH_INDEX_NAME,
    analyzerType: Constants.DEFAULT_ANALYZER_TYPE,
    analyzerFields: [],
    singleAnalyzer: Constants.DEFAULT_ANALYZER,
    defaultMultipleAnalyzer: Constants.DEFAULT_ANALYZER
  };
}

function addAnalyzerRow (state, { analyzer, fieldName }) {
  const newAnalyzerFields = state.analyzerFields.slice();
  newAnalyzerFields.push({
    key: getUniqueKey(),
    fieldName: (fieldName) ? fieldName : '',
    analyzer: analyzer,
    valid: (fieldName && fieldName.trim().length > 0)
  });
  return newAnalyzerFields;
}

function removeAnalyzerRowByIndex (state, rowIndex) {
  const newAnalyzerFields = state.analyzerFields.slice();
  rowIndex = parseInt(rowIndex, 10);
  newAnalyzerFields.splice(rowIndex, 1);
  return newAnalyzerFields;
}

function setAnalyzerRowFieldName (state, { fieldName, rowIndex }) {
  const newAnalyzerFields = state.analyzerFields.slice();
  const idx = parseInt(rowIndex, 10);
  newAnalyzerFields[idx].fieldName = fieldName;
  newAnalyzerFields[idx].valid = fieldName !== '';
  return newAnalyzerFields;
}

function setAnalyzerRow (state, { analyzer, rowIndex }) {
  const newAnalyzerFields = state.analyzerFields.slice();
  const idx = parseInt(rowIndex, 10);
  newAnalyzerFields[idx].analyzer = analyzer;
  return newAnalyzerFields;
}

function initEditSearch (state, { database, designDocs, ddocID, indexName }) {
  const ddoc = designDocs.find(ddoc => {
    return ddoc.id === ddocID;
  }).dDocModel();

  // the selected analyzer returned in the ddoc can be applied to both the single analyzer and the default multiple
  // analyzer. We store them separately in the store so those values don't change when toggling from Single to Multiple
  const analyzer = ddoc.getAnalyzer(indexName);
  let newSingleAnalyzer;
  if (_.isString(analyzer)) {
    newSingleAnalyzer = analyzer;
  } else {
    if (_.has(analyzer, 'default')) {
      newSingleAnalyzer = analyzer.default;
    } else {
      newSingleAnalyzer = Constants.DEFAULT_ANALYZER;
    }
  }
  const newAnalyzerFields = [];
  if (analyzer && analyzer.fields) {
    Object.keys(analyzer.fields).forEach(fieldName => {
      newAnalyzerFields.push({
        key: getUniqueKey(),
        fieldName: (fieldName) ? fieldName : '',
        analyzer: analyzer.fields[fieldName],
        valid: !_.isUndefined(fieldName) && !_.isEmpty(fieldName)
      });
    });
  }

  return {
    loading: false,
    searchPerformed: false,
    database: database,
    designDocs: designDocs,
    searchIndexName: indexName,
    ddocName: ddocID,
    lastSavedSearchIndexName: indexName,
    lastSavedDesignDocName: ddocID,
    searchIndexFunction: ddoc.getIndex(indexName),
    analyzerType: ddoc.analyzerType(indexName),
    // this either returns a simple string (single) or a complex object (multiple)
    singleAnalyzer: newSingleAnalyzer,
    defaultMultipleAnalyzer: newSingleAnalyzer,
    analyzerFields: newAnalyzerFields
  };
}

export function getSaveDesignDoc (state, isDbPartitioned) {
  if (state.ddocName === 'new-doc') {
    const doc = {
      _id: '_design/' + state.newDesignDocName,
      views: {},
      language: 'javascript'
    };
    const dDoc = new SearchResources.Doc(doc, { database: state.database });
    if (isDbPartitioned) {
      dDoc.setDDocPartitionedOption(state.newDesignDocPartitioned);
    }
    return dDoc;
  }

  const foundDoc = state.designDocs.find((ddoc) => {
    return ddoc.id === state.ddocName ||
      ddoc.id === '_design/' + state.ddocName;
  });
  return (!foundDoc) ? null : foundDoc.dDocModel();
}

export function getSelectedDesignDocPartitioned(state, isDbPartitioned) {
  const designDoc = state.designDocs.find(ddoc => {
    return ddoc.id === state.ddocName ||
      ddoc.id === '_design/' + state.ddocName;
  });
  if (designDoc) {
    return DocumentsHelpers.isDDocPartitioned(designDoc.get('doc'), isDbPartitioned);
  }
  return false;
}

export default function search(state = initialState, action) {
  const options = action.options;
  switch (action.type) {

    case ActionTypes.SEARCH_INDEX_SET_LOADING:
      return {
        ...state,
        loading: options.loading
      };

    case ActionTypes.SEARCH_INDEX_DESIGN_DOCS_LOADED:
      const newState = {
        ...state,
        loading: false,
        designDocs: options.designDocs,
        database: options.database,
        ...softReset()
      };
      if (options.defaultDDoc) {
        newState.ddocName = '_design/' + options.defaultDDoc;
      }
      return newState;

    case ActionTypes.SEARCH_INDEX_SET_NAME:
      return {
        ...state,
        searchIndexName: options.value
      };

    case ActionTypes.SEARCH_INDEX_SET_ANALYZER_TYPE:
      return {
        ...state,
        analyzerType: options.value
      };

    case ActionTypes.SEARCH_INDEX_SET_SINGLE_ANALYZER:
      return {
        ...state,
        singleAnalyzer: options.analyzer
      };

    case ActionTypes.SEARCH_INDEX_ADD_ANALYZER_ROW:
      return {
        ...state,
        analyzerFields: addAnalyzerRow(state, options)
      };

    case ActionTypes.SEARCH_INDEX_PREVIEW_REQUEST_MADE:
      return {
        ...state,
        hasActiveQuery: true
      };

    case ActionTypes.SEARCH_INDEX_PREVIEW_REQUEST_ERROR:
      return {
        ...state,
        hasActiveQuery: false,
        searchResults: []
      };

    case ActionTypes.SEARCH_INDEX_SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: options.query
      };

    case ActionTypes.SEARCH_INDEX_PREVIEW_MODEL_UPDATED:
      return {
        ...state,
        searchResults: options.searchResults,
        hasActiveQuery: false,
        searchPerformed: true
      };

    case ActionTypes.SEARCH_INDEX_REMOVE_ANALYZER_ROW:
      return {
        ...state,
        analyzerFields: removeAnalyzerRowByIndex(state, options.rowIndex)
      };

    case ActionTypes.SEARCH_INDEX_SET_ANALYZER_ROW_FIELD_NAME:
      return {
        ...state,
        analyzerFields: setAnalyzerRowFieldName(state, options)
      };

    case ActionTypes.SEARCH_INDEX_SET_ANALYZER_ROW:
      return {
        ...state,
        analyzerFields: setAnalyzerRow(state, options)
      };

    case ActionTypes.SEARCH_INDEX_SET_DEFAULT_MULTIPLE_ANALYZER:
      return {
        ...state,
        defaultMultipleAnalyzer: options.analyzer
      };

    case ActionTypes.SEARCH_INDEX_INIT_EDIT_SEARCH_INDEX:
      return {
        ...state,
        ...initEditSearch(state, options)
      };

    case ActionTypes.SEARCH_INDEX_SELECT_DESIGN_DOC:
      return {
        ...state,
        ddocName: options.value
      };

    case ActionTypes.SEARCH_INDEX_CLEAR:
      return {
        ...initialState,
        designDocs: new Backbone.Collection()
      };

    case ActionTypes.SEARCH_INDEX_INIT:
      return {
        ...state,
        loading: false,
        databaseName: options.databaseName,
        partitionKey: options.partitionKey,
        ddocName: options.ddocName,
        indexName: options.indexName,
        searchQuery: options.searchQuery,
        searchResults: options.searchQuery === '' ? undefined : state.searchResults,
        noResultsWarning: ''
      };

    case ActionTypes.SEARCH_INDEX_NEW_DESIGN_DOC_NAME_UPDATED:
      return {
        ...state,
        newDesignDocName: options.value
      };

    case ActionTypes.SEARCH_INDEX_NEW_DESIGN_DOC_PARTITONED_UPDATED:
      return {
        ...state,
        newDesignDocPartitioned: options.value
      };

    case ActionTypes.SEARCH_INDEX_PARTITION_PARAM_NOT_SUPPORTED:
      return {
        ...state,
        noResultsWarning: 'The selected index does not support partitions. Switch back to global mode.'
      };

    case ActionTypes.SEARCH_INDEX_PARTITION_PARAM_MANDATORY:
      return {
        ...state,
        noResultsWarning: 'The selected index requires a partition key. Use the selector at the top to enter a partition key.'
      };

    default:
      return state;
  }
}
