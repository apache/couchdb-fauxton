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
import Stores from './stores';
import Actions from './actions';
import {showPasswordModal} from '../auth/actions';
import Components from '../components/react-components';
import NewReplication from './components/newreplication';
import Activity from './components/activity';
import {checkReplicationDocID} from './api';
import {OnePane, OnePaneHeader, OnePaneContent} from '../components/layouts';
import {TabElementWrapper, TabElement} from '../components/components/tabelement';
import ReplicateActivity from './components/replicate-activity';

const {LoadLines, Polling, RefreshBtn} = Components;

const store = Stores.replicationStore;

export default class ReplicationController extends React.Component {
  constructor (props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      loading: store.isLoading(),
      activityLoading: store.isActivityLoading(),
      databases: store.getDatabases(),
      authenticated: store.isAuthenticated(),
      password: store.getPassword(),

      // source fields
      replicationSource: store.getReplicationSource(),
      localSource: store.getlocalSource(),
      localSourceKnown: store.isLocalSourceKnown(),
      remoteSource: store.getRemoteSource(),

      // target fields
      replicationTarget: store.getReplicationTarget(),
      localTarget: store.getlocalTarget(),
      localTargetKnown: store.isLocalTargetKnown(),
      remoteTarget: store.getRemoteTarget(),

      // other
      passwordModalVisible: store.isPasswordModalVisible(),
      showConflictModal: store.isConflictModalVisible(),
      replicationType: store.getReplicationType(),
      replicationDocName: store.getReplicationDocName(),
      submittedNoChange: store.getSubmittedNoChange(),
      statusDocs: store.getFilteredReplicationStatus(),
      statusFilter: store.getStatusFilter(),
      replicateFilter: store.getReplicateFilter(),
      allDocsSelected: store.getAllDocsSelected(),
      someDocsSelected:  store.someDocsSelected(),
      username: store.getUsername(),
      password: store.getPassword(),
      activitySort: store.getActivitySort(),
      tabSection: store.getTabSection(),
      checkingApi: store.checkingAPI(),
      supportNewApi: store.supportNewApi(),
      replicateLoading: store.isReplicateInfoLoading(),
      replicateInfo: store.getReplicateInfo(),
      allReplicateSelected: store.getAllReplicateSelected(),
      someReplicateSelected: store.someReplicateSelected()
    };
  }

  loadReplicationInfo (props, oldProps) {
    Actions.initReplicator(props.localSource);
    this.getAllActivity();
    if (props.replicationId && props.replicationId !== oldProps.replicationId) {
      Actions.clearReplicationForm();
      Actions.getReplicationStateFrom(props.replicationId);
    }
  }

  getAllActivity () {
    Actions.getReplicationActivity();
    Actions.getReplicateActivity();
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
    this.loadReplicationInfo(this.props, {});
  }

  componentWillReceiveProps (nextProps) {
    this.loadReplicationInfo(nextProps, this.props);
  }

  componentWillUnmount () {
    store.off('change', this.onChange);
    Actions.clearReplicationForm();
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  showSection () {
    const {
      replicationSource, replicationTarget, replicationType, replicationDocName,
      passwordModalVisible, databases, localSource, remoteSource, remoteTarget,
      localTarget, statusDocs, statusFilter, loading, allDocsSelected,
      someDocsSelected, showConflictModal, localSourceKnown, localTargetKnown,
      username, password, authenticated, activityLoading, submittedNoChange, activitySort, tabSection,
      replicateInfo, replicateLoading, replicateFilter, allReplicateSelected, someReplicateSelected
    } = this.state;

    if (tabSection === 'new replication') {
      if (loading) {
        return <LoadLines/>;
      }

      const updateFormField = (field) => {
        return (value) => {
          Actions.updateFormField(field, value);
        };
      };

      return <NewReplication
        docs={statusDocs}
        localTargetKnown={localTargetKnown}
        localSourceKnown={localSourceKnown}
        clearReplicationForm={Actions.clearReplicationForm}
        replicate={Actions.replicate}
        showPasswordModal={showPasswordModal}
        replicationSource={replicationSource}
        replicationTarget={replicationTarget}
        replicationType={replicationType}
        replicationDocName={replicationDocName}
        passwordModalVisible={passwordModalVisible}
        databases={databases}
        localSource={localSource}
        remoteSource={remoteSource}
        remoteTarget={remoteTarget}
        localTarget={localTarget}
        updateFormField={updateFormField}
        conflictModalVisible={showConflictModal}
        hideConflictModal={Actions.hideConflictModal}
        showConflictModal={Actions.showConflictModal}
        checkReplicationDocID={checkReplicationDocID}
        authenticated={authenticated}
        username={username}
        password={password}
        submittedNoChange={submittedNoChange}
      />;
    }

    if (tabSection === '_replicate') {
      if (replicateLoading) {
        return <LoadLines />;
      }

      return <ReplicateActivity
        docs={replicateInfo}
        filter={replicateFilter}
        onFilterChange={Actions.filterReplicate}
        selectDoc={Actions.selectReplicate}
        selectAllDocs={Actions.selectAllReplicates}
        allDocsSelected={allReplicateSelected}
        someDocsSelected={someReplicateSelected}
        deleteDocs={Actions.deleteDocs}
        activitySort={activitySort}
        changeActivitySort={Actions.changeActivitySort}
        deleteDocs={Actions.deleteReplicates}
        />;
    }

    if (activityLoading) {
      return <LoadLines/>;
    }

    return <Activity
      docs={statusDocs}
      filter={statusFilter}
      onFilterChange={Actions.filterDocs}
      selectAllDocs={Actions.selectAllDocs}
      selectDoc={Actions.selectDoc}
      selectAllDocs={Actions.selectAllDocs}
      allDocsSelected={allDocsSelected}
      someDocsSelected={someDocsSelected}
      deleteDocs={Actions.deleteDocs}
      activitySort={activitySort}
      changeActivitySort={Actions.changeActivitySort}
           />;
  }

  getHeaderComponents () {
    if (this.state.tabSection === 'new replication') {
      return null;
    }

    return (
      <div className="right-header-flex">
        <Polling
          min={60}
          max={600}
          startValue={300}
          stepSize={60}
          onPoll={this.getAllActivity.bind(this)}
          />
        <RefreshBtn
          refresh={this.getAllActivity.bind(this)}
          />
      </div>
    );
  }

  getTabElements () {
    const {tabSection} = this.state;
    const elements = [
      <TabElement
        key={1}
        selected={tabSection === 'activity'}
        text={"Replicator DB Activity"}
        onChange={this.onTabChange.bind(this, 'activity', '#/replication')}
      />
    ];

    if (this.state.supportNewApi) {
      elements.push(
        <TabElement
          key={2}
          selected={tabSection === '_replicate'}
          text={"_replicate Activity"}
          onChange={this.onTabChange.bind(this, '_replicate', '#/replication/_replicate')}
        />
      );
    }

    return elements;
  }

  onTabChange (section, url) {
    Actions.changeTabSection(section, url);
  }

  getCrumbs () {
    if (this.state.tabSection === 'new replication') {
      return [{'name': 'Job Configuration'}];
    }

    return [];
  }

  getTabs () {
    if (this.state.tabSection === 'new replication') {
      return null;
    }

    return (
      <TabElementWrapper>
        {this.getTabElements()}
      </TabElementWrapper>
    );
  }

  render () {
    const { checkingAPI } = this.state;

    if (checkingAPI) {
      return <LoadLines />;
    }

    return (
      <OnePane>
        <OnePaneHeader crumbs={this.getCrumbs()}>
        {this.getHeaderComponents()}
        </OnePaneHeader>
        <OnePaneContent>
          <div className="template-content flex-body flex-layout flex-col">
            {this.getTabs()}
            <div className="replication__page flex-layout flex-col">
              {this.showSection()}
            </div>
          </div>
        </OnePaneContent>
      </OnePane>
    );
  }
}
