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
import ReactDOM from 'react-dom';
import {NotificationCenterButton} from "../fauxton/notifications/notifications.react";
import {ApiBarController} from './react-components.react';
import {Breadcrumbs} from './header-breadcrumbs';
import ComponentActions from "./actions";

const ApiBarWrapper = ({docURL, endpoint}) => {
  //TODO once all modules are using this remove actions and make them props
  ComponentActions.updateAPIBar({
    buttonVisible: true,
    contentVisible: false,
    endpoint,
    docURL
  });
  return (
    <div id="api-navbar">
      <ApiBarController
        buttonVisible={true}
        contentVisible={false}
      />
  </div>
  );
};

const CrumbsWrapper = ({crumbs}) => {
  if (!crumbs || crumbs.length === 0) {
    return null;
  }

  return (
    <div id="breadcrumbs" className="flex-body">
      <Breadcrumbs crumbs={crumbs}/>
    </div>
  );
};

export const OnePane = ({children}) => {
  return (
    <div id="dashboard" className="one-pane ">
      {children}
    </div>
  );
};

export const OnePaneHeader = ({showApiUrl, docURL, endpoint, crumbs, children}) => {
  return (
    <header>
      <div className="flex-layout flex-row">
        <CrumbsWrapper crumbs={crumbs}/>
        <div id="right-header">
          {children}
        </div>
        {showApiUrl ? <ApiBarWrapper docURL={docURL} endpoint={endpoint} /> : null}
        <div id="notification-center-btn">
          <NotificationCenterButton />
        </div>
      </div>
    </header>
  );
};

OnePaneHeader.defaultProps = {
  showApiUrl: true
};

OnePaneHeader.propTypes = {
  docURL: React.PropTypes.string.isRequired,
  endpoint: React.PropTypes.string.isRequired,
};

export const OnePaneContent = ({children}) => {
  return (
    <div className="content-area container-fluid">
      <div id="tabs"></div>
      <div id="dashboard-content" className="scrollable">
        {children}
      </div>
      <div id="footer"></div>
    </div>
  );
};
