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
import {OnePane, OnePaneContent} from '../components/layouts';
import {Breadcrumbs} from '../components/header-breadcrumbs';
import Components from "./components";

const {
  CreateAdminForm,
  ChangePasswordForm,
  CreateAdminSidebar
} = Components;

export const OnePaneHeader = ({crumbs}) => {
  return (
    <header>
      <div className='flex-layout flex-row'>
        <div id='breadcrumbs' className='flex-body'>
          <Breadcrumbs crumbs={crumbs}/>
        </div>
      </div>
    </header>
  );
};

export const AuthLayout = ({crumbs, component}) => {
  return (
    <OnePane>
      <OnePaneHeader
        crumbs={crumbs}
      >
      </OnePaneHeader>
      <OnePaneContent>
        {component}
      </OnePaneContent>
    </OnePane>
  );
};

export const AdminLayout = ({crumbs, changePassword}) => {
  let content = changePassword ? <ChangePasswordForm /> : <CreateAdminForm loginAfter={false} />;
  return (
    <div id="dashboard" className="template-with-sidebar flex-layout flex-col">
      <OnePaneHeader
        crumbs={crumbs}
      >
      </OnePaneHeader>
      <div className="template-content flex-body flex-layout flex-row">
        <div id="sidebar-content">
          <CreateAdminSidebar />
        </div>
        <div id="dashboard-content" className="flex-body">
          {content}
        </div>
      </div>
    </div>

  );

};

export default AuthLayout;
