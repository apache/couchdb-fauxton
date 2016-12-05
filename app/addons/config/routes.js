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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import Config from "./resources";
import CORSComponents from "../cors/components.react";
import CORSActions from "../cors/actions";
import ClusterActions from "../cluster/cluster.actions";
import ConfigComponents from "./components.react";
import ConfigActions from "./actions";
import Layout from './layout';


var ConfigDisabledRouteObject = FauxtonAPI.RouteObject.extend({

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


var ConfigPerNodeRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'empty',

  roles: ['_admin'],
  selectedHeader: 'Config',

  apiUrl: function () {
    return [this.configs.url(), this.configs.documentation];
  },

  routes: {
    '_config/:node': 'configForNode',
    '_config/:node/cors': 'configCorsForNode'
  },

  initialize: function (_a, _b, options) {
    var node = options[0];

    this.configs = new Config.ConfigModel({ node: node });
  },

  configForNode: function (node) {
    ConfigActions.fetchAndEditConfig(node);
    return <Layout
      node={node}
      docURL={this.configs.documentation}
      endpoint={this.configs.url()}
      crumbs={[{ name: 'Config' }]}
      showCors={false}
    />;
  },

  configCorsForNode: function (node) {
    CORSActions.fetchAndEditCors(node);
    return <Layout
      node={node}
      docURL={this.configs.documentation}
      endpoint={this.configs.url()}
      crumbs={[{ name: 'Config' }]}
      showCors={true}
    />;
  }
});

Config.RouteObjects = [ConfigPerNodeRouteObject, ConfigDisabledRouteObject];

export default Config;
