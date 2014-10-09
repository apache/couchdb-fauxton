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

  // libs
  "addons/fauxton/resizeColumns"
],

function(app, FauxtonAPI) {

  // our default settings for the Query Options tray
  var defaultOptions = {
    showStale: false,
    hasReduce: false,

    // all the possible query search params. Ultimately these should probably be moved higher-up (route object?),
    // because they also apply to the actual search results. Seems better to place them there, then use them in
    // both places
    queryParams: {
      include_docs: "false",
      keys: "",
      limit: "",
      descending: "false",
      skip: "",
      update_seq: "false",
      startkey: "",
      endkey: "",
      inclusive_end: "true",
      reduce: "false",
      stale: "",
      group_level: "999"
    }
  };


  var Views = {};

  // our main View. This is the only View exposed externally
  Views.QueryOptionsTray = FauxtonAPI.View.extend({
    template: "addons/documents/templates/query_options",
    className: "query-options",

    initialize: function(options) {

      // overlays whatever custom options were passed with defaultOptions above, so this.options
      // always contains all options. [This does a deep copy: we never overwrite defaultOptions!]
      this.options = $.extend(true, {}, defaultOptions, options);

      // add any general events relating to the Query Options tray
      this.addEvents();

      // add the sub-views
      this.mainFieldsView       = this.setView("#query-options-main-fields", new MainFieldsView(this.options));
      this.keySearchFieldsView  = this.setView("#query-options-key-search", new KeySearchFieldsView(this.options));
      this.additionalParamsView = this.setView("#query-options-additional-params", new AdditionalParamsView(this.options));
    },

    addEvents: function() {
      FauxtonAPI.Events.on('QueryOptions:closeTray', this.closeTray, this);
      FauxtonAPI.Events.on('QueryOptions:openTray', this.toggleQueryOptionsTray, this);

      // if the user just clicked outside the tray, close it [TODO be nice to generalize for all trays]
      var trayIsVisible = this.trayIsVisible;
      var closeTray = this.closeTray;

      $("body").on("click.queryOptions", function(e) {
        if (!trayIsVisible()) { return; }
        if ($(e.target).closest("#query-options-tray").length === 0) {
          closeTray();
        }
      });

      $(window).on("resize", this.onResize);
    },

    afterRender: function() {
      this.onResize();
    },

    cleanup: function() {
      FauxtonAPI.Events.unbind("QueryOptions:closeTray");
      FauxtonAPI.Events.unbind("QueryOptions:openTray");
      $(window).off("resize", this.onResize);
    },

    events: {
      "click #toggle-query": "toggleQueryOptionsTray", // hide/show the Query Options tray
      "submit form.js-view-query-update": "onSubmit",  // submits the form
      "click .btn-cancel": "onCancel"                  // closes the tray (doesn't reset the fields)
    },

    toggleQueryOptionsTray: function() {
      if (!this.trayIsVisible()) {
        $("#query-options-tray").velocity("transition.slideDownIn", 250); // TODO constant
        FauxtonAPI.Events.trigger("APIbar:closeTray");
      }
    },

    // returns all applicable query parameters for the Query Options tray
    getQueryParams: function() {
      var mainFieldParams = this.mainFieldsView.getParams();
      var keySearchParams = this.keySearchFieldsView.getParams();
      var additionalParams = this.additionalParamsView.getParams();

      // assumption: there aren't conflicting keys
      return _.extend({}, mainFieldParams, keySearchParams, additionalParams);
    },

    onSubmit: function(e) {
      e.preventDefault();

      // validate the user-inputted fields. If anything is invalid, the sub-view will display the appropriate
      // errors to the user
      if (!this.keySearchFieldsView.hasValidInputs() || !this.additionalParamsView.hasValidInputs()) {
        return;
      }

      this.closeTray();

      // this may be empty. That's ok! Perhaps the user just did a search with params, then removed them & wants the default
      var params = this.getQueryParams();

      // all looks good! Close the tray and publish the message
      var url = app.utils.replaceQueryParams(params);
      FauxtonAPI.navigate(url, { trigger: false });
      FauxtonAPI.triggerRouteEvent("updateAllDocs", { allDocs: true });
    },

    onCancel: function() {
      this.closeTray();
    },

    // if the screen is so small there isn't space for the full tray height we manually shrink the height to allow scrolling.
    // Technically this should handle width as well, but we won't bother because there are way bigger issues with a screen
    // with such a small width!
    onResize: function() {
      var $tray = $("#query-options-tray");
      var heightFromTop = parseInt($tray.css("top"), 10);
      var windowHeight = $(window).height();

      // we apply the max-height to the form rather than the entire tray to allow the little up arrow to appear normally
      $tray.find("form").css("max-height", windowHeight - heightFromTop);
    },

    /*
     * Updates specific query options, leaving any that have been set already intact.
     */
    updateQueryOptions: function(options) {
      this.options = $.extend(this.options, options);
      this.updateSubViews();
    },

    /*
     * Reset the query options back to the defaults, then apply whatever new options are needed.
     */
    resetQueryOptions: function(options) {
      this.options = $.extend(true, {}, defaultOptions, options);
      this.updateSubViews();
    },

    // helper
    updateSubViews: function() {
      this.mainFieldsView.update(this.options);
      this.keySearchFieldsView.update(this.options);
      this.additionalParamsView.update(this.options);
    },

    trayIsVisible: function() {
      return $("#query-options-tray").is(":visible");
    },

    closeTray: function() {
      $("#query-options-tray").velocity("reverse", 250, function() { // TODO constant
        $("#query-options-tray").hide();
      });
    }
  });


  // ------ "private" Views ------

  var MainFieldsView = FauxtonAPI.View.extend({
    template: "addons/documents/templates/query_options_main_fields",
    events: {
      "change #qoReduce": "onToggleReduceCheckbox"
    },

    initialize: function(options) {
      this.queryParams = options.queryParams;
      this.showStale = options.showStale;
      this.hasReduce = options.hasReduce;
    },

    update: function(options) {
      this.queryParams = options.queryParams;
      this.showStale = options.showStale;
      this.hasReduce = options.hasReduce;

      // if the View hasn't already rendered we can rely on afterRender() to pre-fill the fields
      if (this.hasRendered) {
        this.render();
      }
    },

    afterRender: function() {
      $("#qoIncludeDocs").prop("checked", this.queryParams.include_docs === "true");
      this.updateReduceSettings(this.queryParams.reduce === "true");
    },

    /*
     * The "Reduce" option comes with baggage:
     *   - we can't include_docs for reduce = true
     *   - can't include group_level for reduce = false
     */
    onToggleReduceCheckbox: function(e) {
      e.preventDefault();
      var isChecked = $(e.currentTarget).prop("checked");
      this.updateReduceSettings(isChecked);
    },


    // helper function to hide/show, disable/enable fields based on whether "Reduce" is an option and whether
    // it's checked
    updateReduceSettings: function(isChecked) {
      $("#qoReduce").prop("checked", isChecked);

      var $qoIncludeDocs = $("#qoIncludeDocs"),
        $qoIncludeDocsLabel = $("#qoIncludeDocsLabel"),
        $qoGroupLevelGroup = $("#qoGroupLevelGroup");

      if (this.hasReduce) {
        $("#qoGroupLevel").val(this.queryParams.group_level);

        if (isChecked) {
          $qoIncludeDocs.prop({ "checked": false, "disabled": true });
          $qoIncludeDocsLabel.addClass("disabled");
          $qoGroupLevelGroup.removeClass("hide");
        } else {
          $qoIncludeDocs.prop("disabled", false);
          $qoIncludeDocsLabel.removeClass("disabled");
          $qoGroupLevelGroup.addClass("hide");
        }
      } else {
        $qoIncludeDocs.prop("disabled", false);
        $qoIncludeDocsLabel.removeClass("disabled");
        $qoGroupLevelGroup.addClass("hide");
      }
    },

    getParams: function() {
      var params = {};
      this.$("input:checked,select").each(function() {

        // this ensures that only settings that differ from the defaults are passed along. If we didn't do this,
        // the query string would be loaded up with all possible vals for each search (which would work, but would be ugly)
        if (this.value !== defaultOptions.queryParams[this.name]) {
          params[this.name] = this.value;
        }
      });
      return params;
    },

    serialize: function() {
      return {
        hasReduce: this.hasReduce,
        showStale: this.showStale
      };
    }
  });


  var KeySearchFieldsView = FauxtonAPI.View.extend({
    template: "addons/documents/templates/query_options_key_search",
    events: {
      "click .toggle-btns > label": "toggleKeysSection"
    },

    initialize: function(options) {
      this.queryParams = options.queryParams;
      this.hasReduce = options.hasReduce;
    },

    update: function(options) {
      this.queryParams = options.queryParams;
      this.hasReduce = options.hasReduce;

      if (this.hasRendered) {
        this.render();
      }
    },

    // prefill the form fields
    afterRender: function() {
      if (this.queryParams.keys) {
        this.$(".toggle-btns > label[data-action=showByKeys]").addClass("active");
        this.$(".js-query-keys-wrapper").removeClass("hide");
        this.showByKeysSection();
        $("#keys-input").val(this.queryParams.keys);
      } else {

        // if the startKey, endKey or inclusive_end differs from the defaults, show the section. Meh, this sucks...
        if (defaultOptions.queryParams.startkey !== this.queryParams.startkey ||
            defaultOptions.queryParams.endkey !== this.queryParams.endkey ||
            defaultOptions.queryParams.inclusive_end !== this.queryParams.inclusive_end) {
          this.$(".toggle-btns > label[data-action=showBetweenKeys]").addClass("active");
          this.$(".js-keys-section").addClass("hide");
          this.$(".js-query-keys-wrapper").removeClass("hide");
          this.showBetweenKeysSection();

          $("#startkey").prop("disabled", false).val(this.queryParams.startkey);
          $("#endkey").prop("disabled", false).val(this.queryParams.endkey);
          $("#qoIncludeEndKeyInResults").prop("checked", this.queryParams.inclusive_end === "true");
        }
      }
    },

    toggleKeysSection: function(e) {
      e.preventDefault();

      var $clickedEl = $(e.currentTarget);
      var $keyFieldsWrapper = this.$(".js-query-keys-wrapper");

      if ($clickedEl.hasClass("active")){
        $clickedEl.removeClass("active");
        $keyFieldsWrapper.addClass("hide");
      } else {
        this.$(".toggle-btns > label").removeClass("active");
        this.$(".js-keys-section").hide();

        $clickedEl.addClass("active");
        $keyFieldsWrapper.removeClass("hide");

        // show section and disable what needs to be disabled
        var action = $clickedEl.data("action");
        if (action === "showByKeys") {
          this.showByKeysSection();
        } else {
          this.showBetweenKeysSection();
        }
      }
    },

    showByKeysSection: function() {
      this.$("#js-showKeys, .js-disabled-message").show();
      this.$('[name="startkey"],[name="endkey"],[name="inclusive_end"]').prop("disabled", true);
      this.$('[name="keys"]').removeAttr("disabled");
    },

    showBetweenKeysSection: function(){
      this.$("#js-showStartEnd").show();
      this.$('[name="startkey"],[name="endkey"],[name="inclusive_end"]').removeAttr("disabled");
      this.$('.js-disabled-message').hide();
      this.$('[name="keys"]').prop("disabled", true);
    },

    // this assumes that hasValidInputs has been called. Otherwise the returned param data may be invalid
    getParams: function() {
      var params = {};
      var selectedKeysSection = this.getSelectedKeysSection();

      // basically the gist of this is that it only actually returns *relevant* key-value pairs. Defaults
      // aren't included because they'd clutter up the URL
      if (selectedKeysSection === "showByKeys") {
        var keys = $.trim($("#keys-input").val());
        if (keys !== "") {
          params.keys = keys;
        }
      } else if (selectedKeysSection === "showBetweenKeys") {
        var startKey = $.trim($("#startkey").val());
        if (startKey !== defaultOptions.queryParams.startkey) {
          params.startkey = startKey;
        }
        var endKey = $.trim($("#endkey").val());
        if (endKey !== defaultOptions.queryParams.endkey) {
          params.endkey = endKey;
        }
        var includeEndKeyVal = $("#qoIncludeEndKeyInResults").is(":checked");
        params.inclusive_end = (includeEndKeyVal) ? "true" : "false";
      }
      return params;
    },

    /*
     * Checks to see that the user-inputted values are valid. If not, it displays a message to the user.
     * @returns {boolean} true if all valid; false otherwise
     */
    hasValidInputs: function() {
      var selectedKeysSection = this.getSelectedKeysSection(),
          errorMsg = null;

      if (selectedKeysSection === "showByKeys") {
        var keys = this.parseJSON($("#keys-input").val());
        if (keys && !_.isArray(keys)) {
          errorMsg = "Keys values must be in an array, e.g [1,2,3]";
        }
      } else {
        var startKey = $.trim($("#startkey").val()),
            endKey = $.trim($("#endkey").val());

        if (startKey !== "" && _.isUndefined(this.parseJSON(startKey))) {
          errorMsg = "JSON Parse Error on the Start Key field";
        } else if (endKey !== "" && _.isUndefined(this.parseJSON(endKey))) {
          errorMsg = "JSON Parse Error on the End Key field";
        }
      }

      if (errorMsg !== null) {
        this.$(".js-keys-error").empty();

        FauxtonAPI.addNotification({
          type: "error",
          msg: errorMsg,
          clear:  false,
          selector: ".query-options .errors-container"
        });
        return false;
      }

      return true;
    },

    parseJSON: function(value) {
      try {
        return JSON.parse(value);
      } catch(e) {
        return undefined;
      }
    },

    getSelectedKeysSection: function() {
      return this.$(".toggle-btns > label.active").data("action");
    }
  });


  var AdditionalParamsView = FauxtonAPI.View.extend({
    template: "addons/documents/templates/query_options_additional_params",

    initialize: function(options) {
      this.queryParams = options.queryParams;
      this.showStale = options.showStale;
    },

    update: function(options) {
      this.queryParams = options.queryParams;
      this.showStale = options.showStale;
      if (this.hasRendered) {
        this.render();
      }
    },

    afterRender: function() {
      $("#qoUpdateSeq").prop("checked", this.queryParams.update_seq === "true");
      $("#qoDescending").prop("checked", this.queryParams.descending === "true");
      $("#qoLimit").val(this.queryParams.limit);
      $("#qoSkip").val(this.queryParams.skip);
      $("#qoStale").prop("checked", this.queryParams.stale === "ok");
    },

    getParams: function() {
      var params = {};
      this.$("input,select").each(function() {
        if ($(this).is(":checkbox")) {
          if (this.checked) {
            params[this.name] = this.value;
          }
        } else {
          var val = $.trim(this.value);
          if (val !== "") {
            params[this.name] = this.value;
          }
        }
      });
      return params;
    },

    hasValidInputs: function() {
      var allValid = true;
      var skipVal = $("#qoSkip").val();
      if (skipVal !== "" && /\D/.test(skipVal)) {
        FauxtonAPI.addNotification({
          msg: "Please only enter numbers only for the Skip field.",
          type: "error",
          selector: ".query-options .errors-container",
          clear:  true
        });
        allValid = false;
      }
      return allValid;
    },

    serialize: function() {
      return {
        showStale: this.showStale
      };
    }
  });

  return Views;
});

