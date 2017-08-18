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
import IndexResultsComponents from './index-results/index-results.components';
import ReactPagination from './pagination/pagination';
import {NotificationCenterButton} from '../fauxton/notifications/notifications';
import {ApiBarWrapper} from '../components/layouts';
import SidebarComponents from "./sidebar/sidebar";
import HeaderDocsLeft from './components/header-docs-left';
import Changes from './changes/components';
import IndexEditorComponents from "./index-editor/components";
import DesignDocInfoComponents from './designdocinfo/components';
import RightAllDocsHeader from './components/header-docs-right';
import IndexResultsContainer from './index-results/containers/IndexResultsContainer';
import PaginationContainer from './index-results/containers/PaginationContainer';
import ApiBarContainer from './index-results/containers/ApiBarContainer';
import { queryAllDocs } from './index-results/apis/fetch';

export const TabsSidebarHeader = ({
  hideQueryOptions,
  database,
  dbName,
  dropDownLinks,
  docURL,
  endpoint,
  isRedux = false,
  fetchUrl,
  ddocsOnly
}) => {
  return (
    <header className="two-panel-header">
      <div className="flex-layout flex-row">
        <div id="header-docs-left">
          <HeaderDocsLeft
            dbName={dbName}
            dropDownLinks={dropDownLinks}
            />
        </div>
        <div className="right-header-wrapper flex-layout flex-row flex-body">
          <div id="right-header" className="flex-fill">
            <RightAllDocsHeader
              hideQueryOptions={hideQueryOptions}
              database={database}
              isRedux={isRedux}
              fetchUrl={fetchUrl}
              ddocsOnly={ddocsOnly}
              queryDocs={ (params) => { return queryAllDocs(fetchUrl, params); } } />
          </div>
          { isRedux ? <ApiBarContainer databaseName={dbName} /> :
                      <ApiBarWrapper docURL={docURL} endpoint={endpoint} /> }
          <div id="notification-center-btn" className="flex-fill">
            <NotificationCenterButton />
          </div>
        </div>
      </div>
    </header>
  );
};

TabsSidebarHeader.propTypes = {
  dbName : React.PropTypes.string.isRequired,
  dropDownLinks : React.PropTypes.array.isRequired,
  docURL : React.PropTypes.string,
  endpoint : React.PropTypes.string,
  showIncludeAllDocs : React.PropTypes.bool,
  hideHeaderBar : React.PropTypes.bool,
  database : React.PropTypes.object.isRequired
};

TabsSidebarHeader.defaultProps = {
  hideHeaderBar: false
};

export const TabsSidebarContent = ({
  hideFooter,
  lowerContent,
  upperContent,
  isRedux = false,
  fetchUrl,
  databaseName
}) => {
  return (
    <div className="with-sidebar tabs-with-sidebar content-area">
      <aside id="sidebar-content" className="scrollable">
        <SidebarComponents.SidebarController />
      </aside>
      <section id="dashboard-content" className="flex-layout flex-col">
        <div id="dashboard-upper-content">
          {upperContent}
        </div>
        <div id="dashboard-lower-content" className="flex-body">
          {lowerContent}
        </div>
        <div id="footer">
          {isRedux && !hideFooter ? <PaginationContainer
                                      databaseName={databaseName}
                                      fetchUrl={fetchUrl}
                                      queryDocs={(params) => { return queryAllDocs(fetchUrl, params); }}/> : null}
          {!isRedux && !hideFooter ? <ReactPagination.Footer /> : null}
        </div>
      </section>
    </div>
  );
};
TabsSidebarContent.defaultProps = {
  hideFooter: false
};

TabsSidebarContent.propTypes = {
  hideFooter: React.PropTypes.bool,
  lowerContent: React.PropTypes.object,
  upperContent: React.PropTypes.object,
};

export const DocsTabsSidebarLayout = ({
  database,
  designDocs,
  docURL,
  endpoint,
  dbName,
  dropDownLinks,
  isRedux = false,
  fetchUrl,
  ddocsOnly
}) => {
  let lowerContent;
  if (isRedux) {
    lowerContent = <IndexResultsContainer
                      fetchUrl={fetchUrl}
                      designDocs={designDocs}
                      ddocsOnly={ddocsOnly}
                      databaseName={dbName}
                      fetchAtStartup={true}
                      queryDocs={ (params) => { return queryAllDocs(fetchUrl, params); } }
                      docType={'view'} />;
  } else {
    lowerContent = <IndexResultsComponents.List designDocs={designDocs} />;
  }

  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        docURL={docURL}
        endpoint={endpoint}
        dbName={dbName}
        dropDownLinks={dropDownLinks}
        database={database}
        isRedux={isRedux}
        fetchUrl={fetchUrl}
        ddocsOnly={ddocsOnly}
      />
      <TabsSidebarContent
        lowerContent={lowerContent}
        isRedux={isRedux}
        fetchUrl={fetchUrl}
        databaseName={dbName}
      />
    </div>
  );
};

export const ChangesSidebarLayout = ({docURL, database, endpoint, dbName, dropDownLinks}) => {
  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        docURL={docURL}
        endpoint={endpoint}
        dbName={dbName}
        dropDownLinks={dropDownLinks}
        database={database}
      />
      <TabsSidebarContent
        upperContent={<Changes.ChangesTabContent />}
        lowerContent={<Changes.ChangesController />}
        hideFooter={true}
        />
    </div>
  );
};

export const ViewsTabsSidebarLayout = ({showEditView, database, docURL, endpoint, dbName, dropDownLinks}) => {
  const content = showEditView ? <IndexEditorComponents.EditorController /> : <DesignDocInfoComponents.DesignDocInfo />;
  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        endpoint={endpoint}
        docURL={docURL}
        dbName={dbName}
        dropDownLinks={dropDownLinks}
        database={database}
      />
      <TabsSidebarContent
        lowerContent={content}
        hideFooter={true}
      />
    </div>
  );
};

ViewsTabsSidebarLayout.defaultProps = {
  showEditView: true
};

ViewsTabsSidebarLayout.propTypes = {
  showEditView: React.PropTypes.bool,
  docURL: React.PropTypes.string.isRequired,
  endpoint: React.PropTypes.string,
  dbName: React.PropTypes.string.isRequired,
  dropDownLinks: React.PropTypes.array.isRequired
};
