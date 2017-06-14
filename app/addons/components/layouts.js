// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import React from 'react';
import ReactDOM from 'react-dom';
import {NotificationCenterButton} from '../fauxton/notifications/notifications';
import {JSONLink, DocLink} from './components/apibar';
import {Breadcrumbs} from './header-breadcrumbs';

export const ApiBarWrapper = ({docUrl, endpoint}) => {
  return (
    <div className='faux__jsondoc-wrapper'>
      <JSONLink
        endpoint={endpoint}
      />
    <DocLink
      docUrl={docUrl}
    />
  </div>
  );
};

export const OnePane = ({children}) => {
  return (
    <div id='dashboard' className='one-pane '>
      {children}
    </div>
  );
};

export const OnePaneHeader = ({showApiUrl, docUrl, endpoint, crumbs, children}) => {
  return (
    <header>
      <div className='flex-layout flex-row'>
        <div id='breadcrumbs' className='flex-body'>
          <Breadcrumbs crumbs={crumbs}/>
        </div>
        <div id='right-header'>
          <div className="right-header-flex">
            {children}
          </div>
        </div>
        {showApiUrl ? <ApiBarWrapper docUrl={docUrl} endpoint={endpoint} /> : null}
        <div id='notification-center-btn'>
          <NotificationCenterButton />
        </div>
      </div>
    </header>
  );
};

OnePaneHeader.defaultProps = {
  showApiUrl: true,
  crumbs: []
};

OnePaneHeader.propTypes = {
  docURL: React.PropTypes.string,
  endpoint: React.PropTypes.string,
  crumbs: React.PropTypes.array
};

export const OnePaneContent = ({children}) => {
  return (
    <div className='content-area container-fluid'>
      <div id='tabs'></div>
      <div id='dashboard-content' className='scrollable'>
        {children}
      </div>
    </div>
  );
};

export const OnePaneFooter = ({children}) => {
  return (
    <div className='faux__onepane-footer'>
      {children}
    </div>
  );
};

export const OnePaneSimpleLayout = ({component, docUrl, endpoint, crumbs}) => {
  return (
    <OnePane>
      <OnePaneHeader
        crumbs={crumbs}
        endpoint={endpoint}
        docUrl={docUrl}
      >
      </OnePaneHeader>
      <OnePaneContent>
        {component}
      </OnePaneContent>
      <OnePaneFooter>
      </OnePaneFooter>
    </OnePane>
  );
};

export const DocEditorContent = ({children}) => {
  return (
    <div id="dashboard-content">
      {children}
    </div>
  );
};

export const DocEditorLayout = ({component, docUrl, endpoint, crumbs}) => {
  return (
    <div id="dashboard" className="one-pane doc-editor-page">
        <OnePaneHeader
          crumbs={crumbs}
          endpoint={endpoint}
          docUrl={docUrl}
        >
        </OnePaneHeader>
      <DocEditorContent>
        {component}
      </DocEditorContent>
    </div>
  );
};
