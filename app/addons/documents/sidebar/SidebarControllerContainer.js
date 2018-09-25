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

import { connect } from 'react-redux';
import app from "../../../app";
import SidebarComponents from './sidebar';
import Action from './actions';
import ActionTypes from './actiontypes';

const reduxUpdatedDesignDocList = (designDocs) => {
  return {
    type: ActionTypes.SIDEBAR_UPDATED_DESIGN_DOCS,
    options: {
      designDocs: Array.isArray(designDocs) ? designDocs : []
    }
  };
};

const getDatabase = (state) => {
  if (state.loading) {
    return {};
  }
  return state.database;
};

const getDesignDocList = (state) => {
  if (state.loading) {
    return {};
  }
  let docs = state.designDocs.toJSON();
  docs = _.filter(docs, (doc) => {
    if (_.has(doc.doc, 'language')) {
      return doc.doc.language !== 'query';
    }
    return true;
  });

  return docs.map((doc) => {
    doc.safeId = app.utils.safeURLName(doc._id.replace(/^_design\//, ''));
    return _.extend(doc, doc.doc);
  });
};

// returns a simple array of design doc IDs
const getAvailableDesignDocs = (state) => {
  const availableDocs = state.designDocs.filter((doc) => {
    return !doc.isMangoDoc();
  });
  return _.map(availableDocs, (doc) => {
    return doc.id;
  });
};

const getDeleteIndexDesignDoc = (state) => {
  const designDoc = state.designDocs.find((ddoc) => {
    return '_design/' + state.deleteIndexModalDesignDocName === ddoc.id;
  });

  return designDoc ? designDoc.dDocModel() : null;
};


const selectedNavItem = (selectedItem) => {

  // resets previous selection and sets new values
  const settings = {
    designDocName: '',
    designDocSection: '',
    indexName: '',
    navItem: '',
    ...selectedItem
  };
  return settings;
};

const mapStateToProps = ({ sidebar }, ownProps) => {
  return {
    database: getDatabase(sidebar),
    selectedNav: selectedNavItem(ownProps.selectedNavItem),
    designDocs: sidebar.designDocs,
    designDocList: getDesignDocList(sidebar),
    availableDesignDocIds: getAvailableDesignDocs(sidebar),
    toggledSections: sidebar.toggledSections,
    isLoading: sidebar.loading,

    deleteIndexModalVisible: sidebar.deleteIndexModalVisible,
    deleteIndexModalText: sidebar.deleteIndexModalText,
    deleteIndexModalOnSubmit: sidebar.deleteIndexModalOnSubmit,
    deleteIndexModalIndexName: sidebar.deleteIndexModalIndexName,
    deleteIndexModalDesignDoc: getDeleteIndexDesignDoc(sidebar),

    cloneIndexModalVisible: sidebar.cloneIndexModalVisible,
    cloneIndexModalTitle: sidebar.cloneIndexModalTitle,
    cloneIndexModalSelectedDesignDoc: sidebar.cloneIndexModalSelectedDesignDoc,
    cloneIndexModalNewDesignDocName: sidebar.cloneIndexModalNewDesignDocName,
    cloneIndexModalOnSubmit: sidebar.cloneIndexModalOnSubmit,
    cloneIndexDesignDocProp: sidebar.cloneIndexDesignDocProp,
    cloneIndexModalNewIndexName: sidebar.cloneIndexModalNewIndexName,
    cloneIndexSourceIndexName: sidebar.cloneIndexModalSourceIndexName,
    cloneIndexSourceDesignDocName: sidebar.cloneIndexModalSourceDesignDocName,
    cloneIndexModalIndexLabel: sidebar.cloneIndexModalIndexLabel
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    reduxUpdatedDesignDocList: (designDocsList) => {
      dispatch(reduxUpdatedDesignDocList(designDocsList));
    },
    toggleContent: (designDoc, indexGroup) => {
      dispatch(Action.toggleContent(designDoc, indexGroup));
    },
    hideCloneIndexModal: () => {
      dispatch(Action.hideCloneIndexModal());
    },
    hideDeleteIndexModal: () => {
      dispatch(Action.hideDeleteIndexModal());
    },
    showDeleteIndexModal: (indexName, designDocName, indexLabel, onDelete) => {
      dispatch(Action.showDeleteIndexModal(indexName, designDocName, indexLabel, onDelete));
    },
    showCloneIndexModal: (indexName, designDocName, indexLabel, onSubmit) => {
      dispatch(Action.showCloneIndexModal(indexName, designDocName, indexLabel, onSubmit));
    },
    selectDesignDoc: (designDoc) => {
      dispatch(Action.selectDesignDoc(designDoc));
    },
    updateNewDesignDocName: (designDocName) => {
      dispatch(Action.updateNewDesignDocName(designDocName));
    },
    setNewCloneIndexName: (indexName) => {
      dispatch(Action.setNewCloneIndexName(indexName));
    }
  };
};

const SidebarControllerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SidebarComponents.SidebarController);

export default SidebarControllerContainer;

