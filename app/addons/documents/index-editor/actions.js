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

import FauxtonAPI from '../../../core/api';
import Documents from '../resources';
import ActionTypes from './actiontypes';
import SidebarActions from '../sidebar/actions';

const selectReduceChanged = (reduceOption) => (dispatch) => {
  dispatch({
    type: ActionTypes.SELECT_REDUCE_CHANGE,
    reduceSelectedOption: reduceOption
  });
};

const changeViewName = (name) => (dispatch) => {
  dispatch({
    type: ActionTypes.VIEW_NAME_CHANGE,
    name: name
  });
};

const editIndex = (options) => (dispatch) => {
  dispatch({
    type: ActionTypes.EDIT_INDEX,
    options: options
  });
};

const dispatchClearIndex = () => {
  FauxtonAPI.reduxDispatch({ type: ActionTypes.CLEAR_INDEX });
};

const dispatchFetchDesignDocsBeforeEdit = (options) => {
  options.designDocs.fetch({reset: true}).then(() => {
    editIndex(options)(FauxtonAPI.reduxDispatch);
  }, xhr => {
    let errorMsg = 'Error';
    if (xhr.responseJSON && xhr.responseJSON.error === 'not_found') {
      const databaseName = options.designDocs.database.safeID();
      errorMsg = `The ${databaseName} database does not exist`;
      FauxtonAPI.navigate('/', {trigger: true});
    }
    FauxtonAPI.addNotification({
      msg: errorMsg,
      type: "error",
      clear:  true
    });
  });
};

const shouldRemoveDdocView = (viewInfo) => {
  return !viewInfo.isNewView &&
          viewInfo.originalDesignDocName === viewInfo.designDocId &&
          viewInfo.originalViewName !== viewInfo.viewName;
};

const saveView = (viewInfo, navigateToURL) => (dispatch) => {
  const designDoc = viewInfo.designDoc;
  designDoc.setDdocView(viewInfo.viewName, viewInfo.map, viewInfo.reduce);

  FauxtonAPI.addNotification({
    msg: 'Saving View...',
    type: 'info',
    clear: true
  });

  // if the view name just changed and it's in the SAME design doc, remove the old one before saving the doc
  if (shouldRemoveDdocView(viewInfo)) {
    designDoc.removeDdocView(viewInfo.originalViewName);
  }

  designDoc.save().then(function () {
    FauxtonAPI.addNotification({
      msg: 'View Saved.',
      type: 'success',
      clear: true
    });

    // if the user just saved an existing view to a different design doc, remove the view
    // from the old design doc and delete if it's empty
    if (!viewInfo.isNewView && viewInfo.originalDesignDocName !== viewInfo.designDocId) {
      const oldDesignDoc = findDesignDoc(viewInfo.designDocs, viewInfo.originalDesignDocName);
      safeDeleteIndex(oldDesignDoc, viewInfo.designDocs, 'views', viewInfo.originalViewName, {
        onSuccess: function () {
          SidebarActions.dispatchUpdateDesignDocs(viewInfo.designDocs);
        }
      });
    }

    if (viewInfo.designDocId === 'new-doc') {
      addDesignDoc(designDoc);
    }
    SidebarActions.dispatchUpdateDesignDocs(viewInfo.designDocs);
    dispatch({ type: ActionTypes.VIEW_SAVED });
    FauxtonAPI.navigate(navigateToURL, { trigger: true });
  }, (xhr) => {
    FauxtonAPI.addNotification({
      msg: 'Save failed. ' + (xhr.responseJSON ? `Reason: ${xhr.responseJSON.reason}` : ''),
      type: 'error',
      clear: true
    });
  });
};

const addDesignDoc = (designDoc) => (dispatch) => {
  dispatch({
    type: ActionTypes.VIEW_ADD_DESIGN_DOC,
    designDoc: designDoc.toJSON()
  });
};

const deleteView = (options) => {

  function onSuccess () {

    // if the user was on the index that was just deleted, redirect them back to all docs
    if (options.isOnIndex) {
      const url = FauxtonAPI.urls('allDocs', 'app', options.database.safeID());
      FauxtonAPI.navigate(url);
    }

    SidebarActions.dispatchUpdateDesignDocs(options.designDocs);

    FauxtonAPI.addNotification({
      msg: 'The <code>' + _.escape(options.indexName) + '</code> view has been deleted.',
      type: 'info',
      escape: false,
      clear: true
    });
    SidebarActions.dispatchHideDeleteIndexModal();
  }

  return safeDeleteIndex(options.designDoc, options.designDocs, 'views', options.indexName, { onSuccess: onSuccess });
};

