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
import NotificationCenterButton from '../fauxton/notifications/components/NotificationCenterButton';
import SidebarControllerContainer from "./sidebar/SidebarControllerContainer";
import HeaderDocsLeft from './components/header-docs-left';
import ChangesContainer from './changes/components/ChangesContainer';
import ChangesTabContentContainer from './changes/components/ChangesTabContentContainer';
import IndexEditorComponents from "./index-editor/components";
import DesignDocInfoContainer from './designdocinfo/components/DesignDocInfoContainer';
import RightAllDocsHeader from './components/header-docs-right';
import IndexResultsContainer from './index-results/containers/IndexResultsContainer';
import PaginationContainer from './index-results/containers/PaginationContainer';
import ApiBarContainer from './index-results/containers/ApiBarContainer';
import { queryAllDocs, queryMapReduceView } from './index-results/api';
import PartitionKeySelectorContainer from './partition-key/container';
import Constants from './constants';
import Helpers from './helpers';

export const TabsSidebarHeader = ({
  hideQueryOptions,
  hideJumpToDoc,
  database,
  dbName,
  dropDownLinks,
  docURL,
  endpoint,
  endpointAddQueryOptions,
  fetchUrl,
  ddocsOnly,
  queryDocs,
  selectedNavItem,
  showPartitionKeySelector,
  partitionKey,
  onPartitionKeySelected,
  onGlobalModeSelected,
  globalMode
}) => {
  let partKeySelector = null;
  if (showPartitionKeySelector) {
    partKeySelector = (<PartitionKeySelectorContainer
      databaseName={dbName}
      partitionKey={partitionKey}
      onPartitionKeySelected={onPartitionKeySelected}
      onGlobalModeSelected={onGlobalModeSelected}
      globalMode={globalMode}/>
    );
  }

  return (
    <header className="two-panel-header">
      <div className="flex-layout flex-row">
        <div id="header-docs-left">
          <HeaderDocsLeft
            dbName={dbName}
            partitionKey={partitionKey}
            dropDownLinks={dropDownLinks}
          />
        </div>
        <div className="right-header-wrapper flex-layout flex-row flex-body">
          <div style={{flex:1, padding: '18px 6px 12px 12px'}}>
            {partKeySelector}
          </div>
          <div id="right-header" className="flex-fill">
            <RightAllDocsHeader
              hideQueryOptions={hideQueryOptions}
              hideJumpToDoc={hideJumpToDoc}
              database={database}
              fetchUrl={fetchUrl}
              ddocsOnly={ddocsOnly}
              queryDocs={queryDocs}
              partitionKey={partitionKey}
              selectedNavItem={selectedNavItem} />
          </div>
          <ApiBarContainer docURL={docURL} endpoint={endpoint} endpointAddQueryOptions={endpointAddQueryOptions} />
          <div id="notification-center-btn" className="flex-fill">
            <NotificationCenterButton />
          </div>
        </div>
      </div>
    </header>
  );
};

TabsSidebarHeader.propTypes = {
  dbName: PropTypes.string.isRequired,
  dropDownLinks: PropTypes.array.isRequired,
  docURL: PropTypes.string,
  endpoint: PropTypes.string,
  showIncludeAllDocs: PropTypes.bool,
  hideQueryOptions: PropTypes.bool,
  hideJumpToDoc: PropTypes.bool,
  database: PropTypes.object.isRequired,
  queryDocs: PropTypes.func,
  selectedNavItem: PropTypes.object,
  showPartitionKeySelector: PropTypes.bool.isRequired,
  partitionKey: PropTypes.string,
  onPartitionKeySelected: PropTypes.func,
  onGlobalModeSelected: PropTypes.func,
  globalMode: PropTypes.bool
};

TabsSidebarHeader.defaultProps = {
  hideHeaderBar: false,
  showPartitionKeySelector: false
};

export const TabsSidebarContent = ({
  hideFooter,
  lowerContent,
  upperContent,
  fetchUrl,
  databaseName,
  queryDocs,
  selectedNavItem,
  partitionKey
}) => {
  return (
    <div className="with-sidebar tabs-with-sidebar content-area">
      <aside id="sidebar-content" className="scrollable">
        <SidebarControllerContainer selectedNavItem={selectedNavItem} selectedPartitionKey={partitionKey}/>
      </aside>
      <section id="dashboard-content" className="flex-layout flex-col">
        <div id="dashboard-upper-content">
          {upperContent}
        </div>
        <div id="dashboard-lower-content" className="flex-body">
          {lowerContent}
        </div>
        <div id="footer">
          {!hideFooter ? <PaginationContainer
            databaseName={databaseName}
            fetchUrl={fetchUrl}
            queryDocs={queryDocs} /> : null}
        </div>
      </section>
    </div>
  );
};
TabsSidebarContent.defaultProps = {
  hideFooter: false
};

