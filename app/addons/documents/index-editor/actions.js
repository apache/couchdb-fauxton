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
import FauxtonAPI from "../../../core/api";
import Documents from "../resources";
import ActionTypes from "./actiontypes";
import SidebarActions from "../sidebar/actions";
import SidebarActionTypes from "../sidebar/actiontypes";

function selectReduceChanged (reduceOption) {
  FauxtonAPI.dispatch({
    type: ActionTypes.SELECT_REDUCE_CHANGE,
    reduceSelectedOption: reduceOption
  });
}

function changeViewName (name) {
  FauxtonAPI.dispatch({
    type: ActionTypes.VIEW_NAME_CHANGE,
    name: name
  });
}

function editIndex (options) {
  FauxtonAPI.dispatch({
    type: ActionTypes.EDIT_INDEX,
    options: options
  });
}

function clearIndex () {
  FauxtonAPI.dispatch({ type: ActionTypes.CLEAR_INDEX });
}

function fetchDesignDocsBeforeEdit (options) {
  options.designDocs.fetch({reset: true}).then(() => {
    this.editIndex(options);
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
}

function shouldRemoveDdocView(viewInfo) {
  return !viewInfo.newView &&
          viewInfo.originalDesignDocName === viewInfo.designDocId &&
          viewInfo.originalViewName !== viewInfo.viewName;
}

function saveView (viewInfo) {
  var designDoc = viewInfo.designDoc;
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
    if (!viewInfo.newView && viewInfo.originalDesignDocName !== viewInfo.designDocId) {
      var oldDesignDoc = findDesignDoc(viewInfo.designDocs, viewInfo.originalDesignDocName);
      safeDeleteIndex(oldDesignDoc, viewInfo.designDocs, 'views', viewInfo.originalViewName, {
        onSuccess: function () {
          SidebarActions.updateDesignDocs(viewInfo.designDocs);
        }
      });
    }

    if (viewInfo.designDocId === 'new-doc') {
      addDesignDoc(designDoc);
    }

    FauxtonAPI.dispatch({ type: ActionTypes.VIEW_SAVED });
    var fragment = FauxtonAPI.urls('view', 'showView', viewInfo.database.safeID(), designDoc.safeID(), app.utils.safeURLName(viewInfo.viewName));
    FauxtonAPI.navigate(fragment, { trigger: true });
  }, (xhr) => {
    FauxtonAPI.addNotification({
      msg: 'Save failed. ' + (xhr.responseJSON ? `Reason: ${xhr.responseJSON.reason}` : ''),
      type: 'error',
      clear: true
    });
  });
}

function addDesignDoc (designDoc) {
  FauxtonAPI.dispatch({
    type: ActionTypes.VIEW_ADD_DESIGN_DOC,
    designDoc: designDoc.toJSON()
  });
}

