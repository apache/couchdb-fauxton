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
  "app",
  "api",
  "addons/cors/resources",
  "addons/cors/components.react",
  "addons/cors/actions"
],


function (app, FauxtonAPI, CORS, Components, Actions) {
  var Views= {};

  Views.CORSWrapper = FauxtonAPI.View.extend({
    className: 'list',
    initialize: function (options) {
      this.cors = options.cors;
      this.httpd = options.httpd;
    },

    establish: function () {
      return [this.cors.fetch(), this.httpd.fetch()];
    },

    afterRender: function () {
      Actions.editCors({
        origins: this.cors.getOrigins(),
        isEnabled: this.httpd.corsEnabled()
      });
      Actions.showDisableCorsPrompt(false);
      Actions.showSwitchDomainsWarning(false);
      Components.renderCORS(this.el);
    },

    cleanup: function () {
      Components.removeCORS(this.el);
    }

  });

  CORS.Views = Views;

  return CORS;
});
