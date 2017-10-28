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
import app from "../../app";
import FauxtonAPI from "../../core/api";
import Setup from "./resources";
import SetupComponents from "./setup";
import SetupActions from "./setup.actions";
import ClusterActions from "../cluster/cluster.actions";
import {OnePaneSimpleLayout} from '../components/layouts';

var RouteObject = FauxtonAPI.RouteObject.extend({
  roles: ['_admin'],
  selectedHeader: 'Setup',

  routes: {
    'setup': 'setupInitView',
    'setup/finish': 'finishView',
    'setup/singlenode': 'setupSingleNode',
    'setup/multinode': 'setupMultiNode'
  },

  setupInitView: function () {
    const setup = new Setup.Model();
    ClusterActions.fetchNodes();
    SetupActions.getClusterStateFromCouch();
    return <OnePaneSimpleLayout
      component={<SetupComponents.SetupFirstStepController/>}
      endpoint={setup.url('apiurl')}
      docURL={setup.documentation}
      crumbs={[
        { 'name': 'Setup ' + app.i18n.en_US['couchdb-productname'] }
      ]}
    />;
  },

  setupSingleNode: function () {
    const setup = new Setup.Model();
    ClusterActions.fetchNodes();
    return <OnePaneSimpleLayout
      component={<SetupComponents.SetupSingleNodeController/>}
      endpoint={setup.url('apiurl')}
      docURL={setup.documentation}
      crumbs={[
        { 'name': 'Setup ' + app.i18n.en_US['couchdb-productname'] }
      ]}
    />;
  },

  setupMultiNode: function () {
    const setup = new Setup.Model();
    ClusterActions.fetchNodes();
    return <OnePaneSimpleLayout
      component={<SetupComponents.SetupMultipleNodesController/>}
      endpoint={setup.url('apiurl')}
      docURL={setup.documentation}
      crumbs={[
        { 'name': 'Setup ' + app.i18n.en_US['couchdb-productname'] }
      ]}
    />;
  },

  finishView: function () {
    const setup = new Setup.Model();
    SetupActions.getClusterStateFromCouch();
    return <OnePaneSimpleLayout
      component={<SetupComponents.ClusterConfiguredScreen/>}
      endpoint={setup.url('apiurl')}
      docURL={setup.documentation}
      crumbs={[
        { 'name': 'Setup ' + app.i18n.en_US['couchdb-productname'] }
      ]}
    />;
  }
});


Setup.RouteObjects = [RouteObject];

export default Setup;
