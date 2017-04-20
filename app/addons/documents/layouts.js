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
import IndexResultsComponents from './index-results/index-results.components.react';
import ReactPagination from './pagination/pagination.react';
import ReactHeader from './header/header.react';
import {NotificationCenterButton} from '../fauxton/notifications/notifications.react';
import {ApiBarWrapper} from '../components/layouts';
import SidebarComponents from "./sidebar/sidebar.react";
import HeaderDocsLeft from './components/header-docs-left';
import Changes from './changes/components.react';
import IndexEditorComponents from "./index-editor/components.react";
import DesignDocInfoComponents from './designdocinfo/components.react';
import RightAllDocsHeader from './components/header-docs-right';

export const TabsSidebarHeader = ({
  hideQueryOptions,
  hideHeaderBar,
  database,
  dbName,
  dropDownLinks,
  showIncludeAllDocs,
  docURL,
  endpoint
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
          <div id="react-headerbar" className="flex-body">
              {hideHeaderBar ? null : <ReactHeader.BulkDocumentHeaderController showIncludeAllDocs={showIncludeAllDocs} />}
          </div>
          <div id="right-header" className="flex-fill">
            <RightAllDocsHeader hideQueryOptions={hideQueryOptions} database={database} />
          </div>
          <ApiBarWrapper docURL={docURL} endpoint={endpoint} />
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

export const TabsSidebarContent = ({hideFooter, lowerContent, upperContent}) => {
  return (
    <div className="with-sidebar tabs-with-sidebar content-area">
      <aside id="sidebar-content" className="scrollable">
        <SidebarComponents.SidebarController />
      </aside>
      <section id="dashboard-content" className="flex-layout flex-col" style={{left: "330px"}}>
        <div id="dashboard-upper-content">
          {upperContent}
        </div>
        <div id="dashboard-lower-content" className="flex-body">
          {lowerContent}
        </div>
        <div id="footer">
          {hideFooter ? null : <ReactPagination.Footer />}
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

export const DocsTabsSidebarLayout = ({database, designDocs, showIncludeAllDocs, docURL, endpoint, dbName, dropDownLinks}) => {
  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        showIncludeAllDocs={showIncludeAllDocs}
        docURL={docURL}
        endpoint={endpoint}
        dbName={dbName}
        dropDownLinks={dropDownLinks}
        database={database}
      />
      <TabsSidebarContent
        lowerContent={<IndexResultsComponents.List designDocs={designDocs} />}
      />
    </div>
  );
};

export const ChangesSidebarLayout = ({docURL, database, endpoint, dbName, dropDownLinks}) => {
  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        hideHeaderBar={true}
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
        hideHeaderBar={true}
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
