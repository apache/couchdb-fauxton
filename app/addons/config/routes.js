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
  'addons/cors/views'
],

function(app, FauxtonAPI, Config, Views, CORS) {

  var ConfigRouteObject = FauxtonAPI.RouteObject.extend({
    layout: 'with_tabs_sidebar',

    initialize: function () {
      this.configs = new Config.Collection();
      this.cors = new CORS.config();
      
      this.sidebar = this.setView("#sidebar-content", new Views.Tabs({
        sidebarItems: [
          {
            title: 'Main config',
            typeSelect: 'main',
            link: '_config'
          },
          {
            title: 'CORS',
            typeSelect: 'cors',
            link: '_config/cors'
          }
        ]
      }));
    },

    roles: ['_admin'],
    selectedHeader: 'Config',

    crumbs: [
      { name: 'Config', link: '_config' }
    ],

    apiUrl: function () {
      return [this.configs.url(), this.configs.documentation];
    },

    routes: {
      '_config': 'config',
      '_config/cors':'configCORS'
    },

    config: function () {
      this.newSection = this.setView('#right-header', new Views.ConfigHeader({ collection: this.configs }));
      this.setView('#dashboard-content', new Views.Table({ collection: this.configs }));
      this.sidebar.setSelectedTab("main");
    },
    
    configCORS: function() {
      this.removeView('#right-header');
      this.newSection = this.setView('#dashboard-content', new CORS.Views.CORSMain({ model: this.cors }));
      this.sidebar.setSelectedTab("cors");
    },

    establish: function () {
      return [this.configs.fetch()];
    }
  });

  Config.RouteObjects = [ConfigRouteObject];

  return Config;
});
