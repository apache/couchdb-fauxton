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
       // Libs
       "addons/fauxton/resizeColumns",
],

function(app, FauxtonAPI, resizeColumns ) {

  var Views = {};

  Views.AdvancedOptions = FauxtonAPI.View.extend({
    template: "addons/documents/templates/advanced_options",
    className: "advanced-options well",

    initialize: function (options) {
      this.database = options.database;
      this.ddocName = options.ddocName;
      this.viewName = options.viewName;
      this.updateViewFn = options.updateViewFn;
      this.previewFn = options.previewFn;
      this.showStale = _.isUndefined(options.showStale) ? false : options.showStale;
      this.hasReduce = _.isUndefined(options.hasReduce) ? true : options.hasReduce;
    },

    events: {
      "change form.js-view-query-update input": "updateFilters",
      "change form.js-view-query-update select": "updateFilters",
      "submit form.js-view-query-update": "updateView",
      "click .toggle-btns > label":  "toggleQuery"
    },

    toggleQuery: function(e){
      e.preventDefault();

      if (this.$(e.currentTarget).hasClass("active")){
        this.$('.js-query-keys-wrapper').addClass("hide");
        this.$(".toggle-btns > label").removeClass('active');
        this.$('.js-query-keys-wrapper').find("input,textarea").attr("disabled","true");
      } else {
        this.$('.js-query-keys-wrapper').removeClass("hide");
        var showFunctionName =this.$(e.currentTarget).attr("for");
        //highlight current
        this.$(".toggle-btns > label").removeClass('active');
        this.$(e.currentTarget).addClass("active");
        this.$("[id^='js-show']").hide();
        //show section & disable what needs to be disabled
        this[showFunctionName]();
      }
    },

    showKeys: function(){
      this.$("#js-showKeys, .js-disabled-message").show();
      this.$('[name="startkey"],[name="endkey"],[name="inclusive_end"]').attr("disabled","true");
      this.$('[name="keys"]').removeAttr("disabled");
    },

    showStartEnd: function(){
      this.$("#js-showStartEnd").show();
      this.$('[name="startkey"],[name="endkey"],[name="inclusive_end"]').removeAttr("disabled");
      this.$('.js-disabled-message').hide();
      this.$('[name="keys"]').attr("disabled","true");
    },

    beforeRender: function () {
      if (this.viewName && this.ddocName) {
        var buttonViews = FauxtonAPI.getExtensions('advancedOptions:ViewButton');
        _.each(buttonViews, function (view) {
          this.insertView('#button-options', view);
          view.update(this.database, this.ddocName, this.viewName);
        }, this);
      }
    },

    renderOnUpdatehasReduce: function (hasReduce) {
      this.hasReduce = hasReduce;
      this.render();
    },

    parseJSON: function (value) {
      try {
        return JSON.parse(value);
      } catch(e) {
        return undefined;
      }
    },

    validateKeys:  function(param){
      var errorMsg = false,
          parsedValue = this.parseJSON(param.value);

      if (_.isUndefined(parsedValue)) {
        errorMsg = "Keys must be valid json.";
      } else if (!_.isArray(parsedValue)) {
        errorMsg =  "Keys values must be in an array. E.g [1,2,3]";
      }

      if (errorMsg) {
        this.$('.js-keys-error').empty();
        FauxtonAPI.addNotification({
          type: "error",
          msg: errorMsg,
          clear:  false,
          selector: '.advanced-options .errors-container'
        });
        return false;
      }

      return true;
    },
    validateFields: function(params){
      var errors = false;
      //so ghetto. Spaghetti code.
      for (var i= 0; i <params.length; i++){
        if (params[i].name === "skip"){
          if (!(/^\d+$/).test(params[i].value)){
            FauxtonAPI.addNotification({
              msg: "Numbers only for skip",
              type: "warn",
              selector: ".advanced-options .errors-container",
              clear:  true
            });
            errors = true;
          }
        }
      }
      return errors;
    },
    queryParams: function () {
      var $form = this.$(".js-view-query-update"),
          keysParam = false;

      var params = _.reduce($form.serializeArray(), function(params, param) {
        if (!param.value) { return params; }
        if (param.name === "limit" && param.value === 'None') { return params; }
        if (param.name === "keys") { keysParam = param; }
        params.push(param);
        return params;
      }, []);


      if (keysParam && !this.validateKeys(keysParam)) { return false; }

      if (params && this.validateFields(params)){ return false; }

      // Validate *key* params to ensure they're valid JSON
      var keyParams = ["keys","startkey","endkey"];
      var errorParams = _.filter(params, function(param) {
        if (_.contains(keyParams, param.name) && _.isUndefined(this.parseJSON(param.value))) {
            return true;
          }

          return false;
      }, this);

      return {params: params, errorParams: errorParams};
    },

    updateView: function (event) {
      event.preventDefault();
      var params = this.queryParams();
      if (!params) { return;}
      this.updateViewFn(event, params);
    },

    updateFilters: function(event) {
      event.preventDefault();
      var $ele = $(event.currentTarget);
      var name = $ele.attr('name');
      this.updateFiltersFor(name, $ele);
    },

    updateFiltersFor: function(name, $ele) {
      var $form = $ele.parents("form.js-view-query-update:first");
      switch (name) {
        // Reduce constraints
        //   - Can't include_docs for reduce=true
        //   - can't include group_level for reduce=false
        case "reduce":
          if ($ele.prop('checked') === true) {
          if ($form.find("input[name=include_docs]").prop("checked") === true) {
            $form.find("input[name=include_docs]").prop("checked", false);
            var notification = FauxtonAPI.addNotification({
              msg: "include_docs has been disabled as you cannot include docs on a reduced view",
              type: "warn",
              selector: ".advanced-options .errors-container",
              clear:  true
            });
          }
          $form.find("input[name=include_docs]").prop("disabled", true);
          $form.find("select[name=group_level]").prop("disabled", false);
        } else {
          $form.find("select[name=group_level]").val("999").prop("disabled", true);
          $form.find("input[name=include_docs]").prop("disabled", false);
        }
        break;
        case "skip":
          if (!(/^\d+$/).test($ele.val())){
            FauxtonAPI.addNotification({
              msg: "Numbers only for skip",
              type: "warn",
              selector: ".advanced-options .errors-container",
              clear:  true
            });
          }
        break;
        case "include_docs":
        break;
      }
    },

    updateFromParams: function (params) {
      var $form = this.$el.find("form.js-view-query-update");
      _.each(params, function(val, key) {
        var $ele;
        switch (key) {
          case "limit":
          case "descending":
          case "group_level":
            if (!val) { return; }
            $form.find("select[name='"+key+"']").val(val);
          break;
          case "include_docs":
            case "stale":
            case "inclusive_end":
            $form.find("input[name='"+key+"']").prop('checked', true);
          break;
          case "reduce":
            $ele = $form.find("input[name='"+key+"']");
          if (val == "true") {
            $ele.prop('checked', true);
          }
          this.updateFiltersFor(key, $ele);
          break;
          case "key":
          case "keys":
            $form.find("textarea[name='"+key+"']").val(val);
          break;
          default:
            $form.find("input[name='"+key+"']").val(val);
          break;
        }
      }, this);
    },

    serialize: function () {
      return {
        hasReduce: this.hasReduce,
        showPreview: false,
        showStale: this.showStale
      };
    }
  });


  return Views;

});
