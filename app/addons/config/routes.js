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
import FauxtonAPI from '../../core/api';
import ClusterActions from '../cluster/actions';
import * as ConfigAPI from './api';
import Layout from './layout';

const ConfigDisabledRouteObject = FauxtonAPI.RouteObject.extend({
  selectedHeader: 'Configuration',

  routes: {
    '_config': 'checkNodes',
  },

  crumbs: [
    { name: 'Config disabled' }
  ],

  checkNodes: function () {
    ClusterActions.navigateToNodeBasedOnNodeCount('/_config/');
  }
});


const ConfigPerNodeRouteObject = FauxtonAPI.RouteObject.extend({
  roles: ['_admin'],
  selectedHeader: 'Configuration',

  routes: {
    '_config/:node': 'configForNode',
    '_config/:node/cors': 'configCorsForNode'
  },

  initialize: function () {
  },

  configForNode: function (node) {
    return <Layout
      node={node}
      docURL={FauxtonAPI.constants.DOC_URLS.CONFIG}
      endpoint={ConfigAPI.configUrl(node)}
      crumbs={[{ name: 'Config' }]}
      showCors={false}
    />;
  },

  configCorsForNode: function (node) {
    return <Layout
      node={node}
      docURL={FauxtonAPI.constants.DOC_URLS.CONFIG}
      endpoint={ConfigAPI.configUrl(node)}
      crumbs={[{ name: 'Config' }]}
      showCors={true}
    />;
  }
});

const Config = FauxtonAPI.addon();
Config.RouteObjects = [ConfigPerNodeRouteObject, ConfigDisabledRouteObject];

export default Config;
