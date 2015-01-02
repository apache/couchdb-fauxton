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
  "addons/cors/resources"
],


function (app, FauxtonAPI, CORS) {
  var Views= {};
  
  Views.CORSMain = FauxtonAPI.View.extend({
    className: 'cors-page',
    template: 'addons/cors/templates/cors',
    events: {
      'submit form#corsForm': 'submit'
    },
    establish: function(){
      return [this.model.fetch()];
    },
    submit: function(e){
      e.preventDefault();

      if ($('#corsForm .js-enable-cors').is(':checked')) {
        var enableOption = new CORS.ConfigModel({
          section: 'httpd',
          attribute: 'enable_cors',
          value: 'true'
        });
        
        var enableCreds = new CORS.ConfigModel({
          section: 'cors',
          attribute: 'credentials',
          value: 'true'
        });

        enableOption.save().then(function (response) {
          var notification = FauxtonAPI.addNotification({
            msg: 'Your settings have been saved.',
            type: 'success',
            clear: true
          });
        },
        function (response, errorCode, errorMsg) {
          var notification = FauxtonAPI.addNotification({
            msg: 'Sorry! There was an error. Code ' + errorCode  + '.',
            type: 'error',
            clear: true
          });
        });
          
        enableCreds.save();
      } else {
        var disableOption = new CORS.ConfigModel({
          section: 'httpd',
          attribute: 'enable_cors',
          value: 'false'
        });
        
        var disableCreds = new CORS.ConfigModel({
          section: 'cors',
          attribute: 'credentials',
          value: 'false'
        });
        
        disableOption.save().then(function (response) {
          var notification = FauxtonAPI.addNotification({
            msg: 'Your settings have been saved.',
            type: 'success',
            clear: true
          });
        },
        function (response, errorCode, errorMsg) {
          var notification = FauxtonAPI.addNotification({
            msg: 'Sorry! There was an error. Code ' + errorCode  + '.',
            type: 'error',
            clear: true
          });
        });
          
        disableCreds.save();
      }
    }
  });
  
  CORS.Views = Views;

  return CORS;
});
