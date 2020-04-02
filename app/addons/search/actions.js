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

import FauxtonAPI from '../../core/api';
import ActionTypes from './actiontypes';
import Search from './resources';
import SidebarActions from '../documents/sidebar/actions';
import IndexEditorActions from '../documents/index-editor/actions';
import * as API from './api';

const dispatchInitNewSearchIndex = (params) => {
  // ensure we start with a clear slate
  FauxtonAPI.reduxDispatch({ type: ActionTypes.SEARCH_INDEX_CLEAR });
  FauxtonAPI.reduxDispatch({
    type: ActionTypes.SEARCH_INDEX_SET_LOADING,
    options: {
      loading: true
    }
  });

  params.designDocs.fetch().then(() => {
    FauxtonAPI.reduxDispatch({
      type: ActionTypes.SEARCH_INDEX_DESIGN_DOCS_LOADED,
      options: {
        designDocs: params.designDocs,
        defaultDDoc: params.defaultDDoc,
        database: params.database
      }
    });
  });
};

const dispatchInitSearchIndex = (params)  => {
  FauxtonAPI.reduxDispatch({
    type: ActionTypes.SEARCH_INDEX_SET_LOADING,
    options: {
      loading: true
    }
  });

  FauxtonAPI.reduxDispatch({
    type: ActionTypes.SEARCH_INDEX_INIT,
    options: {
      databaseName: params.databaseName,
      partitionKey: params.partitionKey,
      ddocName: params.designDoc,
      indexName: params.indexName,
      searchQuery: params.query ? params.query : ''
    }
  });

  if (params.query) {
    return executSearchQuery(params.databaseName, params.partitionKey, params.designDoc,
      params.indexName, params.query, FauxtonAPI.reduxDispatch);
  }
};

const dispatchEditSearchIndex = (params) => {
  const {database, ddocID, designDocs, indexName} = params;
  FauxtonAPI.reduxDispatch({
    type: ActionTypes.SEARCH_INDEX_SET_LOADING,
    options: {
      loading: true
    }
  });

  designDocs.fetch().then(ddocs => {
    const ddoc = ddocs.rows.find(ddoc => ddoc._id === ddocID).doc;
    if (!ddoc.indexes || !ddoc.indexes[indexName]) {
      throw Error(`Index "${indexName}" not found`);
    }
    FauxtonAPI.reduxDispatch({
      type: ActionTypes.SEARCH_INDEX_INIT_EDIT_SEARCH_INDEX,
      options: {
        indexName,
        database,
        ddocID,
        designDocs,
      }
    });
  }).catch(err => {
    const details = err.message ? err.message : '';
    FauxtonAPI.addNotification({
      msg: `There was a problem editing the search index "${indexName}". ` + details,
      type: 'error',
      clear: true
    });
  });
};

const selectTab = (tab) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_SELECT_TAB,
    options: {
      tab: tab
    }
  });
};

const setSearchIndexName = (str) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_SET_NAME,
    options: {
      value: str
    }
  });
};

const setAnalyzerType = (type) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_SET_ANALYZER_TYPE,
    options: {
      value: type
    }
  });
};

const addAnalyzerRow = (analyzer) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_ADD_ANALYZER_ROW,
    options: {
      analyzer: analyzer
    }
  });
};

const removeAnalyzerRow = (rowIndex) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_REMOVE_ANALYZER_ROW,
    options: {
      rowIndex: rowIndex
    }
  });
};

const setAnalyzerRowFieldName = (params) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_SET_ANALYZER_ROW_FIELD_NAME,
    options: {
      rowIndex: params.rowIndex,
      fieldName: params.fieldName
    }
  });
};

const setAnalyzer = (params) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_SET_ANALYZER_ROW,
    options: {
      rowIndex: params.rowIndex,
      analyzer: params.analyzer
    }
  });
};

const setDefaultMultipleAnalyzer = (analyzer) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_SET_DEFAULT_MULTIPLE_ANALYZER,
    options: {
      analyzer: analyzer
    }
  });
};

const setSingleAnalyzer = (analyzer) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_SET_SINGLE_ANALYZER,
    options: {
      analyzer: analyzer
    }
  });
};

