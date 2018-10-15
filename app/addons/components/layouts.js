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

import PropTypes from 'prop-types';

import React from 'react';
import ReactDOM from 'react-dom';
import NotificationCenterButton from '../fauxton/notifications/components/NotificationCenterButton';
import {JSONLink, DocLink} from './components/apibar';
import {Breadcrumbs} from './header-breadcrumbs';
import Helpers from '../../helpers';

export const ApiBarWrapper = ({docURL, endpoint}) => {
  return (
    <div className='faux__jsondoc-wrapper'>
      <JSONLink
        endpoint={endpoint}
      />
      <DocLink
        docURL={docURL}
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

export const OnePaneHeader = ({showApiUrl, docURL, endpoint, crumbs, children}) => {
  let rightHeaderClass = "right-header-flex";
  if (Helpers.isIE1X()) {
    rightHeaderClass += " " + rightHeaderClass + "--ie1X";
  }
  return (
    <header>
      <div className='flex-layout flex-row'>
        <div id='breadcrumbs' className='flex-body'>
          <Breadcrumbs crumbs={crumbs}/>
        </div>
        <div id='right-header'>
          <div className={rightHeaderClass}>
            {children}
          </div>
        </div>
        {showApiUrl ? <ApiBarWrapper docURL={docURL} endpoint={endpoint} /> : null}
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
  docURL: PropTypes.string,
  endpoint: PropTypes.string,
  crumbs: PropTypes.array
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

export const OnePaneSimpleLayout = ({component, docURL, endpoint, crumbs}) => {
  return (
    <OnePane>
      <OnePaneHeader
        crumbs={crumbs}
        endpoint={endpoint}
        docURL={docURL}
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

export const DocEditorLayout = ({component, docURL, endpoint, crumbs}) => {
  return (
    <div id="dashboard" className="one-pane doc-editor-page">
      <OnePaneHeader
        crumbs={crumbs}
        endpoint={endpoint}
        docURL={docURL}
      >
      </OnePaneHeader>
      <DocEditorContent>
        {component}
      </DocEditorContent>
    </div>
  );
};