function deleteView (options) {

  function onSuccess () {

    // if the user was on the index that was just deleted, redirect them back to all docs
    if (options.isOnIndex) {
      var url = FauxtonAPI.urls('allDocs', 'app', options.database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
      FauxtonAPI.navigate(url);
    }

    SidebarActions.updateDesignDocs(options.designDocs);

    FauxtonAPI.addNotification({
      msg: 'The <code>' + _.escape(options.indexName) + '</code> view has been deleted.',
      type: 'info',
      escape: false,
      clear: true
    });
    FauxtonAPI.dispatch({ type: SidebarActionTypes.SIDEBAR_HIDE_DELETE_INDEX_MODAL });
  }

  return safeDeleteIndex(options.designDoc, options.designDocs, 'views', options.indexName, { onSuccess: onSuccess });
}

function cloneView (params) {
  var targetDesignDoc = getDesignDoc(params.designDocs, params.targetDesignDocName, params.newDesignDocName, params.database);
  var indexes = targetDesignDoc.get('views');
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
  var sourceDesignDoc = findDesignDoc(params.designDocs, '_design/' + params.sourceDesignDocName);
  var sourceDesignDocJSON = sourceDesignDoc.toJSON();

  // this sets whatever content is in the source index into the target design doc under the new index name
  indexes[params.newIndexName] = sourceDesignDocJSON.views[params.sourceIndexName];
  targetDesignDoc.set({ views: indexes });

  targetDesignDoc.save().then(function () {
    params.onComplete();
    FauxtonAPI.addNotification({
      msg: 'The index has been cloned.',
      type: 'success',
      clear: true
    });
    SidebarActions.updateDesignDocs(params.designDocs);
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
}

function gotoEditViewPage (databaseName, designDocName, indexName) {
  FauxtonAPI.navigate('#' + FauxtonAPI.urls('view', 'edit', encodeURIComponent(databaseName),
    encodeURIComponent(designDocName), encodeURIComponent(indexName)));
}

function updateMapCode (code) {
  FauxtonAPI.dispatch({
    type: ActionTypes.VIEW_UPDATE_MAP_CODE,
    code: code
  });
}

function updateReduceCode (code) {
  FauxtonAPI.dispatch({
    type: ActionTypes.VIEW_UPDATE_REDUCE_CODE,
    code: code
  });
}

function selectDesignDoc (designDoc) {
  FauxtonAPI.dispatch({
    type: ActionTypes.DESIGN_DOC_CHANGE,
    options: {
      value: designDoc
    }
  });
}

function updateNewDesignDocName (designDocName) {
  FauxtonAPI.dispatch({
    type: ActionTypes.DESIGN_DOC_NEW_NAME_UPDATED,
    options: {
      value: designDocName
    }
  });
}

// safely deletes an index of any type. It only deletes the actual design doc if there are no
// other indexes of any type left in the doc
function safeDeleteIndex (designDoc, designDocs, indexPropName, indexName, options) {
  var opts = _.extend({
    onSuccess: function () { },
    onError: function (xhr) {
      var responseText = JSON.parse(xhr.responseText).reason;
      FauxtonAPI.addNotification({
        msg: 'Delete failed: ' + responseText,
        type: 'error',
        clear: true
      });
    }
  }, options);

  var indexes = designDoc.get(indexPropName) || {};
  delete indexes[indexName];
  var newIndexes = {};
  newIndexes[indexPropName] = indexes;
  designDoc.set(newIndexes);

  // we either save the design doc with the now-removed index, or we remove it altogether if there are no indexes
  // of any type left in the design doc
  var indexTypePropNames = FauxtonAPI.getIndexTypePropNames();
  var hasRemainingIndex = _.some(indexTypePropNames, function (propName) {
    return designDoc.get(propName) && _.keys(designDoc.get(propName)).length > 0;
  });

  var promise;
  var deleteDesignDoc = false;
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
}



// ---- helpers ----

function findDesignDoc (designDocs, designDocName) {
  return designDocs.find(function (doc) {
    return doc.id === designDocName;
  }).dDocModel();
}

function getDesignDoc (designDocs, targetDesignDocName, newDesignDocName, database) {
  if (targetDesignDocName === 'new-doc') {
    var doc = {
      "_id": "_design/" + newDesignDocName,
      "views": {},
      "language": "javascript"
    };
    return new Documents.Doc(doc, { database: database });
  }

  var foundDoc = designDocs.find(function (ddoc) {
    return ddoc.id === targetDesignDocName;
  });
  return (!foundDoc) ? null : foundDoc.dDocModel();
}


export default {
  helpers: {
    findDesignDoc: findDesignDoc,
    getDesignDoc: getDesignDoc
  },
  safeDeleteIndex: safeDeleteIndex,
  selectReduceChanged: selectReduceChanged,
  changeViewName: changeViewName,
  editIndex: editIndex,
  clearIndex: clearIndex,
  fetchDesignDocsBeforeEdit: fetchDesignDocsBeforeEdit,
  shouldRemoveDdocView: shouldRemoveDdocView,
  saveView: saveView,
  addDesignDoc: addDesignDoc,
  deleteView: deleteView,
  cloneView: cloneView,
  gotoEditViewPage: gotoEditViewPage,
  updateMapCode: updateMapCode,
  updateReduceCode: updateReduceCode,
  selectDesignDoc: selectDesignDoc,
  updateNewDesignDocName: updateNewDesignDocName
};
