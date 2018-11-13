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

const _getDatabaseName = ({sidebar}) => {
  if (!sidebar || sidebar.loading) {
    return '';
  }
  return sidebar.database.safeID();
};

const dispatchNewOptions = (options) => {
  if (options.database.safeID() !== _getDatabaseName(FauxtonAPI.reduxState())) {
    FauxtonAPI.reduxDispatch({
      type: ActionTypes.SIDEBAR_FETCHING
    });
  }

  options.designDocs.fetch().then(() => {
    FauxtonAPI.reduxDispatch({
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
};

const dispatchUpdateDesignDocs = (designDocs) => {
  FauxtonAPI.reduxDispatch({
    type: ActionTypes.SIDEBAR_FETCHING
  });

  designDocs.fetch().then(function () {
    FauxtonAPI.reduxDispatch({
      type: ActionTypes.SIDEBAR_UPDATED_DESIGN_DOCS,
      options: {
        designDocs: designDocs
      }
    });
  });
};

const dispatchHideDeleteIndexModal = () => {
  FauxtonAPI.reduxDispatch({
    type: ActionTypes.SIDEBAR_HIDE_DELETE_INDEX_MODAL
  });
};

const dispatchExpandSelectedItem = (selectedNavItem) => {
  FauxtonAPI.reduxDispatch({
    type: ActionTypes.SIDEBAR_EXPAND_SELECTED_ITEM,
    options: {
      selectedNavItem: selectedNavItem
    }
  });
};

const toggleContent = (designDoc, indexGroup) => (dispatch) => {
  dispatch({
    type: ActionTypes.SIDEBAR_TOGGLE_CONTENT,
    designDoc: designDoc,
    indexGroup: indexGroup
  });
};

const showDeleteIndexModal = (indexName, designDocName, indexLabel, onDelete) => (dispatch) => {
  dispatch({
    type: ActionTypes.SIDEBAR_SHOW_DELETE_INDEX_MODAL,
    options: {
      indexName: indexName,
      indexLabel: indexLabel,
      designDocName: designDocName,
      onDelete: onDelete
    }
  });
};

const hideDeleteIndexModal = () => (dispatch) => {
  dispatch({
    type: ActionTypes.SIDEBAR_HIDE_DELETE_INDEX_MODAL
  });
};

const showCloneIndexModal = (indexName, designDocName, indexLabel, onSubmit) => (dispatch) => {
  dispatch({
    type: ActionTypes.SIDEBAR_SHOW_CLONE_INDEX_MODAL,
    options: {
      sourceIndexName: indexName,
      sourceDesignDocName: designDocName,
      onSubmit: onSubmit,
      indexLabel: indexLabel,
      cloneIndexModalTitle: 'Clone ' + indexLabel
    }
  });
};

const hideCloneIndexModal = () => (dispatch) => {
  dispatch({
    type: ActionTypes.SIDEBAR_HIDE_CLONE_INDEX_MODAL
  });
};

const updateNewDesignDocName = (designDocName) => (dispatch) => {
  dispatch({
    type: ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_NEW_NAME_UPDATED,
    options: {
      value: designDocName
    }
  });
};

const updateNewDesignDocPartitioned = (isPartitioned) => (dispatch) => {
  dispatch({
    type: ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_NEW_PARTITIONED_UPDATED,
    options: {
      value: isPartitioned
    }
  });
};

const selectDesignDoc = (designDoc) => (dispatch) => {
  dispatch({
    type: ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_CHANGE,
    options: {
      value: designDoc
    }
  });
};

const setNewCloneIndexName = (indexName) => (dispatch) => {
  dispatch({
    type: ActionTypes.SIDEBAR_CLONE_MODAL_UPDATE_INDEX_NAME,
    options: {
      value: indexName
    }
  });
};

export default {
  dispatchNewOptions,
  dispatchUpdateDesignDocs,
  toggleContent,
  showDeleteIndexModal,
  hideDeleteIndexModal,
  dispatchHideDeleteIndexModal,
  showCloneIndexModal,
  hideCloneIndexModal,
  updateNewDesignDocName,
  updateNewDesignDocPartitioned,
  selectDesignDoc,
  setNewCloneIndexName,
  dispatchExpandSelectedItem
};
