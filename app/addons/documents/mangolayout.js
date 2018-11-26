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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import app from "../../app";
import { Breadcrumbs } from '../components/header-breadcrumbs';
import NotificationCenterButton from '../fauxton/notifications/components/NotificationCenterButton';
import MangoComponents from "./mango/mango.components";
import * as MangoAPI from "./mango/mango.api";
import IndexResultsContainer from './index-results/containers/IndexResultsContainer';
import PaginationContainer from './index-results/containers/PaginationContainer';
import ApiBarContainer from './index-results/containers/ApiBarContainer';
import PartitionKeySelectorContainer from './partition-key/container';
import FauxtonAPI from "../../core/api";
import Constants from './constants';

export const RightHeader = ({
  docURL,
  endpoint,
  databaseName,
  showPartitionKeySelector,
  partitionKey,
  onPartitionKeySelected,
  onGlobalModeSelected,
  globalMode
}) => {
  const apiBar = <ApiBarContainer docURL={docURL} endpoint={endpoint} includeQueryOptionsParams={false}/>;
  let partKeySelector = null;
  if (showPartitionKeySelector) {
    partKeySelector = (<PartitionKeySelectorContainer
      databaseName={databaseName}
      partitionKey={partitionKey}
      onPartitionKeySelected={onPartitionKeySelected}
      onGlobalModeSelected={onGlobalModeSelected}
      globalMode={globalMode}/>
    );
  }
  return (
    <div className="right-header-wrapper flex-layout flex-row flex-body">
      <div style={{flex:1, padding: '18px 6px 12px 12px'}}>
        {partKeySelector}
      </div>
      <div id="right-header" className="flex-body">
      </div>
      {apiBar}
      <div id='notification-center-btn'>
        <NotificationCenterButton />
      </div>
    </div>
  );
};

export const MangoFooter = ({databaseName, fetchUrl, queryDocs}) => {
  return (
    <div id="footer">
      <PaginationContainer
        databaseName={databaseName}
        fetchUrl={fetchUrl}
        queryDocs={queryDocs} />
    </div>
  );
};

export const MangoHeader = ({
  crumbs,
  docURL,
  endpoint,
  databaseName,
  partitionKey,
  showPartitionKeySelector,
  onPartitionKeySelected,
  onGlobalModeSelected,
  globalMode
}) => {
  return (
    <div className="header-wrapper flex-layout flex-row">
      <div className='flex-body faux__breadcrumbs-mango-header'>
        <Breadcrumbs crumbs={crumbs} />
      </div>
      <RightHeader
        docURL={docURL}
        endpoint={endpoint}
        databaseName={databaseName}
        showPartitionKeySelector={showPartitionKeySelector}
        partitionKey={partitionKey}
        onPartitionKeySelected={onPartitionKeySelected}
        onGlobalModeSelected={onGlobalModeSelected}
        globalMode={globalMode}
      />
    </div>
  );
};

MangoHeader.defaultProps = {
  crumbs: []
};

export const MangoContent = ({ edit, designDocs, explainPlan, databaseName, fetchUrl, queryDocs, docType, partitionKey }) => {
  const leftContent = edit ?
    <MangoComponents.MangoIndexEditorContainer
      description={app.i18n.en_US['mango-descripton-index-editor']}
      databaseName={databaseName}
      partitionKey={partitionKey}
    /> :
    <MangoComponents.MangoQueryEditorContainer
      description={app.i18n.en_US['mango-descripton']}
      editorTitle={app.i18n.en_US['mango-title-editor']}
      additionalIndexesText={app.i18n.en_US['mango-additional-indexes-heading']}
      databaseName={databaseName}
      partitionKey={partitionKey}
    />;

  let resultsPage = <IndexResultsContainer
    fetchUrl={fetchUrl}
    designDocs={designDocs}
    ddocsOnly={false}
    databaseName={databaseName}
    fetchAtStartup={false}
    queryDocs={queryDocs}
    docType={docType}
    partitionKey={partitionKey} />;

  let mangoFooter = <MangoFooter
    databaseName={databaseName}
    fetchUrl={fetchUrl}
    queryDocs={queryDocs} />;

  if (explainPlan) {
    resultsPage = <MangoComponents.ExplainPage explainPlan={explainPlan} />;
    mangoFooter = null;
  }

  return (
    <div id="two-pane-content" className="flex-layout flex-row flex-body">
      <div id="left-content" className="flex-body">
        {leftContent}
      </div>
      <div id="right-content" className="flex-body flex-layout flex-col">
        <div id="dashboard-lower-content" className="flex-body">
          {resultsPage}
        </div>
        {mangoFooter}
      </div>
    </div>
  );
};

class MangoLayout extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { database, edit, docURL, crumbs, designDocs, fetchUrl, databaseName, queryFindCode, partitionKey, onPartitionKeySelected, onGlobalModeSelected, globalMode } = this.props;
    let endpoint = this.props.endpoint;

    if (this.props.explainPlan) {
      const encodedPartKey = partitionKey ? encodeURIComponent(partitionKey) : '';
      endpoint = FauxtonAPI.urls('mango', 'explain-apiurl', encodeURIComponent(database), encodedPartKey);
    }
    let queryFunction = (params) => { return MangoAPI.mangoQueryDocs(databaseName, partitionKey, queryFindCode, params); };
    let docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY;
    if (edit) {
      queryFunction = (params) => { return MangoAPI.fetchIndexes(databaseName, params); };
      docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;
    }
    return (
      <div id="dashboard" className="two-pane flex-layout flex-col">
        <MangoHeader
          docURL={docURL}
          endpoint={endpoint}
          crumbs={crumbs}
          databaseName={databaseName}
          partitionKey={partitionKey}
          showPartitionKeySelector={!edit}
          onPartitionKeySelected={onPartitionKeySelected}
          onGlobalModeSelected={onGlobalModeSelected}
          globalMode={globalMode}
        />
        <MangoContent
          edit={edit}
          designDocs={designDocs}
          explainPlan={this.props.explainPlan}
          databaseName={databaseName}
          fetchUrl={fetchUrl}
          queryDocs={queryFunction}
          docType={docType}
          partitionKey={partitionKey}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ mangoQuery }, ownProps) => {
  return {
    explainPlan: mangoQuery.explainPlan,
    queryFindCode: mangoQuery.queryFindCode,
    partitionKey: ownProps.partitionKey,
    databaseName: ownProps.databaseName,
    onPartitionKeySelected: ownProps.onPartitionKeySelected,
    onGlobalModeSelected: ownProps.onGlobalModeSelected,
    globalMode: ownProps.globalMode
  };
};

export const MangoLayoutContainer = connect(
  mapStateToProps
)(MangoLayout);
