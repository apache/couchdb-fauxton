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
  '../../app',
  '../../core/api',
  './components.react'
],

function (app, FauxtonAPI, DocumentationComponents) {

  var DocumentationRouteObject = FauxtonAPI.RouteObject.extend({
    selectedHeader: 'Documentation',
    layout: 'one_pane',
    disableLoader: false,
    routes: {
      'documentation': 'documentation'
    },
    crumbs: [
      {'name': 'Documentation', 'link': '/documentation'}
    ],
    roles: ['fx_loggedIn'],
    documentation: function () {
      this.setComponent('#dashboard-content', DocumentationComponents.DocumentationController);
    }
  });
  DocumentationRouteObject.RouteObjects = [DocumentationRouteObject];

  return DocumentationRouteObject;
});
