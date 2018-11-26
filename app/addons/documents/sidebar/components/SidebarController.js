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

import PropTypes from 'prop-types';
import React from 'react';
import ComponentsActions from "../../../components/actions";
import Components from '../../../components/react-components';
import ComponentsStore from '../../../components/stores';
import GeneralComponents from '../../../fauxton/components';
import CloneIndexModal from './CloneIndexModal';
import DesignDocList from './DesignDocList';
import MainSidebar from './MainSidebar';

const { DeleteDatabaseModal, LoadLines } = Components;
const { ConfirmationModal } = GeneralComponents;
const { deleteDbModalStore } = ComponentsStore;

export default class SidebarController extends React.Component {

  static propTypes = {
    selectedNav: PropTypes.shape({
      designDocName: PropTypes.string,
      designDocSection: PropTypes.string,
      indexName: PropTypes.string,
      navItem: PropTypes.string
    }).isRequired
  };

  constructor(props) {
    super(props);
    this.state = this.getDeleteDbStoreState();
    this.deleteIndex = this.deleteIndex.bind(this);
    this.cloneIndex = this.cloneIndex.bind(this);
  }

  componentDidMount() {
    deleteDbModalStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    deleteDbModalStore.off('change', this.onChange, this);
  }

  getDeleteDbStoreState() {
    return {
      deleteDbModalProperties: deleteDbModalStore.getShowDeleteDatabaseModal()
    };
  }

  onChange = () => {
    const newState = this.getDeleteDbStoreState();
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
    const isOnIndex = this.props.selectedNav.navItem === 'designDoc' &&
      ('_design/' + this.props.selectedNav.designDocName) === this.props.deleteIndexModalDesignDoc.id &&
      this.props.selectedNav.indexName === this.props.deleteIndexModalIndexName;

    this.props.deleteIndexModalOnSubmit({
      isOnIndex: isOnIndex,
      indexName: this.props.deleteIndexModalIndexName,
      designDoc: this.props.deleteIndexModalDesignDoc,
      designDocs: this.props.designDocs,
      database: this.props.database
    });
  };

  cloneIndex = () => {
    this.props.cloneIndexModalOnSubmit({
      sourceIndexName: this.props.cloneIndexSourceIndexName,
      sourceDesignDocName: this.props.cloneIndexSourceDesignDocName,
      targetDesignDocName: this.props.cloneIndexModalSelectedDesignDoc,
      newDesignDocName: this.props.cloneIndexModalNewDesignDocName,
      newDesignDocPartitioned: this.props.cloneIndexModalNewDesignDocPartitioned,
      isDbPartitioned: this.props.isDbPartitioned,
      newIndexName: this.props.cloneIndexModalNewIndexName,
      designDocs: this.props.designDocs,
      database: this.props.database,
      onComplete: this.props.hideCloneIndexModal
    });
  };

  render() {
    if (this.props.isLoading) {
      return <LoadLines />;
    }

    return (
      <nav className="sidenav">
        <MainSidebar
          selectedNavItem={this.props.selectedNav.navItem}
          databaseName={this.props.database.id}
          selectedPartitionKey={this.props.selectedPartitionKey}/>
        <DesignDocList
          selectedNav={this.props.selectedNav}
          selectedPartitionKey={this.props.selectedPartitionKey}
          isDbPartitioned={this.props.isDbPartitioned}
          toggle={this.props.toggleContent}
          toggledSections={this.props.toggledSections}
          designDocs={this.props.designDocList}
          database={this.props.database}
          showDeleteIndexModal={this.props.showDeleteIndexModal}
          showCloneIndexModal={this.props.showCloneIndexModal} />
        <DeleteDatabaseModal
          showHide={this.showDeleteDatabaseModal}
          modalProps={this.state.deleteDbModalProperties} />

        {/* the delete and clone index modals handle all index types, hence the props all being pulled from the store */}
        <ConfirmationModal
          title="Confirm Deletion"
          visible={this.props.deleteIndexModalVisible}
          text={this.props.deleteIndexModalText}
          onClose={this.props.hideDeleteIndexModal}
          onSubmit={this.deleteIndex} />
        <CloneIndexModal
          visible={this.props.cloneIndexModalVisible}
          title={this.props.cloneIndexModalTitle}
          close={this.props.hideCloneIndexModal}
          submit={this.cloneIndex}
          designDocArray={this.props.availableDesignDocIds}
          selectedDesignDoc={this.props.cloneIndexModalSelectedDesignDoc}
          selectedDesignDocPartitioned={this.props.cloneIndexModalSelectedDesignDocPartitioned}
          newDesignDocName={this.props.cloneIndexModalNewDesignDocName}
          newDesignDocPartitioned={this.props.cloneIndexModalNewDesignDocPartitioned}
          newIndexName={this.props.cloneIndexModalNewIndexName}
          indexLabel={this.props.cloneIndexModalIndexLabel}
          selectDesignDoc={this.props.selectDesignDoc}
          updateNewDesignDocName={this.props.updateNewDesignDocName}
          updateNewDesignDocPartitioned={this.props.updateNewDesignDocPartitioned}
          setNewCloneIndexName={this.props.setNewCloneIndexName}
          isDbPartitioned={this.props.isDbPartitioned} />
      </nav>
    );
  }
}
