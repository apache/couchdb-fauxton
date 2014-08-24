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
  "addons/fauxton/components",

  "addons/documents/resources",
  "addons/databases/resources",
  "addons/pouchdb/base",
  //views
  "addons/documents/views-advancedopts",
  // Libs
  "addons/fauxton/resizeColumns",

  // Plugins
  "plugins/beautify",
  "plugins/prettify"
],

function(app, FauxtonAPI, Components, Documents, Databases, pouchdb,
         QueryOptions, resizeColumns, beautify, prettify) {

  var Views = {};


//right header
  Views.RightHeader = FauxtonAPI.View.extend({
    className: "header-right",
    template: "addons/indexes/templates/header_right",
    initialize:function(options){
      _.bindAll(this);
      this.database = options.database;
      this.title = options.title;
      this.api = options.api;
      this.endpoint = options.endpoint;
      this.documentation = options.documentation;
      FauxtonAPI.Events.on('advancedOptions:updateView', this.updateView);
    },
    updateApiUrl: function(api){
      //this will update the api bar when the route changes
      //you can find the method that updates it in components.js Components.ApiBar()
      this.apiBar && this.apiBar.update(api);
    },
    beforeRender: function(){

      this.apiBar = this.insertView("#header-api-bar", new Components.ApiBar({
        endpoint: this.endpoint,
        documentation: this.documentation
      }));

      this.advancedOptions = this.insertView('#query-options', new QueryOptions.AdvancedOptions({
        database: this.database,
        viewName: this.viewName,
        ddocName: this.model.id,
        hasReduce: this.hasReduce(),
        showStale: true
      }));
    },

    cleanup: function(){
      FauxtonAPI.Events.unbind('advancedOptions:updateView');
    },

    hasReduce: function(){

    },
    updateView: function(event, paramInfo) {
       event.preventDefault();

       var errorParams = paramInfo.errorParams,
           params = paramInfo.params;

       if (_.any(errorParams)) {
         _.map(errorParams, function(param) {
           return FauxtonAPI.addNotification({
             msg: "JSON Parse Error on field: "+param.name,
             type: "error",
             clear: true
           });
         });
         FauxtonAPI.addNotification({
           msg: "Make sure that strings are properly quoted and any other values are valid JSON structures",
           type: "warning",
           clear: true
         });

         return false;
      }

       var fragment = window.location.hash.replace(/\?.*$/, '');
       if (!_.isEmpty(params)) {
        fragment = fragment + '?' + $.param(params);
       }

       FauxtonAPI.navigate(fragment, {trigger: false});
       FauxtonAPI.triggerRouteEvent('updateAllDocs', {ddoc: this.ddocID, view: this.viewName});
    }
  });




  Views.PreviewScreen = FauxtonAPI.View.extend({
    template: "addons/indexes/templates/preview_screen",
    className: "watermark-logo"
  });


  Views.Row = FauxtonAPI.View.extend({
    template: "addons/indexes/templates/index_row_docular",
    className: "doc-row",
    events: {
      "click button.delete": "destroy"
    },

    destroy: function (event) {
      event.preventDefault();

      window.alert('Cannot delete a document generated from a view.');
    },

    beforeRender: function(){
      var newLinks = [{
        links: [{
          title: 'JSON',
          icon: 'fonticon-json'
        }]
      }];

      this.insertView("#view-doc-menu", new Components.MenuDropDown({
        icon: 'fonticon-drop-down-dots',
        links: newLinks,
      }));
    },

    serialize: function() {
      return {
        docID: this.model.get('id'),
        doc: this.model,
        url: this.model.url('app')
      };
    }
  });


/*

  INDEX EDITORS____________________________________

*/

  //Index view CORE  extend this
  Views.IndexCore = FauxtonAPI.View.extend({
    initialize: function(options) {
        this.newView = options.newView || false;
        this.ddocs = options.ddocs;
        this.params = options.params;
        this.database = options.database;
        this.currentDdoc = options.currentddoc;
      if (this.newView) {
        this.viewName = 'newView';
      } else {
        this.ddocID = options.ddocInfo ? options.ddocInfo.id : '';
        this.viewName = options.viewName;
        this.ddocInfo = new Documents.DdocInfo({_id: this.ddocID},{database: this.database});
      }

      this.showIndex = false;
      _.bindAll(this);
    },
    establish: function () {
      if (this.ddocInfo) {
        return this.ddocInfo.fetch();
      }
    },
    serialize: function() {
      return {
        database: this.database.get('id'),
        ddocs: this.ddocs,
        ddoc: this.model,
        ddocName: this.model.id,
        viewName: this.viewName,
        newView: this.newView,
        langTemplates: this.langTemplates.javascript
      };
    }
  });

  Views.ShowEditor = Views.IndexCore.extend({
    template: "addons/indexes/templates/show_editor",
    langTemplates: {
      "javascript": {
        map: "function(doc) {\n  emit(doc._id, 1);\n}",
      }
    },
    defaultLang: "javascript"
  });

  Views.ListEditor = Views.IndexCore.extend({
    template: "addons/indexes/templates/list_editor",
    langTemplates: {
      "javascript": {
        map: "function(doc) {\n  emit(doc._id, 1);\n}",
      }
    },
    defaultLang: "javascript"
  });


  Views.ViewEditor = FauxtonAPI.View.extend({
    template: "addons/indexes/templates/view_editor",
    builtinReduces: ['_sum', '_count', '_stats'],

    events: {
      "click button.save": "saveView",
      "click button.delete": "deleteView",
      "change select#reduce-function-selector": "updateReduce",
      "click #db-views-tabs-nav": 'toggleIndexNav',
      "click .beautify_map":  "beautifyCode",
      "click .beautify_reduce":  "beautifyCode"
    },

    langTemplates: {
      "javascript": {
        map: "function(doc) {\n  emit(doc._id, 1);\n}",
        reduce: "function(keys, values, rereduce){\n  if (rereduce){\n    return sum(values);\n  } else {\n    return values.length;\n  }\n}"
      }
    },

    defaultLang: "javascript",

    initialize: function(options) {
      this.newView = options.newView || false;
      this.ddocs = options.ddocs;
      this.params = options.params;
      this.database = options.database;
      this.currentDdoc = options.currentddoc;
      if (this.newView) {
        this.viewName = 'newView';
      } else {
        this.ddocID = options.ddocInfo.id;
        this.viewName = options.viewName;
        this.ddocInfo = new Documents.DdocInfo({_id: this.ddocID},{database: this.database});
      }

      this.showIndex = false;
      _.bindAll(this);

      FauxtonAPI.Events.on('index:delete', this.deleteEvent);
    },

    establish: function () {
      if (this.ddocInfo) {
        return this.ddocInfo.fetch();
      }
    },

    updateValues: function() {
      var notification;
      if (this.model.changedAttributes()) {
        notification = FauxtonAPI.addNotification({
          msg: "Document saved successfully.",
          type: "success",
          clear: true
        });
        this.editor.setValue(this.model.prettyJSON());
      }
    },

    updateReduce: function(event) {
      var $ele = $("#reduce-function-selector");
      var $reduceContainer = $(".control-group.reduce-function");
      if ($ele.val() == "CUSTOM") {
        this.createReduceEditor();
        this.reduceEditor.setValue(this.langTemplates.javascript.reduce);
        $reduceContainer.show();
      } else {
        $reduceContainer.hide();
      }
    },

    deleteEvent: function(){
      this.deleteView();
    },

    deleteView: function (event) {
      event && event.preventDefault();

      if (this.newView) { return alert('Cannot delete a new view.'); }
      if (!confirm('Are you sure you want to delete this view?')) { return; }

      var that = this,
          promise,
          viewName = this.$('#index-name').val(),
          ddocName = this.$('#ddoc :selected').val(),
          ddoc = this.getCurrentDesignDoc();

      ddoc.removeDdocView(viewName);

      if (ddoc.hasViews()) {
        promise = ddoc.save();
      } else {
        promise = ddoc.destroy();
      }

      promise.then(function () {
        FauxtonAPI.navigate('/database/' + that.database.safeID() + '/_all_docs?limit=' + Databases.DocLimit);
        FauxtonAPI.triggerRouteEvent('reloadDesignDocs');
      });
    },

    saveView: function(event) {
      var json, notification,
      that = this;

      if (event) { event.preventDefault();}

      $('#dashboard-content').scrollTop(0); //scroll up
      //check if the code is valid & the inputs are filled out
      if (this.hasValidCode() && this.$('#new-ddoc:visible').val() !=="") {
        var mapVal = this.mapEditor.getValue(),
        reduceVal = this.reduceVal(),
        viewName = this.$('#index-name').val(),
        ddoc = this.getCurrentDesignDoc(),
        ddocName = ddoc.id;
        this.viewNameChange = false;


        if (this.viewName !== viewName) {
          ddoc.removeDdocView(this.viewName);
          this.viewName = viewName;
          this.viewNameChange = true;
        }

        notification = FauxtonAPI.addNotification({
          msg: "Saving document.",
          clear: true
        });

        ddoc.setDdocView(viewName, mapVal, reduceVal);

        ddoc.save().then(function () {
          //on success
          that.afterSave(ddoc, viewName, ddocName);
        },
        function(xhr) {
          //on failure
          var responseText = JSON.parse(xhr.responseText).reason;
          notification = FauxtonAPI.addNotification({
            msg: "Save failed: " + responseText,
            type: "error",
            clear: true
          });
        });
      } else {
        //if nothing is filled out give an error message
        var errormessage = (this.$('#new-ddoc:visible').val() ==="")?"Enter a design doc name":"Please fix the Javascript errors and try again.";
        notification = FauxtonAPI.addNotification({
          msg: errormessage,
          type: "error",
          clear: true
        });
      }
    },

    afterSave: function(ddoc, viewName, ddocName){
      var reduceVal = this.reduceVal();
      //add ddoc to the collection
      this.ddocs.add(ddoc);

      //trigger the EditSaved function on the map editor & reduce editor
      this.mapEditor.editSaved();
      this.reduceEditor && this.reduceEditor.editSaved();


      //show a notification
      FauxtonAPI.addNotification({
        msg: "View has been saved.",
        type: "success",
        clear: true
      });


      //if it's new or the name changed (aka created a new doc)
      if (this.newView || this.viewNameChange) {
        var fragment = '/database/' + this.database.safeID() +'/' + ddoc.safeID() + '/_view/' + app.utils.safeURLName(viewName);

        FauxtonAPI.navigate(fragment, {trigger: false});
        this.newView = false;
        this.ddocID = ddoc.safeID();
        this.viewName = viewName;
        this.ddocInfo = ddoc;
        this.showIndex = true;
        this.render();
      }

      // TODO:// this should change to a trigger because we shouldn't define advanced options in this view
      if (this.reduceFunStr !== reduceVal) {
        this.reduceFunStr = reduceVal;
       // this.advancedOptions.renderOnUpdatehasReduce(this.hasReduce());
      }

      // Route Event will reload the right content
      FauxtonAPI.triggerRouteEvent('updateAllDocs', {ddoc: ddocName, view: viewName});
    },

    getCurrentDesignDoc: function () {
      return this.designDocSelector.getCurrentDesignDoc();
    },

    isCustomReduceEnabled: function() {
      return $("#reduce-function-selector").val() == "CUSTOM";
    },

    mapVal: function () {
      if (this.mapEditor) {
        return this.mapEditor.getValue();
      }

      return this.$('#map-function').text();
    },

    reduceVal: function() {
      var reduceOption = this.$('#reduce-function-selector :selected').val(),
      reduceVal = "";

      if (reduceOption === 'CUSTOM') {
        if (!this.reduceEditor) { this.createReduceEditor(); }
        reduceVal = this.reduceEditor.getValue();
      } else if ( reduceOption !== 'NONE') {
        reduceVal = reduceOption;
      }

      return reduceVal;
    },


    hasValidCode: function() {
      return _.every(["mapEditor", "reduceEditor"], function(editorName) {
        var editor = this[editorName];
        if (editorName === "reduceEditor" && ! this.isCustomReduceEnabled()) {
          return true;
        }
        return editor.hadValidCode();
      }, this);
    },


    serialize: function() {
      return {
        database: this.database.get('id'),
        ddocs: this.ddocs,
        ddoc: this.model,
        ddocName: this.model.id,
        viewName: this.viewName,
        reduceFunStr: this.reduceFunStr,
        isCustomReduce: this.hasCustomReduce(),
        newView: this.newView,
        langTemplates: this.langTemplates.javascript
      };
    },

    hasCustomReduce: function() {
      return this.reduceFunStr && ! _.contains(this.builtinReduces, this.reduceFunStr);
    },

    hasReduce: function () {
      return this.reduceFunStr || false;
    },

    createReduceEditor: function () {
      if (this.reduceEditor) {
        this.reduceEditor.remove();
      }

      this.reduceEditor = new Components.Editor({
        editorId: "reduce-function",
        mode: "javascript",
        couchJSHINT: true
      });
      this.reduceEditor.render();

      if (this.reduceEditor.getLines() === 1){
        this.$('.beautify_reduce').removeClass("hide");
        $('.beautify-tooltip').tooltip();
      }
    },
    beforeRender: function () {

      if (this.newView) {
        this.reduceFunStr = '';
        if (this.ddocs.length === 0) {
          this.model = new Documents.Doc(null, {database: this.database});
        } else {
          this.model = this.ddocs.first().dDocModel();
        }
        this.ddocID = this.model.id;
      } else {
        var ddocDecode = decodeURIComponent(this.ddocID);
        this.model = this.ddocs.get(this.ddocID).dDocModel();
        this.reduceFunStr = this.model.viewHasReduce(this.viewName);
      }

      var viewFilters = FauxtonAPI.getExtensions('sidebar:viewFilters'),
          filteredModels = this.ddocs.models,
          designDocs = this.ddocs.clone();

      if (!_.isEmpty(viewFilters)) {
        _.each(viewFilters, function (filter) {
          filteredModels = _.filter(filteredModels, filter);
        });
        designDocs.reset(filteredModels, {silent: true});
      }

      this.designDocSelector = this.setView('.design-doc-group', new Views.DesignDocSelector({
        collection: designDocs,
        newView: this.newView,
        ddocName: this.currentDdoc || this.model.id,
        database: this.database
      }));

    },

    afterRender: function() {
      //TODO: have this happen on a trigger once we move advanced options to the header
      // if (this.params && !this.newView) {
      //   this.advancedOptions.updateFromParams(this.params);
      // }

      this.designDocSelector.updateDesignDoc();
      this.showEditors();
      this.showIndex = false;

    },

    showEditors: function () {
      this.mapEditor = new Components.Editor({
        editorId: "map-function",
        mode: "javascript",
        couchJSHINT: true
      });
      this.mapEditor.render();

      if (this.hasCustomReduce()) {
        this.createReduceEditor();
      } else {
        $(".control-group.reduce-function").hide();
      }

      if (this.newView) {
        this.mapEditor.setValue(this.langTemplates[this.defaultLang].map);
        //Use a built in view by default
        //this.reduceEditor.setValue(this.langTemplates[this.defaultLang].reduce);
      }

      this.mapEditor.editSaved();
      this.reduceEditor && this.reduceEditor.editSaved();

      if (this.mapEditor.getLines() === 1){
        this.$('.beautify_map').removeClass("hide");
        $('.beautify-tooltip').tooltip();
      }
    },
    beautifyCode: function(e){
      e.preventDefault();
      var targetEditor = $(e.currentTarget).hasClass('beautify_reduce')?this.reduceEditor:this.mapEditor;
      var beautifiedCode = beautify(targetEditor.getValue());
      targetEditor.setValue(beautifiedCode);
    },
    cleanup: function () {
      FauxtonAPI.Events.unbind('index:delete');
      this.mapEditor && this.mapEditor.remove();
      this.reduceEditor && this.reduceEditor.remove();
    }
  });

  Views.DesignDocSelector = FauxtonAPI.View.extend({
    template: "addons/indexes/templates/design_doc_selector",

    events: {
      "change select#ddoc": "updateDesignDoc"
    },

    initialize: function (options) {
      this.newView = options.newView;
      this.ddocName = options.ddocName;
      this.database = options.database;
      this.listenTo(this.collection, 'add', this.ddocAdded);
      this.DocModel = options.DocModel || Documents.Doc;
    },

    ddocAdded: function (ddoc) {
      this.ddocName = ddoc.id;
      this.render();
    },

    serialize: function () {
      return {
        newView: this.newView,
        ddocName: this.ddocName,
        ddocs: this.collection
      };
    },

    updateDesignDoc: function () {
      if (this.newDesignDoc()) {
        this.$('#new-ddoc').show();
      } else {
        this.$('#new-ddoc').hide();
      }
    },

    newDesignDoc: function () {

      return this.$('#ddoc').val() === 'new-doc';
    },

    newDocValidation: function(){
      return this.newDesignDoc() && this.$('#new-ddoc').val()==="";
    },
    getCurrentDesignDoc: function () {
      if (this.newDesignDoc()) {
        var doc = {
          _id: '_design/' + this.$('#new-ddoc').val(),
          views: {},
          language: "javascript"
        };
        var ddoc = new this.DocModel(doc, {database: this.database});
        //this.collection.add(ddoc);
        return ddoc;
      } else if ( !this.newDesignDoc() ) {
        var ddocName = this.$('#ddoc').val();
        return this.collection.find(function (ddoc) {
          return ddoc.id === ddocName;
        }).dDocModel();
      }
    }
  });

  return Views;
});