const saveSearchIndex = (doc, info, navigateToUrl) => {
  doc.setIndex(info.indexName, info.indexFunction, info.analyzerInfo);

  if (info.lastSavedDesignDocName === doc.id && info.lastSavedSearchIndexName !== info.indexName) {
    var indexes = doc.get('indexes') || {};
    delete indexes[info.lastSavedSearchIndexName];
    doc.set({ indexes: indexes });
  }

  doc.save().then(() => {
    info.designDocs.add(doc, { merge: true });

    FauxtonAPI.addNotification({
      msg: 'The search index has been saved.',
      type: 'success',
      clear: true
    });

    // if the user just saved the view to a different design doc, remove the view from the old design doc and
    // maybe even delete if it's empty
    if (!info.isCreatingIndex && info.lastSavedDesignDocName !== doc.id) {
      const oldDesignDoc = IndexEditorActions.helpers.findDesignDoc(info.designDocs, info.lastSavedDesignDocName);
      IndexEditorActions.safeDeleteIndex(oldDesignDoc, info.designDocs, 'indexes', info.lastSavedSearchIndexName, {
        onSuccess: () => {
          SidebarActions.dispatchUpdateDesignDocs(info.designDocs);
        }
      });
    }

    SidebarActions.dispatchUpdateDesignDocs(info.designDocs);
    FauxtonAPI.navigate(navigateToUrl, { trigger: true });
  }, (xhr) => {
    const responseText = JSON.parse(xhr.responseText).reason;
    FauxtonAPI.addNotification({
      msg: 'Save failed: ' + responseText,
      type: 'error',
      clear: true
    });
  });
};


const deleteSearchIndex = (options) => {
  const onSuccess = () => {

    // if the user was on the index that was just deleted, redirect them back to all docs
    if (options.isOnIndex) {
      const url = FauxtonAPI.urls('allDocs', 'app', options.database.safeID());
      FauxtonAPI.navigate(url);
    }
    SidebarActions.dispatchUpdateDesignDocs(options.designDocs);

    FauxtonAPI.addNotification({
      msg: 'The <code>' + _.escape(options.indexName) + '</code> search index has been deleted.',
      type: 'info',
      escape: false,
      clear: true
    });
    SidebarActions.dispatchHideDeleteIndexModal();
  };

  IndexEditorActions.safeDeleteIndex(options.designDoc, options.designDocs, 'indexes', options.indexName, { onSuccess });
};

const cloneSearchIndex = (params) => {
  const targetDesignDoc = getDesignDoc(params.designDocs, params.targetDesignDocName, params.newDesignDocName, params.database);
  let indexes = targetDesignDoc.get('indexes');
  if (indexes && _.has(indexes, params.newIndexName)) {
    FauxtonAPI.addNotification({
      msg: 'That index name is already used in this design doc. Please enter a new name.',
      type: 'error',
      clear: true
    });
    return;
  }
  if (!indexes) {
    indexes = {};
  }
  const sourceDesignDoc = IndexEditorActions.helpers.findDesignDoc(params.designDocs, '_design/' + params.sourceDesignDocName);
  const sourceDesignDocJSON = sourceDesignDoc.toJSON();

  // this sets whatever content is in the source index into the target design doc under the new index name
  indexes[params.newIndexName] = sourceDesignDocJSON.indexes[params.sourceIndexName];
  targetDesignDoc.set({ indexes: indexes });

  targetDesignDoc.save().then(function () {
    params.onComplete();
    FauxtonAPI.addNotification({
      msg: 'The search index has been cloned.',
      type: 'success',
      clear: true
    });

    SidebarActions.dispatchUpdateDesignDocs(params.designDocs);
  },
  function (xhr) {
    params.onComplete();
    var responseText = JSON.parse(xhr.responseText).reason;
    FauxtonAPI.addNotification({
      msg: 'Clone failed: ' + responseText,
      type: 'error',
      clear: true
    });
  });
};

const gotoEditSearchIndexPage = (databaseName, partitionKey, designDocName, indexName) => {
  const encodedPartKey = partitionKey ? encodeURIComponent(partitionKey) : '';
  FauxtonAPI.navigate('#' + FauxtonAPI.urls('search', 'edit', encodeURIComponent(databaseName),
    encodedPartKey, encodeURIComponent(designDocName), encodeURIComponent(indexName)));
};

const selectDesignDoc = (designDoc) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_SELECT_DESIGN_DOC,
    options: {
      value: designDoc
    }
  });
};

