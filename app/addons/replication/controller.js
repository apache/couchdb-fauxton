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
import FauxtonAPI from '../../core/api';
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
    this.props.initReplicator(props.routeLocalSource, props.localSource);
    this.getAllActivity();
    this.loadReplicationStateFrom(props, oldProps);
  }

  loadReplicationStateFrom (props, oldProps) {
    if (props.replicationId && props.replicationId !== oldProps.replicationId) {
      this.props.clearReplicationForm();
      this.props.getReplicationStateFrom(props.replicationId);
    }
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

  UNSAFE_componentWillReceiveProps (nextProps) {
    this.loadReplicationStateFrom(nextProps, this.props);
    if (this.props.tabSection !== 'new replication' && nextProps.tabSection === 'new replication') {
      this.props.clearReplicationForm();
    }
  }

  componentWillUnmount () {
    this.props.clearReplicationForm();
  }

  showSection () {
    const {
      replicationSource, replicationTarget, replicationType, replicationDocName,
      databases, localSource, remoteSource, remoteTarget,
      localTarget, statusDocs, statusFilter, loading, allDocsSelected,
      someDocsSelected, showConflictModal, localSourceKnown, localTargetKnown, updateFormField,
      authenticated, activityLoading, submittedNoChange, activitySort, tabSection,
      replicateInfo, replicateLoading, replicateFilter, allReplicateSelected, someReplicateSelected,
      hideConflictModal, isConflictModalVisible, filterDocs,
      filterReplicate, replicate, clearReplicationForm, selectAllDocs, changeActivitySort, selectDoc,
      deleteDocs, deleteReplicates, selectAllReplicates, selectReplicate,
      sourceAuthType, sourceAuth, targetAuthType, targetAuth, targetDatabasePartitioned, allowNewPartitionedLocalDbs
    } = this.props;

    if (tabSection === 'new replication') {
      if (loading) {
        return <LoadLines/>;
      }

      return <NewReplication
        docs={statusDocs}
        localTargetKnown={localTargetKnown}
        localSourceKnown={localSourceKnown}
        clearReplicationForm={clearReplicationForm}
        replicate={replicate}
        replicationSource={replicationSource}
        replicationTarget={replicationTarget}
        replicationType={replicationType}
        replicationDocName={replicationDocName}
        databases={databases}
        localSource={localSource}
        remoteSource={remoteSource}
        remoteTarget={remoteTarget}
        localTarget={localTarget}
        sourceAuthType={sourceAuthType}
        sourceAuth={sourceAuth}
        targetAuthType={targetAuthType}
        targetAuth={targetAuth}
        targetDatabasePartitioned={targetDatabasePartitioned}
        allowNewPartitionedLocalDbs={allowNewPartitionedLocalDbs}
        updateFormField={updateFormField}
        conflictModalVisible={isConflictModalVisible}
        hideConflictModal={hideConflictModal}
        showConflictModal={showConflictModal}
        checkReplicationDocID={checkReplicationDocID}
        authenticated={authenticated}
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
        onFilterChange={filterReplicate}
        selectDoc={selectReplicate}
        selectAllDocs={selectAllReplicates}
        allDocsSelected={allReplicateSelected}
        someDocsSelected={someReplicateSelected}
        activitySort={activitySort}
        changeActivitySort={changeActivitySort}
        deleteDocs={deleteReplicates}
      />;
    }

    if (activityLoading) {
      return <LoadLines/>;
    }

    return <Activity
      docs={statusDocs}
      filter={statusFilter}
      onFilterChange={filterDocs}
      selectAllDocs={selectAllDocs}
      selectDoc={selectDoc}
      allDocsSelected={allDocsSelected}
      someDocsSelected={someDocsSelected}
      deleteDocs={deleteDocs}
      activitySort={activitySort}
      changeActivitySort={changeActivitySort}
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
    // this.props.changeTabSection(section, url);
    FauxtonAPI.navigate(url);
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
