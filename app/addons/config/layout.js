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
import FauxtonAPI from "../../core/api";
import {TabsSidebarHeader} from '../documents/layouts';
import ConfigComponents from "./components.react";
import CORSComponents from "../cors/components.react";
import {Breadcrumbs} from '../components/header-breadcrumbs';
import {NotificationCenterButton} from '../fauxton/notifications/notifications.react';
import {ApiBarWrapper} from '../components/layouts';

// const sidebarItems = [
//   {
//     title: 'Main config',
//     typeSelect: 'main',
//     link: '_config/' + node
//   },
//   {
//     title: 'CORS',
//     typeSelect: 'cors',
//     link: '_config/' + node + '/cors'
//   }
// ];

export const ConfigHeader = ({node, crumbs, docURL, endpoint}) => {
  return (
    <header className="two-panel-header">
      <div className="flex-layout flex-row">
        <div id='breadcrumbs' className="faux__config-breadcrumbs">
          <Breadcrumbs crumbs={crumbs}/>
        </div>
        <div className="right-header-wrapper flex-layout flex-row flex-body">
          <div id="react-headerbar" className="flex-body"> </div>
          <div id="right-header" className="flex-fill">
            <ConfigComponents.AddOptionController node={node} />
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

export const ConfigLayout = ({showCors, docURL, node, endpoint, crumbs}) => {
  const content = showCors ? <CORSComponents.CORSController/> : <ConfigComponents.ConfigTableController node={node} />;
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
