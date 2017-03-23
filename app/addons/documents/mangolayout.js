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
import app from "../../app";
import ReactPagination from "./pagination/pagination.react";
import ReactHeader from "./header/header.react";
import {Breadcrumbs} from '../components/header-breadcrumbs';
import {NotificationCenterButton} from '../fauxton/notifications/notifications.react';
import {ApiBarWrapper} from '../components/layouts';
import MangoComponents from "./mango/mango.components.react";
import IndexResultsComponents from "./index-results/index-results.components.react";


export const RightHeader = ({showIncludeAllDocs, docURL, endpoint}) => {
  return (
    <div className="right-header-wrapper flex-layout flex-row flex-body">
      <div id="react-headerbar" className="flex-body">
        <ReactHeader.BulkDocumentHeaderController showIncludeAllDocs={showIncludeAllDocs} />
      </div>
      <div id="right-header" className="flex-body">
      </div>
      <ApiBarWrapper docURL={docURL} endpoint={endpoint} />
      <div id='notification-center-btn'>
        <NotificationCenterButton />
      </div>
    </div>
  );
};

export const MangoFooter = () => {
  return (
    <div id="footer">
        <ReactPagination.Footer />
    </div>
  );
};

export const MangoHeader = ({showIncludeAllDocs, crumbs, docURL, endpoint}) => {
  return (
    <div className="header-wrapper flex-layout flex-row">
      <div className='flex-body faux__breadcrumbs-mango-header'>
        <Breadcrumbs crumbs={crumbs}/>
      </div>
      <RightHeader
        showIncludeAllDocs={showIncludeAllDocs}
        docURL={docURL}
        endpoint={endpoint}
      />
    </div>
  );
};

MangoHeader.defaultProps = {
  crumbs: []
};

const MangoContent = ({edit, designDocs}) => {
  const leftContent = edit ?
    <MangoComponents.MangoIndexEditorController
      description={app.i18n.en_US['mango-descripton-index-editor']}
    /> :
    <MangoComponents.MangoQueryEditorController
      description={app.i18n.en_US['mango-descripton']}
      editorTitle={app.i18n.en_US['mango-title-editor']}
      additionalIndexesText={app.i18n.en_US['mango-additional-indexes-heading']}
    />;

  return (
    <div id="two-pane-content" className="flex-layout flex-row flex-body">
      <div id="left-content" className="flex-body">
          {leftContent}
      </div>
      <div id="right-content" className="flex-body flex-layout flex-col">
        <div id="dashboard-lower-content" className="flex-body">
          <IndexResultsComponents.List designDocs={designDocs} />
        </div>
        <MangoFooter  />
      </div>
    </div>
  );
};


export const MangoLayout = ({edit, showIncludeAllDocs, docURL, endpoint, crumbs, designDocs}) => {
  return (
    <div id="dashboard" className="two-pane flex-layout flex-col">
      <MangoHeader
        showIncludeAllDocs={showIncludeAllDocs}
        docURL={docURL}
        endpoint={endpoint}
        crumbs={crumbs}
      />
    <MangoContent edit={edit} designDocs={designDocs}/>
    </div>
  );
};
