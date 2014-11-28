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
  'addons/cors/views'
],

function (app, FauxtonAPI, CORS) {

  var CORSRouteObject = FauxtonAPI.RouteObject.extend({

    layout: 'one_pane',
    
    routes: {
      "cors": "showCORS",
      "_cors": "showCORS"
    },
    
    selectedHeader: 'CORS',
    
    crumbs: [
      {'name': 'CORS', 'link': 'cors'}
    ],

    roles: ['_admin'],
    
    initialize: function () {
      this.cors = new CORS.config();
    },
    
    showCORS: function () {
      this.setView("#dashboard-content", new CORS.Views.CORSMain({
        model: this.cors
      }));
    },
  });

  CORS.RouteObjects = [CORSRouteObject];
  return CORS;
});
