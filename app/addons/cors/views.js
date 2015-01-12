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
      'submit form#corsForm': 'submit',
      'click .js-enable-cors': 'corsClick',
      'click .js-restrict-origin-domains': 'restrictOrigins',
      'click .js-all-origin-domains': 'allOrigins'
    },
    
    initialize: function () {
      this.originDomainTable = this.setView('.origin-domains', new Views.OriginDomainTable({
        model: this.model
      }));
    },
    
    establish: function(){
      return [this.model.fetch()];
    },
    
    afterRender: function () {        
      var corsEnabled = this.$('.js-enable-cors').is(':checked');
      this.$('#collapsing-container').toggle(corsEnabled);
      this.setupOrigins();
    },
    
    corsClick: function (e) {
      var isChecked = this.$(e.target).prop('checked');
      this.$('#collapsing-container').toggle(isChecked);
      this.setupOrigins();
    },
    
    
    setupOrigins: function() {
      var storedOrigins = this.model.get('origins');
      if (storedOrigins && storedOrigins != '*') {
        this.restrictOrigins();
      } else {
        this.allOrigins();
      }
    },
    
    allOrigins: function() {
      this.$('.js-all-origin-domains').prop('checked', true);
      this.$('.js-restrict-origin-domains').prop('checked', false);
      this.$('#origin-domains-container').hide();
    },

    restrictOrigins: function() {
      this.$('.js-restrict-origin-domains').prop('checked', true);
      this.$('.js-all-origin-domains').prop('checked', false);
      this.$('#origin-domains-container').show();
    },
    
    formToJSON: function(formSelector){
      var formObject = $(formSelector).serializeArray(),
        formJSON={};
      _.map(formObject, function(field){
        formJSON[field.name]=field.value;
      });
      return formJSON;
    },
    
    submit: function(e){
      e.preventDefault();      
      var data = this.formToJSON(e.currentTarget);

      if (data.enable_cors === 'on') {

        // CORS checked, save data  
        if (data.restrict_origin_domains === 'on') {
          var storedOrigins = this.model.get('origins');
          var newDomain = $.trim(data.new_origin_domain);
	
          // if a new domain has been entered, check it's valid
          if (!_.isEmpty(newDomain) && !CORS.validateCORSDomain(newDomain)) {
            FauxtonAPI.addNotification({
              msg: 'Please enter a valid domain, starting with http/https and only containing the domain (not a subfolder).',
              type: 'error',
              clear: true
            });
            return;
          }
          
          // check that the user has entered at least one new origin domain
          if (storedOrigins && storedOrigins.length > 0 && storedOrigins !== '*') {
            this.originData = storedOrigins.concat(newDomain);
          } else {

            if (_.isEmpty(newDomain)) {
              FauxtonAPI.addNotification({
                msg: 'Please enter a new origin domain.',
                type: 'error',
                clear: true
              });
              this.$('.new-origin-domain').focus();
              return;
            }
            this.originData = data.new_origin_domain;
          }
          
        } else {
          this.originData = "*";
        }
        
          
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
        
        var allowOrigins = new CORS.ConfigModel({
          section: 'cors',
          attribute: 'origins',
          value: this.originData
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
        allowOrigins.save();
      
      } else {
          
        // Disable CORS
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
        
        var disableOrigins = new CORS.ConfigModel({
          section: 'cors',
          attribute: 'origins',
          value: ''
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
        disableOrigins.save();
      }
    }
  });
  
  Views.OriginDomainTable = FauxtonAPI.View.extend({
    template: 'addons/cors/templates/origin_domain_table',

    initialize: function () {
      // listen for any server-side changes to the object (i.e. saves/deletes). Only then, re-render the table
      this.listenTo(this.model, 'sync', this.render);
    },

    beforeRender: function () {
      var origins = this.model.get('origins');

      // if the stored origins are set to '*' or nothing's defined, show nothing
      if (_.isEmpty(origins) || origins === '*') {
        return;
      }
      this.showRows();
    },

    showRows: function () {
        var originsArray = this.model.get('origins').split(',');
      _.each(originsArray, function (url, index) {
        this.insertView('#origin-domain-table tbody', new Views.OriginDomainRow({
          model: this.model,
          index: index
        }));
      }, this);
    }
  });


  // this gets passed the entire model so it can manipulate it directly (add/update the row)
  Views.OriginDomainRow = FauxtonAPI.View.extend({
    template: 'addons/cors/templates/origin_domain_row',
    tagName: 'tr',

    events: {
      'click .js-edit': 'onEditDomain',
      'click .js-cancel-edit': 'onCancelEditDomain',
      'click .js-delete': 'onDeleteDomain',
      'click .js-save-domain': 'onSaveDomain'
    },

    serialize: function () {
      return {
        url: this.model.get('origins').split(',')[this.index]
      };
    },

    onEditDomain: function () {

      // show the editable field & save button
      this.$('.js-url').addClass('hide');
      this.$('.js-edit-domain').removeClass('hide');

      // change the edit icon to a cancel icon
      this.$('.js-edit').removeClass('js-edit fonticon-pencil')
        .addClass('js-cancel-edit fonticon-cancel').attr("title", "Click to cancel");
      this.$('.js-edit-domain input').select();
    },

    onCancelEditDomain: function () {
      this.$('.js-url').removeClass('hide');
      this.$('.js-edit-domain').addClass('hide');
      this.$('.js-cancel-edit').removeClass('js-cancel-edit fonticon-cancel')
        .addClass('js-edit fonticon-pencil').attr("title", "Click to edit");
    },

    onSaveDomain: function () {
      var newDomain = this.$('.js-edit-domain input').val();

      if (!CORS.validateCORSDomain(newDomain)) {
        FauxtonAPI.addNotification({
          msg: "Please enter a valid domain, starting with http/https and only containing the domain (not a subfolder).",
          type: "error",
          clear: true
        });
        return;
      }

      var domains = this.model.get('origins').split(',');
      domains[this.index] = newDomain;
      this.saveOrigins(domains);
    },

    // remove the domain from the list
    onDeleteDomain: function () {

      // remove the domain from the list. Anyone monitoring the object will hear that it's changed (e.g.
      // the main table, which will know to re-render)
      var domains = this.model.get('origins').split(',');
      domains.splice(this.index, 1);

      this.saveOrigins(domains);
    },

    saveOrigins: function (origins) {
      var originDomains = origins.toString();
      
      var allowOrigins = new CORS.ConfigModel({
        section: 'cors',
        attribute: 'origins',
        value: originDomains
      });
      
      allowOrigins.save().then(function (response) {
        var notification = FauxtonAPI.addNotification({
          msg: 'Your origin domains have been updated.',
          type: 'success',
          clear: true
        });
      },
      function (response, errorCode, errorMsg) {
        var notification = FauxtonAPI.addNotification({
          msg: 'Something went wrong.',
          type: 'error',
          clear: true
        });
      });
    }
  });
  
  CORS.Views = Views;

  return CORS;
});
