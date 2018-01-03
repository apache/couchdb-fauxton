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
import {TabElementWrapper, TabElement} from '../components/components/tabelement';
import FauxtonAPI from "../../core/api";

const {
  CreateAdminForm,
  ChangePasswordForm
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

const Tabs = ({changePassword}) => {
  return (
    <TabElementWrapper>
      <TabElement
        key={1}
        selected={changePassword}
        text={"Change Password"}
        onChange={() => {
          FauxtonAPI.navigate('#changePassword');
        }}
      />
      <TabElement
        key={2}
        selected={!changePassword}
        text={"Create Server Admin"}
        onChange={() => {
          FauxtonAPI.navigate('#addAdmin');
        }}
      />
    </TabElementWrapper>
  );
};

export const AdminLayout = ({crumbs, changePassword}) => {
  let content = changePassword ? <ChangePasswordForm /> : <CreateAdminForm loginAfter={false} />;
  return (
    <OnePane>
      <OnePaneHeader crumbs={crumbs}/>
      <OnePaneContent>
        <div className="template-content flex-body flex-layout flex-col">
          <Tabs changePassword={changePassword} />
          <div id="dashboard-conten1t" className="flex-layout flex-col">
            {content}
          </div>
        </div>
      </OnePaneContent>
    </OnePane>

  );

};

export default AuthLayout;
