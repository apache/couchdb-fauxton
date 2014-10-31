// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

define([
  'app',

  'api',
  'addons/fauxton/components',

  'addons/documents/resources',
  'addons/databases/resources',
  'addons/pouchdb/base',
  //views
  'addons/documents/views-queryoptions',
  // Libs
  'addons/fauxton/resizeColumns',

  // Plugins
  'plugins/beautify',
  'plugins/prettify'
],

function (app, FauxtonAPI, Components, Documents, Databases, pouchdb,
         QueryOptions, resizeColumns, beautify, prettify) {

  var Views = {};

  Views.PreviewScreen = FauxtonAPI.View.extend({
    template: 'addons/indexes/templates/preview_screen',
    className: 'watermark-logo'
  });


  Views.Row = FauxtonAPI.View.extend({
    template: 'addons/indexes/templates/index_row_docular',
    className: 'doc-row',
    events: {
      'click button.js-delete': 'destroy'
    },

    destroy: function (event) {
      event.preventDefault();

      window.alert('Cannot delete a document generated from a view.');
    },

    beforeRender: function () {
      var newLinks = [{
        links: [{
          title: 'JSON',
          icon: 'fonticon-json'
        }]
      }];

      this.insertView('.view-doc-menu', new Components.MenuDropDown({
        icon: 'fonticon-drop-down-dots',
        links: newLinks
      }));
    },

    serialize: function () {
      return {
        docID: this.model.get('id'),
        doc: this.model,
        url: this.model.url('app')
      };
    }
  });

  Views.IndexCore = FauxtonAPI.View.extend({
    initialize: function (options) {
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
    },

    establish: function () {
      if (this.ddocInfo) {
        return this.ddocInfo.fetch();
      }
    },

    serialize: function () {
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

  Views.ViewEditor = FauxtonAPI.View.extend({
    template: 'addons/indexes/templates/view_editor',
    builtinReduces: ['_sum', '_count', '_stats'],

    events: {
      'click button.js-save': 'saveViewHandler',
      'click button.js-delete': 'deleteViewHandler',
      'change select#js-reduce-function-selector': 'updateReduce',
      'click .js-beautify-map':  'beautifyCode',
      'click .js-beautify-reduce':  'beautifyCode'
    },

    langTemplates: {
      'javascript': {
        map: 'function(doc) {\n  emit(doc._id, 1);\n}',
        reduce: 'function(keys, values, rereduce) {\n  if (rereduce) {\n    return sum(values);\n  } else {\n    return values.length;\n  }\n}'
      }
    },

    defaultLang: 'javascript',

    initialize: function (options) {
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
        this.ddocInfo = new Documents.DdocInfo({_id: this.ddocID}, {database: this.database});
      }

      this.listenTo(FauxtonAPI.Events, 'index:delete', this.deleteView);
    },

    establish: function () {
      if (!this.ddocInfo) {
        return;
      }

      return this.ddocInfo.fetch();
    },

    updateValues: function () {
      if (this.model.changedAttributes()) {
        FauxtonAPI.addNotification({
          msg: 'Document saved successfully.',
          type: 'success',
          clear: true
        });
        this.editor.setValue(this.model.prettyJSON());
      }
    },

    updateReduce: function (event) {
      var $ele = this.$('.js-reduce-function-selector'),
          $reduceContainer = this.$('.js-reduce-function-group');

      if ($ele.val() == 'CUSTOM') {
        this.createReduceEditor();
        this.reduceEditor.setValue(this.langTemplates.javascript.reduce);
        $reduceContainer.show();
      } else {
        $reduceContainer.hide();
      }
    },

    deleteViewHandler: function (event) {
      event && event.preventDefault();
      this.deleteView();
    },

    deleteView: function () {
      if (this.newView) { return alert('Cannot delete a new view.'); }
      if (!confirm('Are you sure you want to delete this view?')) { return; }

      var databaseId = this.database.safeID(),
          viewName = this.$('.js-index-name').val(),
          ddocName = this.$('.js-ddoc :selected').val(),
          ddoc = this.getCurrentDesignDoc(),
          promise;

      ddoc.removeDdocView(viewName);

      if (ddoc.hasViews()) {
        promise = ddoc.save();
      } else {
        promise = ddoc.destroy();
      }

      promise.then(function () {
        FauxtonAPI.navigate('/database/' + databaseId + '/_all_docs?limit=' + Databases.DocLimit);
        FauxtonAPI.triggerRouteEvent('reloadDesignDocs');
      });
    },

    saveViewHandler: function (event) {
      event.preventDefault();
      this.saveView();
    },

    saveView: function () {
      var afterSaveSuccess = _.bind(this.afterSave, this),
          designDocNameEmpty,
          errormessage,
          reduceVal,
          viewName,
          mapVal,
          ddocName,
          ddoc,
          json;

      $('#dashboard-content').scrollTop(0);

      if (!this.hasValidCode() || this.$('.js-new-ddoc-input:visible').val() === '') {
        designDocNameEmpty = this.$('.js-new-ddoc-input:visible').val() === '';
        errormessage = 'Please fix the Javascript errors and try again.';
        if (designDocNameEmpty) {
          errormessage = 'Enter a design doc name';
        }
        FauxtonAPI.addNotification({
          msg: errormessage,
          type: 'error',
          clear: true
        });
        return;
      }

      mapVal = this.mapEditor.getValue();
      reduceVal = this.reduceVal();
      viewName = this.$('.js-index-name').val();
      ddoc = this.getCurrentDesignDoc();
      ddocName = ddoc.id;
      this.viewNameChange = false;

      if (this.viewName !== viewName) {
        ddoc.removeDdocView(this.viewName);
        this.viewName = viewName;
        this.viewNameChange = true;
      }

      FauxtonAPI.addNotification({
        msg: 'Saving document.',
        clear: true
      });

      ddoc.setDdocView(viewName, mapVal, reduceVal);

      ddoc.save().then(function () {
        //on success
        afterSaveSuccess(ddoc, viewName, ddocName);
      }, function (xhr) {
        FauxtonAPI.addNotification({
          msg: 'Save failed: ' + xhr.responseJSON.reason,
          type: 'error',
          clear: true
        });
      });
    },

    afterSave: function (ddoc, viewName, ddocName){
      var reduceVal = this.reduceVal(),
          fragment;

      //add ddoc to the collection
      this.ddocs.add(ddoc);

      //trigger the EditSaved function on the map editor & reduce editor
      this.mapEditor.editSaved();
      this.reduceEditor && this.reduceEditor.editSaved();

      FauxtonAPI.addNotification({
        msg: 'View has been saved.',
        type: 'success',
        clear: true
      });

      FauxtonAPI.Events.trigger('indexes:newView');

      if (this.newView || this.viewNameChange) {
        fragment = '/database/' + this.database.safeID() +'/' + ddoc.safeID() + '/_views/' + app.utils.safeURLName(viewName);
        FauxtonAPI.navigate(fragment, {trigger: true});
        this.newView = false;
        this.ddocID = ddoc.safeID();
        this.viewName = viewName;
        this.ddocInfo = ddoc;
        this.render();
      }

      if (this.reduceFunStr !== reduceVal) {
        this.reduceFunStr = reduceVal;
        FauxtonAPI.Events.trigger('QueryOptions:updateQueryOptions', {hasReduce: this.hasReduce()});
      }
    },

    getCurrentDesignDoc: function () {
      return this.designDocSelector.getCurrentDesignDoc();
    },

    isCustomReduceEnabled: function () {
      return this.$('.js-reduce-function-selector').val() == 'CUSTOM';
    },

    mapVal: function () {
      if (this.mapEditor) {
        return this.mapEditor.getValue();
      }

      return this.$('#map-function').text();
    },

    reduceVal: function () {
      var reduceOption = this.$('.js-reduce-function-selector :selected').val();

      if (reduceOption === 'CUSTOM') {
        if (!this.reduceEditor) { this.createReduceEditor(); }
        return this.reduceEditor.getValue();
      }
      if (reduceOption !== 'NONE') {
        return reduceOption;
      }

      return '';
    },

    hasValidCode: function () {
      return _.every(['mapEditor', 'reduceEditor'], function (editorName) {
        var editor = this[editorName];
        if (editorName === 'reduceEditor' && ! this.isCustomReduceEnabled()) {
          return true;
        }
        return editor.hadValidCode();
      }, this);
    },

    serialize: function () {
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

    hasCustomReduce: function () {
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
        editorId: 'reduce-function',
        mode: 'javascript',
        couchJSHINT: true
      });
      this.reduceEditor.render();

      if (this.reduceEditor.getLines() === 1) {
        this.$('.js-beautify-reduce').removeClass('hide');
        this.$('.js-beautify-tooltip').tooltip();
      }
    },

    beforeRender: function () {
      var viewFilters = FauxtonAPI.getExtensions('sidebar:viewFilters'),
          filteredModels = this.ddocs.models,
          designDocs = this.ddocs.clone(),
          ddocDecode;

      if (this.newView) {
        this.reduceFunStr = '';
        if (this.ddocs.length === 0) {
          this.model = new Documents.Doc(null, {database: this.database});
        } else {
          this.model = this.ddocs.first().dDocModel();
        }
        this.ddocID = this.model.id;
      } else {
        ddocDecode = decodeURIComponent(this.ddocID);
        this.model = this.ddocs.get(this.ddocID).dDocModel();
        this.reduceFunStr = this.model.viewHasReduce(this.viewName);
      }

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

    afterRender: function () {
      this.designDocSelector.updateDesignDoc();
      this.showEditors();
    },

    showEditors: function () {
      this.mapEditor = new Components.Editor({
        editorId: 'map-function',
        mode: 'javascript',
        couchJSHINT: true
      });
      this.mapEditor.render();

      if (this.hasCustomReduce()) {
        this.createReduceEditor();
      } else {
        this.$('.js-reduce-function-group').hide();
      }

      if (this.newView) {
        this.mapEditor.setValue(this.langTemplates[this.defaultLang].map);
      }

      this.mapEditor.editSaved();
      this.reduceEditor && this.reduceEditor.editSaved();

      if (this.mapEditor.getLines() === 1) {
        this.$('.js-beautify-map').removeClass('hide');
        this.$('.js-beautify-tooltip').tooltip();
      }
    },

    beautifyCode: function (e) {
      e.preventDefault();
      var isReduce = $(e.currentTarget).hasClass('js-beautify-reduce'),
          targetEditor = isReduce ? this.reduceEditor : this.mapEditor,
          beautifiedCode = beautify(targetEditor.getValue());

      targetEditor.setValue(beautifiedCode);
    },

    cleanup: function () {
      this.mapEditor && this.mapEditor.remove();
      this.reduceEditor && this.reduceEditor.remove();
    }
  });

  Views.DesignDocSelector = FauxtonAPI.View.extend({
    template: 'addons/indexes/templates/design_doc_selector',

    events: {
      'change select.js-ddoc': 'updateDesignDoc'
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
      if (this.isNewDesignDoc()) {
        this.$('.js-new-ddoc-input').show();
      } else {
        this.$('.js-new-ddoc-input').hide();
      }
    },

    isNewDesignDoc: function () {
      return this.$('.js-ddoc').val() === 'new-doc';
    },

    getCurrentDesignDoc: function () {
      var ddocName = this.$('.js-ddoc').val(),
          doc,
          ddoc;

      if (this.isNewDesignDoc()) {
        doc = {
          _id: '_design/' + this.$('.js-new-ddoc-input').val(),
          views: {},
          language: 'javascript'
        };
        ddoc = new this.DocModel(doc, {database: this.database});
        return ddoc;
      }

      return this.collection.find(function (ddoc) {
        return ddoc.id === ddocName;
      }).dDocModel();
    }
  });

  return Views;
});
