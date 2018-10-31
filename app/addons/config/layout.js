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
import AddOptionButtonContainer from './components/AddOptionButtonContainer';
import ConfigTableContainer from './components/ConfigTableContainer';
import ConfigTabs from './components/ConfigTabs';
import CORSComponents from '../cors/components';
import { Breadcrumbs } from '../components/header-breadcrumbs';
import NotificationCenterButton from '../fauxton/notifications/components/NotificationCenterButton';
import { ApiBarWrapper } from '../components/layouts';

export const ConfigHeader = ({ node, crumbs, docURL, endpoint }) => {
  return (
    <header className="two-panel-header">
      <div className="flex-layout flex-row">
        <div id='breadcrumbs' className="faux__config-breadcrumbs">
          <Breadcrumbs crumbs={crumbs} />
        </div>
        <div className="right-header-wrapper flex-layout flex-row flex-body">
          <div id="react-headerbar" className="flex-body"> </div>
          <div id="right-header" className="flex-fill">
            <AddOptionButtonContainer node={node} />
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

export const ConfigLayout = ({ showCors, docURL, node, endpoint, crumbs }) => {
  const sidebarItems = [
    {
      title: 'Main config',
      link: '_config/' + node
    },
    {
      title: 'CORS',
      link: '_config/' + node + '/cors'
    }
  ];
  const selectedTab = showCors ? 'CORS' : 'Main config';
  const content = showCors ? <CORSComponents.CORSContainer node={node} url={endpoint} /> : <ConfigTableContainer node={node} />;
  return (
    <div id="dashboard" className="with-sidebar">
      <ConfigHeader
        docURL={docURL}
        endpoint={endpoint}
        node={node}
        crumbs={crumbs}
      />
      <div className="with-sidebar tabs-with-sidebar content-area">
        <aside id="sidebar-content" className="scrollable">
          <ConfigTabs
            sidebarItems={sidebarItems}
            selectedTab={selectedTab}
          />
        </aside>
        <section id="dashboard-content" className="flex-layout flex-col">
          <div id="dashboard-upper-content"></div>
          <div id="dashboard-lower-content" className="flex-body">
            {content}
          </div>
          <div id="footer"></div>
        </section>
      </div>
    </div>
  );
};

export default ConfigLayout;
