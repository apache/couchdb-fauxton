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

import React from 'react';
import ReactDOM from 'react-dom';
import ComponentsActions from "../../../components/actions";
import Components from '../../../components/react-components';
import ComponentsStore from '../../../components/stores';
import GeneralComponents from '../../../fauxton/components';
import Actions from '../actions';
import Stores from '../stores';
import CloneIndexModal from './CloneIndexModal';
import DesignDocList from './DesignDocList';
import MainSidebar from './MainSidebar';

const store = Stores.sidebarStore;
const { DeleteDatabaseModal, LoadLines } = Components;
const { ConfirmationModal } = GeneralComponents;
const { deleteDbModalStore } = ComponentsStore;

export default class SidebarController extends React.Component {
  getStoreState = () => {
    return {
      database: store.getDatabase(),
      selectedNav: store.getSelected(),
      designDocs: store.getDesignDocs(),
      designDocList: store.getDesignDocList(),
      availableDesignDocIds: store.getAvailableDesignDocs(),
      toggledSections: store.getToggledSections(),
      isLoading: store.isLoading(),
      deleteDbModalProperties: deleteDbModalStore.getShowDeleteDatabaseModal(),

      deleteIndexModalVisible: store.isDeleteIndexModalVisible(),
      deleteIndexModalText: store.getDeleteIndexModalText(),
      deleteIndexModalOnSubmit: store.getDeleteIndexModalOnSubmit(),
      deleteIndexModalIndexName: store.getDeleteIndexModalIndexName(),
      deleteIndexModalDesignDoc: store.getDeleteIndexDesignDoc(),

      cloneIndexModalVisible: store.isCloneIndexModalVisible(),
      cloneIndexModalTitle: store.getCloneIndexModalTitle(),
      cloneIndexModalSelectedDesignDoc: store.getCloneIndexModalSelectedDesignDoc(),
      cloneIndexModalNewDesignDocName: store.getCloneIndexModalNewDesignDocName(),
      cloneIndexModalOnSubmit: store.getCloneIndexModalOnSubmit(),
      cloneIndexDesignDocProp: store.getCloneIndexDesignDocProp(),
      cloneIndexModalNewIndexName: store.getCloneIndexModalNewIndexName(),
      cloneIndexSourceIndexName: store.getCloneIndexModalSourceIndexName(),
      cloneIndexSourceDesignDocName: store.getCloneIndexModalSourceDesignDocName(),
      cloneIndexModalIndexLabel: store.getCloneIndexModalIndexLabel()
    };
  };

  componentDidMount() {
    store.on('change', this.onChange, this);
    deleteDbModalStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    store.off('change', this.onChange);
    deleteDbModalStore.off('change', this.onChange, this);
  }

  onChange = () => {

    const newState = this.getStoreState();
    // Workaround to signal Redux store that the design doc list was updated
    // which is currently required by QueryOptionsContainer
    // It should be removed once Sidebar components are refactored to use Redux
    if (this.props.reduxUpdatedDesignDocList) {
      this.props.reduxUpdatedDesignDocList(newState.designDocList);
    }

    this.setState(newState);
  };

  showDeleteDatabaseModal = (payload) => {
    ComponentsActions.showDeleteDatabaseModal(payload);
  };

  // handles deleting of any index regardless of type. The delete handler and all relevant info is set when the user
  // clicks the delete action for a particular index
  deleteIndex = () => {

    // if the user is currently on the index that's being deleted, pass that info along to the delete handler. That can
    // be used to redirect the user to somewhere appropriate
    const isOnIndex = this.state.selectedNav.navItem === 'designDoc' &&
      ('_design/' + this.state.selectedNav.designDocName) === this.state.deleteIndexModalDesignDoc.id &&
      this.state.selectedNav.indexName === this.state.deleteIndexModalIndexName;

    this.state.deleteIndexModalOnSubmit({
      isOnIndex: isOnIndex,
      indexName: this.state.deleteIndexModalIndexName,
      designDoc: this.state.deleteIndexModalDesignDoc,
      designDocs: this.state.designDocs,
      database: this.state.database
    });
  };

  cloneIndex = () => {
    this.state.cloneIndexModalOnSubmit({
      sourceIndexName: this.state.cloneIndexSourceIndexName,
      sourceDesignDocName: this.state.cloneIndexSourceDesignDocName,
      targetDesignDocName: this.state.cloneIndexModalSelectedDesignDoc,
      newDesignDocName: this.state.cloneIndexModalNewDesignDocName,
      newIndexName: this.state.cloneIndexModalNewIndexName,
      designDocs: this.state.designDocs,
      database: this.state.database,
      onComplete: Actions.hideCloneIndexModal
    });
  };

  state = this.getStoreState();

  render() {
    if (this.state.isLoading) {
      return <LoadLines />;
    }

    return (
      <nav className="sidenav">
        <MainSidebar
          selectedNavItem={this.state.selectedNav.navItem}
          databaseName={this.state.database.id} />
        <DesignDocList
          selectedNav={this.state.selectedNav}
          toggle={Actions.toggleContent}
          toggledSections={this.state.toggledSections}
          designDocs={this.state.designDocList}
          database={this.state.database} />
        <DeleteDatabaseModal
          showHide={this.showDeleteDatabaseModal}
          modalProps={this.state.deleteDbModalProperties} />

        {/* the delete and clone index modals handle all index types, hence the props all being pulled from the store */}
        <ConfirmationModal
          title="Confirm Deletion"
          visible={this.state.deleteIndexModalVisible}
          text={this.state.deleteIndexModalText}
          onClose={Actions.hideDeleteIndexModal}
          onSubmit={this.deleteIndex} />
        <CloneIndexModal
          visible={this.state.cloneIndexModalVisible}
          title={this.state.cloneIndexModalTitle}
          close={Actions.hideCloneIndexModal}
          submit={this.cloneIndex}
          designDocArray={this.state.availableDesignDocIds}
          selectedDesignDoc={this.state.cloneIndexModalSelectedDesignDoc}
          newDesignDocName={this.state.cloneIndexModalNewDesignDocName}
          newIndexName={this.state.cloneIndexModalNewIndexName}
          indexLabel={this.state.cloneIndexModalIndexLabel} />
      </nav>
    );
  }
}
