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
import {TabsSidebarHeader} from '../documents/layouts';
import PermissionsContainer from './container/PermissionsContainer';
import SidebarControllerContainer from "../documents/sidebar/SidebarControllerContainer";
import {SidebarItemSelection} from '../documents/sidebar/helpers';

export const PermissionsLayout = ({docURL, database, endpoint, dbName, dropDownLinks, partitionKey}) => {
  const selectedNavItem = new SidebarItemSelection('permissions');
  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        hideQueryOptions={true}
        hideJumpToDoc={true}
        docURL={docURL}
        endpoint={endpoint}
        dbName={dbName}
        dropDownLinks={dropDownLinks}
        database={database}
      />
      <div className="with-sidebar tabs-with-sidebar content-area">
        <aside id="sidebar-content" className="scrollable">
          <SidebarControllerContainer selectedNavItem={selectedNavItem} selectedPartitionKey={partitionKey}/>
        </aside>
        <section id="dashboard-content" className="flex-layout flex-col">
          <PermissionsContainer url={endpoint} />
        </section>
      </div>
    </div>
  );
};

export default PermissionsLayout;
