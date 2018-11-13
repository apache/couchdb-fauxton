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
import SidebarComponents from './sidebar';
import Action from './actions';
import { getDatabase, getDesignDocPartitioned } from './reducers';


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

const mapStateToProps = ({ sidebar, databases }, ownProps) => {
  return {
    database: getDatabase(sidebar),
    selectedNav: selectedNavItem(ownProps.selectedNavItem),
    designDocs: sidebar.designDocs,
    designDocList: sidebar.designDocList,
    availableDesignDocIds: getAvailableDesignDocs(sidebar),
    toggledSections: sidebar.toggledSections,
    isLoading: sidebar.loading || databases.isLoadingDbInfo,
    selectedPartitionKey: ownProps.selectedPartitionKey,
    isDbPartitioned: databases.isDbPartitioned,

    deleteIndexModalVisible: sidebar.deleteIndexModalVisible,
    deleteIndexModalText: sidebar.deleteIndexModalText,
    deleteIndexModalOnSubmit: sidebar.deleteIndexModalOnSubmit,
    deleteIndexModalIndexName: sidebar.deleteIndexModalIndexName,
    deleteIndexModalDesignDoc: getDeleteIndexDesignDoc(sidebar),

    cloneIndexModalVisible: sidebar.cloneIndexModalVisible,
    cloneIndexModalTitle: sidebar.cloneIndexModalTitle,
    cloneIndexModalSelectedDesignDoc: sidebar.cloneIndexModalSelectedDesignDoc,
    cloneIndexModalSelectedDesignDocPartitioned: getDesignDocPartitioned(sidebar, databases.isDbPartitioned),
    cloneIndexModalNewDesignDocName: sidebar.cloneIndexModalNewDesignDocName,
    cloneIndexModalNewDesignDocPartitioned: sidebar.cloneIndexModalNewDesignDocPartitioned,
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
    updateNewDesignDocPartitioned: (isPartitioned) => {
      dispatch(Action.updateNewDesignDocPartitioned(isPartitioned));
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

