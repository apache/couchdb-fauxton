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
import Helpers from '../../helpers';
import Components from '../components/react-components';
import NewReplication from './components/newreplication';
import Activity from './components/activity';
import {checkReplicationDocID} from './api';
import {OnePane, OnePaneHeader, OnePaneContent} from '../components/layouts';
import {TabElementWrapper, TabElement} from '../components/components/tabelement';
import ReplicateActivity from './components/replicate-activity';

const {LoadLines, Polling, RefreshBtn} = Components;

export default class ReplicationController extends React.Component {

  loadReplicationInfo (props, oldProps) {
    console.log('LO', props, oldProps);
    this.props.initReplicator(props.routeLocalSource, props.localSource);
    this.getAllActivity();
    // if (props.replicationId && props.replicationId !== oldProps.replicationId) {
    //   this.props.clearReplicationForm();
    //   this.props.getReplicationStateFrom(props.replicationId);
    // }
  }

  getAllActivity () {
    this.props.getReplicationActivity();
    this.props.getReplicateActivity();
  }

  componentDidMount () {
    this.props.checkForNewApi();
    this.props.getDatabasesList();
    this.loadReplicationInfo(this.props, {});
  }

  componentWillReceiveProps (nextProps) {
    // this.loadReplicationInfo(nextProps, this.props);
  }

  componentWillUnmount () {
    this.props.clearReplicationForm();
  }

  showSection () {
    const {
      replicationSource, replicationTarget, replicationType, replicationDocName,
      passwordModalVisible, databases, localSource, remoteSource, remoteTarget,
      localTarget, statusDocs, statusFilter, loading, allDocsSelected,
      someDocsSelected, showConflictModal, localSourceKnown, localTargetKnown, updateFormField,
      username, password, authenticated, activityLoading, submittedNoChange, activitySort, tabSection,
      replicateInfo, replicateLoading, replicateFilter, allReplicateSelected, someReplicateSelected,
      showPasswordModal, hidePasswordModal, hideConflictModal, isConflictModalVisible
    } = this.props;

    if (tabSection === 'new replication') {
      if (loading) {
        return <LoadLines/>;
      }

      return <NewReplication
        docs={statusDocs}
        localTargetKnown={localTargetKnown}
        localSourceKnown={localSourceKnown}
        clearReplicationForm={this.props.clearReplicationForm}
        replicate={this.props.replicate}
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
        conflictModalVisible={isConflictModalVisible}
        hideConflictModal={hideConflictModal}
        showConflictModal={showConflictModal}
        checkReplicationDocID={checkReplicationDocID}
        authenticated={authenticated}
        username={username}
        password={password}
        submittedNoChange={submittedNoChange}
        hidePasswordModal={hidePasswordModal}
      />;
    }

    if (tabSection === '_replicate') {
      if (replicateLoading) {
        return <LoadLines />;
      }

      return <ReplicateActivity
        docs={replicateInfo}
        filter={replicateFilter}
        onFilterChange={this.props.filterReplicate}
        selectDoc={this.props.selectReplicate}
        selectAllDocs={this.props.selectAllReplicates}
        allDocsSelected={allReplicateSelected}
        someDocsSelected={someReplicateSelected}
        activitySort={activitySort}
        changeActivitySort={this.props.changeActivitySort}
        deleteDocs={this.props.deleteReplicates}
      />;
    }

    if (activityLoading) {
      return <LoadLines/>;
    }

    console.log('FF', this.props);

    return <Activity
      docs={statusDocs}
      filter={statusFilter}
      onFilterChange={this.props.filterDocs}
      selectAllDocs={this.props.selectAllDocs}
      selectDoc={this.props.selectDoc}
      allDocsSelected={allDocsSelected}
      someDocsSelected={someDocsSelected}
      deleteDocs={this.props.deleteDocs}
      activitySort={activitySort}
      changeActivitySort={this.props.changeActivitySort}
    />;
  }

  getHeaderComponents () {
    if (this.props.tabSection === 'new replication') {
      return null;
    }
    let rightHeaderclass = "right-header-flex";
    if (Helpers.isIE1X()) {
      rightHeaderclass += " " + rightHeaderclass + "--ie1X";
    }

    return (
      <div className={rightHeaderclass}>
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
    const {tabSection} = this.props;
    const elements = [
      <TabElement
        key={1}
        selected={tabSection === 'activity'}
        text={"Replicator DB Activity"}
        onChange={this.onTabChange.bind(this, 'activity', '#/replication')}
      />
    ];

    if (this.props.supportNewApi) {
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
    this.props.changeTabSection(section, url);
  }

  getCrumbs () {
    if (this.props.tabSection === 'new replication') {
      return [{'name': 'Job Configuration'}];
    }
    return [{'name': 'Replication'}];
  }

  getTabs () {
    if (this.props.tabSection === 'new replication') {
      return null;
    }

    return (
      <TabElementWrapper>
        {this.getTabElements()}
      </TabElementWrapper>
    );
  }

  render () {
    const { checkingAPI } = this.props;

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
