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
import Views from "./views";
import CORSComponents from "../cors/components.react";
import CORSActions from "../cors/actions";
import ClusterActions from "../cluster/cluster.actions";


var ConfigDisabledRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'one_pane',

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
  layout: 'with_tabs_sidebar',

  roles: ['_admin'],
  selectedHeader: 'Config',

  crumbs: [
    { name: 'Config' }
  ],

  apiUrl: function () {
    return [this.configs.url(), this.configs.documentation];
  },

  routes: {
    '_config/:node': 'configForNode',
    '_config/:node/cors': 'configCorsForNode'
  },

  initialize: function (_a, _b, options) {
    var node = options[0];

    this.configs = new Config.Collection(null, {node: node});

    this.sidebar = this.setView('#sidebar-content', new Views.Tabs({
      sidebarItems: [
        {
          title: 'Main config',
          typeSelect: 'main',
          link: '_config/' + node
        },
        {
          title: 'CORS',
          typeSelect: 'cors',
          link: '_config/' + node + '/cors'
        }
      ]
    }));
  },

  configForNode: function () {
    this.newSection = this.setView('#right-header', new Views.ConfigHeader({ collection: this.configs }));
    this.setView('#dashboard-lower-content', new Views.Table({ collection: this.configs }));
    this.sidebar.setSelectedTab('main');
  },

  configCorsForNode: function (node) {
    this.removeView('#right-header');
    this.newSection = this.setComponent('#dashboard-content', CORSComponents.CORSController);
    CORSActions.fetchAndEditCors(node);
    this.sidebar.setSelectedTab('cors');
  }
});

Config.RouteObjects = [ConfigPerNodeRouteObject, ConfigDisabledRouteObject];

export default Config;
