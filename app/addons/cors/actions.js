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
  '../../core/api',
  './actiontypes',
  './resources'
  ], function (FauxtonAPI, ActionTypes, Resources) {
    return {
      fetchAndEditCors: function (node) {
        var cors = new Resources.Config({node: node});
        var httpd = new Resources.Httpd({node: node});

        FauxtonAPI.when([cors.fetch(), httpd.fetch()]).then(function () {
          this.editCors({
            origins: cors.get('origins'),
            isEnabled: httpd.corsEnabled(),
            node: node
          });
        }.bind(this));
      },

      editCors: function (options) {
        FauxtonAPI.dispatch({
          type: ActionTypes.EDIT_CORS,
          options: options
        });
      },

      toggleEnableCors: function () {
        FauxtonAPI.dispatch({
          type: ActionTypes.TOGGLE_ENABLE_CORS
        });
      },

      addOrigin: function (origin) {
        FauxtonAPI.dispatch({
          type: ActionTypes.CORS_ADD_ORIGIN,
          origin: origin
        });
      },

      originChange: function (isAllOrigins) {
        FauxtonAPI.dispatch({
          type: ActionTypes.CORS_IS_ALL_ORIGINS,
          isAllOrigins: isAllOrigins
        });
      },

      deleteOrigin: function (origin) {
        FauxtonAPI.dispatch({
          type: ActionTypes.CORS_DELETE_ORIGIN,
          origin: origin
        });
      },

      updateOrigin: function (updatedOrigin, originalOrigin) {
        FauxtonAPI.dispatch({
          type: ActionTypes.CORS_UPDATE_ORIGIN,
          updatedOrigin: updatedOrigin,
          originalOrigin: originalOrigin
        });
      },

      methodChange: function (httpMethod) {
        FauxtonAPI.dispatch({
          type: ActionTypes.CORS_METHOD_CHANGE,
          httpMethod: httpMethod
        });
      },

      saveEnableCorsToHttpd: function (enableCors, node) {
        var enableOption = new Resources.ConfigModel({
          section: 'httpd',
          attribute: 'enable_cors',
          value: enableCors.toString(),
          node: node
        });

        return enableOption.save();
      },

      saveCorsOrigins: function (origins, node) {
        var allowOrigins = new Resources.ConfigModel({
          section: 'cors',
          attribute: 'origins',
          value: origins,
          node: node
        });

        return allowOrigins.save();
      },

      saveCorsCredentials: function (node) {
        var allowCredentials = new Resources.ConfigModel({
          section: 'cors',
          attribute: 'credentials',
          value: 'true',
          node: node
        });

        return allowCredentials.save();
      },

      saveCorsHeaders: function (node) {
        var corsHeaders = new Resources.ConfigModel({
          section: 'cors',
          attribute: 'headers',
          value: 'accept, authorization, content-type, origin, referer',
          node: node
        });

        return corsHeaders.save();
      },

      saveCorsMethods: function (node) {
        var corsMethods = new Resources.ConfigModel({
          section: 'cors',
          attribute: 'methods',
          value: 'GET, PUT, POST, HEAD, DELETE',
          node: node
        });

        return corsMethods.save();
      },

      sanitizeOrigins: function (origins) {
        if (_.isEmpty(origins)) {
          return '';
        }

        return origins.join(',');
      },

      toggleLoadingBarsToEnabled: function (state) {
        FauxtonAPI.dispatch({
          type: ActionTypes.CORS_SET_IS_LOADING,
          isLoading: state
        });
      },

      saveCors: function (options) {
        this.toggleLoadingBarsToEnabled(true);

        var promises = [];
        promises.push(this.saveEnableCorsToHttpd(options.enableCors, options.node));

        if (options.enableCors) {
          promises.push(this.saveCorsOrigins(this.sanitizeOrigins(options.origins), options.node));
          promises.push(this.saveCorsCredentials(options.node));
          promises.push(this.saveCorsHeaders(options.node));
          promises.push(this.saveCorsMethods(options.node));
        }

        FauxtonAPI.when(promises).then(function () {
          FauxtonAPI.addNotification({
            msg: 'Cors settings updated',
            type: 'success',
            clear: true
          });

          this.toggleLoadingBarsToEnabled(false);

        }.bind(this), function () {
          FauxtonAPI.addNotification({
            msg: 'Error! Could not save your CORS settings. Please try again.',
            type: 'error',
            clear: true
          });
          this.toggleLoadingBarsToEnabled(false);
        }.bind(this));
      }
    };
  });
