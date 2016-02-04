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
  '../../core/api'
],

function (app, FauxtonAPI) {

  var Setup = FauxtonAPI.addon();


  Setup.Model = Backbone.Model.extend({

    documentation: app.host + '/_utils/docs',

    url: function () {
      return '/_cluster_setup';
    },

    validate: function (attrs) {
      if (!attrs.username) {
        return 'Admin name is required';
      }

      if (!attrs.password) {
        return 'Admin password is required';
      }

      if (attrs.bind_address && attrs.bind_address === '127.0.0.1') {
        return 'Bind address can not be 127.0.0.1';
      }

      if (attrs.port && _.isNaN(+attrs.port)) {
        return 'Bind port must be a number';
      }
    }

  });

  return Setup;
});
