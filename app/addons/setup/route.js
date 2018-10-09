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
import ClusterActions from "../cluster/actions";
import {OnePaneSimpleLayout} from '../components/layouts';

import ConfiguredScreenContainer from './container/ConfiguredSceenContainer';
import FirstStepContainer from './container/FirstStepContainer';
import SingleNodeContainer from './container/SingleNodeContainer';
import MultipleNodeContainer from './container/MultipleNodeContainer';

const SetupRouteObject = FauxtonAPI.RouteObject.extend({
  roles: ['_admin'],
  selectedHeader: 'Setup',

  routes: {
    'setup': 'setupInitView',
    'setup/finish': 'finishView',
    'setup/singlenode': 'setupSingleNode',
    'setup/multinode': 'setupMultiNode'
  },

  setupInitView: () => {
    const url = FauxtonAPI.urls('cluster_setup', 'apiurl');
    ClusterActions.fetchNodes();
    return <OnePaneSimpleLayout
      component={<FirstStepContainer />}
      endpoint={url}
      docURL={FauxtonAPI.constants.DOC_URLS.SETUP}
      crumbs={[
        {'name': 'Setup ' + app.i18n.en_US['couchdb-productname']}
      ]}
    />;
  },

  setupSingleNode: () => {
    const url = FauxtonAPI.urls('cluster_setup', 'apiurl');
    ClusterActions.fetchNodes();
    return <OnePaneSimpleLayout
      component={<SingleNodeContainer />}
      endpoint={url}
      docURL={FauxtonAPI.constants.DOC_URLS.SETUP}
      crumbs={[
        {'name': 'Setup ' + app.i18n.en_US['couchdb-productname']}
      ]}
    />;
  },

  setupMultiNode: () => {
    const url = FauxtonAPI.urls('cluster_setup', 'apiurl');
    ClusterActions.fetchNodes();
    return <OnePaneSimpleLayout
      component={<MultipleNodeContainer />}
      endpoint={url}
      docURL={FauxtonAPI.constants.DOC_URLS.SETUP}
      crumbs={[
        {'name': 'Setup ' + app.i18n.en_US['couchdb-productname']}
      ]}
    />;
  },

  finishView: () => {
    const url = FauxtonAPI.urls('cluster_setup', 'apiurl');
    return <OnePaneSimpleLayout
      component={<ConfiguredScreenContainer/>}
      endpoint={url}
      docURL={FauxtonAPI.constants.DOC_URLS.SETUP}
      crumbs={[
        {'name': 'Setup ' + app.i18n.en_US['couchdb-productname']}
      ]}
    />;
  }
});

const Setup = {
  RouteObjects: [SetupRouteObject]
};

export default Setup;
