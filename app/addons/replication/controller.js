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
import app from '../../app';
import FauxtonAPI from '../../core/api';
import Stores from './stores';
import Actions from './actions';
import AuthActions from '../auth/actions';
import Constants from './constants';
import base64 from 'base-64';
import Components from '../components/react-components.react';
import NewReplication from './components/newreplication';
import Activity from './components/activity';
import {checkReplicationDocID} from './api';
import {OnePane, OnePaneHeader, OnePaneContent} from '../components/layouts';

const {LoadLines, ConfirmButton, Polling, RefreshBtn} = Components;

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
      allDocsSelected: store.getAllDocsSelected(),
      someDocsSelected:  store.someDocsSelected(),
      username: store.getUsername(),
      password: store.getPassword(),
      activitySort: store.getActivitySort()
    };
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
    Actions.initReplicator(this.props.localSource);
    Actions.getReplicationActivity();

    if (this.props.replicationId) {
      Actions.getReplicationStateFrom(this.props.replicationId);
    }
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
      localTarget, selectedTab, statusDocs, statusFilter, loading, allDocsSelected,
      someDocsSelected, showConflictModal, localSourceKnown, localTargetKnown,
      username, password, authenticated, activityLoading, submittedNoChange, activitySort
    } = this.state;

    if (this.props.section === 'new replication') {
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
        showPasswordModal={AuthActions.showPasswordModal}
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

  getCrumbs () {
    if (this.props.section === 'new replication') {
      return [
        {name: 'Replication', link: 'replication'},
        {name: 'New Replication'}
      ];
    }

    return [
      {name: 'Replication'}
    ];
  }

  render () {
    return (
      <OnePane>
        <OnePaneHeader
          crumbs={this.getCrumbs()}
        >
        <Polling
          min={60}
          max={600}
          startValue={300}
          stepSize={60}
          onPoll={Actions.getReplicationActivity}
          />
        <RefreshBtn
          refresh={Actions.getReplicationActivity}
          />
        </OnePaneHeader>
        <OnePaneContent>
          <div className="template-content flex-body flex-layout flex-col">
            <div className="replication-page flex-layout flex-col">
              {this.showSection()}
            </div>
          </div>
        </OnePaneContent>
      </OnePane>
    );
  }
}
