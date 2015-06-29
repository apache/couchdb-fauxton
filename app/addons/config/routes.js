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

define([
  'app',
  'api',
  'addons/config/resources',
  'addons/config/views',
  'addons/cors/components.react',
  'addons/cors/actions',
  'addons/config/config.react',
  'addons/config/config.actions',
],

function (app, FauxtonAPI, Config, Views, CORSComponents, CORSActions, ConfigComponents, ConfigActions) {

  var ConfigChooseNodeRouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'one_pane',

    roles: ['_admin'],

    routes: {
      '_config': 'chooseNode'
    },

    crumbs: [
      { name: 'Config', link: '_config' }
    ],

    apiUrl: function () {
      return [this.memberships.url(), FauxtonAPI.constants.DOC_URLS.GENERAL];
    },

    initialize: function () {
      this.memberships = new Config.Memberships();
    },

    chooseNode: function () {
      ConfigActions.fetchNodes();

      this.newSection = this.setComponent(
        '#dashboard-content',
        ConfigComponents.ConfigController
      );
    }
  });

  var ConfigPerNodeRouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'with_tabs_sidebar_scroll',

    roles: ['_admin'],
    selectedHeader: 'Config',

    crumbs: [
      { name: 'Config', link: '_config' }
    ],

    apiUrl: function () {
      return [this.configs.url(), this.configs.documentation];
    },

    routes: {
      '_config/:node': 'configForNode',
      '_config/:node/cors': 'configCorsForNode'
    },

    establish: function () {
      return [this.configs.fetch()];
    },

    initialize: function (_a, _b, options) {
      var node = options[0];

      this.configs = new Config.Collection({node: node});

      this.sidebar = this.setView('#sidebar-content', new Views.Tabs({
        sidebarItems: [
          {
            title: node
          },
          {
            title: 'Main config',
            typeSelect: 'main',
            link: '_config/' + node
          },
          {
            title: 'CORS',
            typeSelect: 'cors',
            link: '_config/' + node + '/cors'
          },
          {
            title: 'Choose other node',
            typeSelect: 'othernode',
            link: '_config'
          },
        ]
      }));
    },

    configForNode: function () {
      this.newSection = this.setView('#right-header', new Views.ConfigHeader({ collection: this.configs }));
      this.setView('#dashboard-content', new Views.Table({ collection: this.configs }));
      this.sidebar.setSelectedTab('main');
    },

    configCorsForNode: function (node) {
      this.removeView('#right-header');
      this.newSection = this.setComponent('#dashboard-content', CORSComponents.CORSController);
      CORSActions.fetchAndEditCors(node);
      this.sidebar.setSelectedTab('cors');
    }
  });

  Config.RouteObjects = [ConfigPerNodeRouteObject, ConfigChooseNodeRouteObject];

  return Config;
});