TabsSidebarContent.propTypes = {
  hideFooter: PropTypes.bool,
  lowerContent: PropTypes.object,
  upperContent: PropTypes.object,
  selectedNavItem: PropTypes.object
};

export const DocsTabsSidebarLayout = ({
  database,
  designDocs,
  docURL,
  endpoint,
  dbName,
  dropDownLinks,
  fetchUrl,
  ddocsOnly,
  deleteEnabled = true,
  selectedNavItem,
  partitionKey,
  onPartitionKeySelected,
  onGlobalModeSelected,
  globalMode
}) => {
  const partitionFilter = selectedNavItem.navItem === 'all-docs' && partitionKey ? partitionKey : '';
  let queryDocs = (params) => { return queryAllDocs(fetchUrl, partitionFilter, params); };
  if (Helpers.isViewSelected(selectedNavItem)) {
    queryDocs = (params) => { return queryMapReduceView(fetchUrl, params); };
  }
  const lowerContent = <IndexResultsContainer
    fetchUrl={fetchUrl}
    designDocs={designDocs}
    ddocsOnly={ddocsOnly}
    databaseName={dbName}
    fetchAtStartup={true}
    queryDocs={queryDocs}
    docType={Constants.INDEX_RESULTS_DOC_TYPE.VIEW}
    deleteEnabled={deleteEnabled}
    partitionKey={partitionKey} />;

  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        docURL={docURL}
        endpoint={endpoint}
        endpointAddQueryOptions={true}
        dbName={dbName}
        dropDownLinks={dropDownLinks}
        database={database}
        fetchUrl={fetchUrl}
        ddocsOnly={ddocsOnly}
        queryDocs={queryDocs}
        selectedNavItem={selectedNavItem}
        showPartitionKeySelector={!ddocsOnly}
        partitionKey={partitionKey}
        onPartitionKeySelected={onPartitionKeySelected}
        onGlobalModeSelected={onGlobalModeSelected}
        globalMode={globalMode}
      />
      <TabsSidebarContent
        lowerContent={lowerContent}
        fetchUrl={fetchUrl}
        databaseName={dbName}
        queryDocs={queryDocs}
        selectedNavItem={selectedNavItem}
        partitionKey={partitionKey}
      />
    </div>
  );
};

export const ChangesSidebarLayout = ({ docURL, database, endpoint, dbName, dropDownLinks, selectedNavItem, partitionKey }) => {
  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        docURL={docURL}
        endpoint={endpoint}
        dbName={dbName}
        dropDownLinks={dropDownLinks}
        database={database}
        hideQueryOptions={true}
      />
      <TabsSidebarContent
        upperContent={<ChangesTabContentContainer />}
        lowerContent={<ChangesContainer databaseName={dbName}/>}
        hideFooter={true}
        selectedNavItem={selectedNavItem}
        partitionKey={partitionKey}
      />
    </div>
  );
};

export const ViewsTabsSidebarLayout = ({showEditView, database, docURL, endpoint,
  dbName, dropDownLinks, selectedNavItem, designDocInfo, partitionKey }) => {

  const content = showEditView ?
    <IndexEditorComponents.IndexEditorContainer partitionKey={partitionKey}/> :
    <DesignDocInfoContainer
      designDocInfo={designDocInfo}
      designDocName={selectedNavItem.designDocName}/>;
  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        endpoint={endpoint}
        docURL={docURL}
        dbName={dbName}
        dropDownLinks={dropDownLinks}
        database={database}
        partitionKey={partitionKey}
        queryDocs={() => { }}
        hideQueryOptions={true}
        hideJumpToDoc={true}
      />
      <TabsSidebarContent
        lowerContent={content}
        hideFooter={true}
        selectedNavItem={selectedNavItem}
        partitionKey={partitionKey}
      />
    </div>
  );
};

ViewsTabsSidebarLayout.defaultProps = {
  showEditView: true
};

ViewsTabsSidebarLayout.propTypes = {
  showEditView: PropTypes.bool,
  docURL: PropTypes.string.isRequired,
  endpoint: PropTypes.string,
  dbName: PropTypes.string.isRequired,
  dropDownLinks: PropTypes.array.isRequired,
  designDocInfo: PropTypes.object
};
