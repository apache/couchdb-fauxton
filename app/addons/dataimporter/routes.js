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
  'addons/dataimporter/components.react',
  'addons/dataimporter/actions'
],

function (app, FauxtonAPI, DataImporterComponents, DataImporterActions) {

  //state is in case you move away from the page and return
  var firstTimeHere = true;

  var DataImporterRouteObject = FauxtonAPI.RouteObject.extend({
    selectedHeader: 'Import Data',
    disableLoader: true,
    layout : 'one_pane',
    crumbs: [
      {'name': 'Import Data', 'link': '/dataimporter'}
    ],

    routes: {
      'dataimporter': 'dataImporter'
    },

    roles: ['fx_loggedIn'],

    dataImporter: function () {
      this.newSection = this.setComponent('#dashboard-content', DataImporterComponents.DataImporterController);
      DataImporterActions.dataImporterInit(firstTimeHere);
      firstTimeHere = false;
    },
  });

  DataImporterRouteObject.RouteObjects = [DataImporterRouteObject];

  return DataImporterRouteObject;
});
