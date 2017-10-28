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

import FauxtonAPI from "../../../core/api";
import ActionTypes from "./actiontypes";
import Stores from "./stores";
var store = Stores.sidebarStore;

function newOptions (options) {
  if (options.database.safeID() !== store.getDatabaseName()) {
    FauxtonAPI.dispatch({
      type: ActionTypes.SIDEBAR_FETCHING
    });
  }

  options.designDocs.fetch().then(() => {
    FauxtonAPI.dispatch({
      type: ActionTypes.SIDEBAR_NEW_OPTIONS,
      options: options
    });
  }, xhr => {
    let errorMsg = 'Unable to update the sidebar.';
    if (xhr.responseJSON && xhr.responseJSON.error === 'not_found') {
      const databaseName = options.designDocs.database.safeID();
      errorMsg = `The ${databaseName} database does not exist.`;
      FauxtonAPI.navigate('/', {trigger: true});
    }
    FauxtonAPI.addNotification({
      msg: errorMsg,
      type: "error",
      clear:  true
    });
  });
}

function updateDesignDocs (designDocs) {
  FauxtonAPI.dispatch({
    type: ActionTypes.SIDEBAR_FETCHING
  });

  designDocs.fetch().then(function () {
    FauxtonAPI.dispatch({
      type: ActionTypes.SIDEBAR_UPDATED_DESIGN_DOCS,
      options: {
        designDocs: designDocs
      }
    });
  });
}

function toggleContent (designDoc, indexGroup) {
  FauxtonAPI.dispatch({
    type: ActionTypes.SIDEBAR_TOGGLE_CONTENT,
    designDoc: designDoc,
    indexGroup: indexGroup
  });
}

// This selects any item in the sidebar, including nested nav items to ensure the appropriate item is visible
// and highlighted. Params:
// - `navItem`: 'permissions', 'changes', 'all-docs', 'compact', 'mango-query', 'designDoc' (or anything thats been
//    extended)
// - `params`: optional object if you passed designDoc as the first param. This lets you specify which sub-page
//    should be selected, e.g.
//       Actions.selectNavItem('designDoc', { designDocName: 'my-design-doc', section: 'metadata' });
//       Actions.selectNavItem('designDoc', { designDocName: 'my-design-doc', section: 'Views', indexName: 'my-view' });
function selectNavItem (navItem, params) {
  var settings = $.extend(true, {}, {
    designDocName: '',
    designDocSection: '',
    indexName: ''
  }, params);
  settings.navItem = navItem;

  FauxtonAPI.dispatch({
    type: ActionTypes.SIDEBAR_SET_SELECTED_NAV_ITEM,
    options: settings
  });
}

function showDeleteIndexModal (indexName, designDocName, indexLabel, onDelete) {
  FauxtonAPI.dispatch({
    type: ActionTypes.SIDEBAR_SHOW_DELETE_INDEX_MODAL,
    options: {
      indexName: indexName,
      indexLabel: indexLabel,
      designDocName: designDocName,
      onDelete: onDelete
    }
  });
}

function hideDeleteIndexModal () {
  FauxtonAPI.dispatch({ type: ActionTypes.SIDEBAR_HIDE_DELETE_INDEX_MODAL });
}

function showCloneIndexModal (indexName, designDocName, indexLabel, onSubmit) {
  FauxtonAPI.dispatch({
    type: ActionTypes.SIDEBAR_SHOW_CLONE_INDEX_MODAL,
    options: {
      sourceIndexName: indexName,
      sourceDesignDocName: designDocName,
      onSubmit: onSubmit,
      indexLabel: indexLabel,
      cloneIndexModalTitle: 'Clone ' + indexLabel
    }
  });
}

function hideCloneIndexModal () {
  FauxtonAPI.dispatch({ type: ActionTypes.SIDEBAR_HIDE_CLONE_INDEX_MODAL });
}

function updateNewDesignDocName (designDocName) {
  FauxtonAPI.dispatch({
    type: ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_NEW_NAME_UPDATED,
    options: {
      value: designDocName
    }
  });
}

function selectDesignDoc (designDoc) {
  FauxtonAPI.dispatch({
    type: ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_CHANGE,
    options: {
      value: designDoc
    }
  });
}

function setNewCloneIndexName (indexName) {
  FauxtonAPI.dispatch({
    type: ActionTypes.SIDEBAR_CLONE_MODAL_UPDATE_INDEX_NAME,
    options: {
      value: indexName
    }
  });
}


export default {
  newOptions: newOptions,
  updateDesignDocs: updateDesignDocs,
  toggleContent: toggleContent,
  selectNavItem: selectNavItem,
  showDeleteIndexModal: showDeleteIndexModal,
  hideDeleteIndexModal: hideDeleteIndexModal,
  showCloneIndexModal: showCloneIndexModal,
  hideCloneIndexModal: hideCloneIndexModal,
  updateNewDesignDocName: updateNewDesignDocName,
  selectDesignDoc: selectDesignDoc,
  setNewCloneIndexName: setNewCloneIndexName
};