const cloneView = (params) => {
  const targetDesignDoc = getDesignDoc(params.designDocs, params.targetDesignDocName, params.newDesignDocName,
    params.newDesignDocPartitioned, params.database, params.isDbPartitioned);
  let indexes = targetDesignDoc.get('views');
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
  const sourceDesignDoc = findDesignDoc(params.designDocs, '_design/' + params.sourceDesignDocName);
  const sourceDesignDocJSON = sourceDesignDoc.toJSON();

  // this sets whatever content is in the source index into the target design doc under the new index name
  indexes[params.newIndexName] = sourceDesignDocJSON.views[params.sourceIndexName];
  targetDesignDoc.set({ views: indexes });

  targetDesignDoc.save().then(() => {
    params.onComplete();
    FauxtonAPI.addNotification({
      msg: 'The index has been cloned.',
      type: 'success',
      clear: true
    });
    SidebarActions.dispatchUpdateDesignDocs(params.designDocs);
  }, (xhr) => {
    params.onComplete();
    const responseText = JSON.parse(xhr.responseText).reason;
    FauxtonAPI.addNotification({
      msg: 'Clone failed: ' + responseText,
      type: 'error',
      clear: true
    });
  });
};

const gotoEditViewPage = (databaseName, partitionKey, designDocName, indexName) => {
  FauxtonAPI.navigate('#' + FauxtonAPI.urls('view', 'edit', encodeURIComponent(databaseName),
    (partitionKey ? encodeURIComponent(partitionKey) : ''),
    encodeURIComponent(designDocName), encodeURIComponent(indexName)));
};

const updateMapCode = (code) => (dispatch) => {
  dispatch({
    type: ActionTypes.VIEW_UPDATE_MAP_CODE,
    code: code
  });
};

const updateReduceCode = (code) => (dispatch) => {
  dispatch({
    type: ActionTypes.VIEW_UPDATE_REDUCE_CODE,
    code: code
  });
};

const selectDesignDoc = (designDoc) => (dispatch) => {
  dispatch({
    type: ActionTypes.DESIGN_DOC_CHANGE,
    options: {
      value: designDoc
    }
  });
};

const updateNewDesignDocName = (designDocName) => (dispatch) => {
  dispatch({
    type: ActionTypes.DESIGN_DOC_NEW_NAME_UPDATED,
    options: {
      value: designDocName
    }
  });
};

const updateNewDesignDocPartitioned = (isPartitioned) => (dispatch) => {
  dispatch({
    type: ActionTypes.DESIGN_DOC_NEW_PARTITIONED_UPDATED,
    options: {
      value: isPartitioned
    }
  });
};

// safely deletes an index of any type. It only deletes the actual design doc if there are no
// other indexes of any type left in the doc
const safeDeleteIndex = (designDoc, designDocs, indexPropName, indexName, options) => {
  const opts = _.extend({
    onSuccess: function () { },
    onError: function (xhr) {
      const responseText = JSON.parse(xhr.responseText).reason;
      FauxtonAPI.addNotification({
        msg: 'Delete failed: ' + responseText,
        type: 'error',
        clear: true
      });
    }
  }, options);

  const indexes = designDoc.get(indexPropName) || {};
  delete indexes[indexName];
  const newIndexes = {};
  newIndexes[indexPropName] = indexes;
  designDoc.set(newIndexes);

  // we either save the design doc with the now-removed index, or we remove it altogether if there are no indexes
  // of any type left in the design doc
  const indexTypePropNames = FauxtonAPI.getIndexTypePropNames();
  const hasRemainingIndex = _.some(indexTypePropNames, function (propName) {
    return designDoc.get(propName) && _.keys(designDoc.get(propName)).length > 0;
  });

  let promise;
  let deleteDesignDoc = false;
  if (hasRemainingIndex) {
    promise = designDoc.save();
  } else {
    promise = designDoc.destroy();
    deleteDesignDoc = true;
  }
  return promise.then(function () {
    if (deleteDesignDoc) {
      designDocs.remove(designDoc.id);
    }
    opts.onSuccess();
  }, opts.onError);
};



// ---- helpers ----

const findDesignDoc = (designDocs, designDocName) => {
  return designDocs.find(function (doc) {
    return doc.id === designDocName;
  }).dDocModel();
};

const getDesignDoc = (designDocs, targetDesignDocName, newDesignDocName, newDesignDocPartitioned, database, isDbPartitioned) => {
  if (targetDesignDocName === 'new-doc') {
    const doc = {
      "_id": "_design/" + newDesignDocName,
      "views": {},
      "language": "javascript"
    };
    const dDoc = new Documents.Doc(doc, { database: database });
    if (isDbPartitioned) {
      dDoc.setDDocPartitionedOption(newDesignDocPartitioned);
    }
    return dDoc;
  }

  const foundDoc = designDocs.find(function (ddoc) {
    return ddoc.id === targetDesignDocName;
  });
  return (!foundDoc) ? null : foundDoc.dDocModel();
};


export default {
  helpers: {
    findDesignDoc,
    getDesignDoc
  },
  safeDeleteIndex,
  selectReduceChanged,
  changeViewName,
  editIndex,
  dispatchClearIndex,
  dispatchFetchDesignDocsBeforeEdit,
  shouldRemoveDdocView,
  saveView,
  addDesignDoc,
  deleteView,
  cloneView,
  gotoEditViewPage,
  updateMapCode,
  updateReduceCode,
  selectDesignDoc,
  updateNewDesignDocName,
  updateNewDesignDocPartitioned
};