// const querySearch = (searchQuery, partitionKey) => {
const querySearch = (databaseName, partitionKey, ddocName, indexName, searchQuery) => {
  const encodedDatabaseName = encodeURIComponent(databaseName);
  const encodedPartitionKey = encodeURIComponent(partitionKey);
  const encodedDdocName = encodeURIComponent(ddocName);
  const encodedIndexName = encodeURIComponent(indexName);
  const encodedSearchQuery = encodeURIComponent(searchQuery);

  const baseUrl = partitionKey ?
    FauxtonAPI.urls('partitioned_search', 'app', encodedDatabaseName, encodedPartitionKey, encodedDdocName, encodedIndexName) :
    FauxtonAPI.urls('search', 'app', encodedDatabaseName, encodedDdocName, encodedIndexName);
  FauxtonAPI.navigate(`${baseUrl}${encodedIndexName}?${encodedSearchQuery}`, {trigger: true});
};

const executSearchQuery = (database, partitionKey, ddoc, index, searchQuery, dispatch) => {
  dispatch({ type: ActionTypes.SEARCH_INDEX_PREVIEW_REQUEST_MADE });

  return API.fetchSearchResults(database, partitionKey, ddoc, index, searchQuery)
    .then(rows => {
      dispatch({
        type: ActionTypes.SEARCH_INDEX_PREVIEW_MODEL_UPDATED,
        options: {
          searchResults: rows
        }
      });
    }).catch(err => {
      dispatch({ type: ActionTypes.SEARCH_INDEX_PREVIEW_REQUEST_ERROR });

      if (err && err.message.includes('`partition` not supported')) {
        dispatch(partitionParamNotSupported());
      } else if (err && err.message.includes('`partition` parameter is mandatory')) {
        dispatch(partitionParamIsMandatory());
      } else {
        FauxtonAPI.addNotification({
          msg: 'Search failed: ' + err.message,
          type: 'error',
          clear: true
        });
      }

      if (err.message.includes('not found')) {
        FauxtonAPI.navigate(FauxtonAPI.urls('allDocsSanitized', 'app', database), {trigger: true});
      }
    });
};

const setSearchQuery = (query) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_SET_SEARCH_QUERY,
    options: {
      query: query
    }
  });
};

const updateNewDesignDocName = (designDocName) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_NEW_DESIGN_DOC_NAME_UPDATED,
    options: {
      value: designDocName
    }
  });
};

const updateNewDesignDocPartitioned = (isPartitioned) => (dispatch) => {
  dispatch({
    type: ActionTypes.SEARCH_INDEX_NEW_DESIGN_DOC_PARTITONED_UPDATED,
    options: {
      value: isPartitioned
    }
  });
};

const partitionParamNotSupported = () => ({
  type: ActionTypes.SEARCH_INDEX_PARTITION_PARAM_NOT_SUPPORTED
});

const partitionParamIsMandatory = () => ({
  type: ActionTypes.SEARCH_INDEX_PARTITION_PARAM_MANDATORY
});


// helpers

function getDesignDoc (designDocs, targetDesignDocName, newDesignDocName, database) {
  if (targetDesignDocName === 'new-doc') {
    var doc = {
      "_id": "_design/" + newDesignDocName,
      "indexes": {},
      "language": "javascript"
    };
    return new Search.Doc(doc, { database: database });
  }

  var foundDoc = designDocs.find(function (ddoc) {
    return ddoc.id === targetDesignDocName;
  });
  return (!foundDoc) ? null : foundDoc.dDocModel();
}


export default {
  dispatchInitNewSearchIndex,
  dispatchInitSearchIndex,
  dispatchEditSearchIndex,
  selectTab,
  setSearchIndexName,
  setAnalyzerType,
  addAnalyzerRow,
  removeAnalyzerRow,
  setAnalyzerRowFieldName,
  setAnalyzer,
  setDefaultMultipleAnalyzer,
  selectDesignDoc,
  saveSearchIndex,
  cloneSearchIndex,
  deleteSearchIndex,
  gotoEditSearchIndexPage,
  querySearch,
  setSearchQuery,
  setSingleAnalyzer,
  updateNewDesignDocName,
  updateNewDesignDocPartitioned,
  partitionParamNotSupported,
  partitionParamIsMandatory
};
