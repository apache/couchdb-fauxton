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

import app from '../../app';
import React from 'react';
import FauxtonAPI from "../../core/api";
import {OnePane, OnePaneHeader, OnePaneContent, OnePaneFooter} from '../components/layouts';
import Components from "./components";
const {RightDatabasesHeader, DatabasesController, DatabasePagination} = Components;

export const Layout = () => {
  return (
    <OnePane>
      <OnePaneHeader
        crumbs={[{"name": "Databases"}]}
        endpoint={FauxtonAPI.urls('allDBs', 'apiurl')}
        docURL={FauxtonAPI.constants.DOC_URLS.ALL_DBS}
      >
        <RightDatabasesHeader partitionedDbHelpText={app.i18n.en_US['create-db-partitioned-help']}/>
      </OnePaneHeader>
      <OnePaneContent>
        <DatabasesController />
      </OnePaneContent>
      <OnePaneFooter>
        <DatabasePagination />
      </OnePaneFooter>
    </OnePane>
  );
};
export default Layout;
