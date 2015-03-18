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

  // Views
  "addons/documents/shared-views",
  "addons/documents/views-queryoptions",

  // React
  'addons/documents/header/header.react',
  'addons/documents/header/header.actions',
  'addons/documents/pagination/pagination.react',
  'addons/documents/pagination/actions',
  'addons/documents/pagination/stores',

  //plugins
  "plugins/prettify"
],

function (app, FauxtonAPI, Components, Documents,
  Databases, Views, QueryOptions, ReactHeader, ReactHeaderActions,
  ReactPagination, PaginationActions, PaginationStores) {

  function showError (msg) {
    FauxtonAPI.addNotification({
      msg: msg,
      type: 'error',
      clear:  true
    });
  }

  Views.Footer = FauxtonAPI.View.extend({
    afterRender: function () {
      ReactPagination.renderFooter(this.el);
    },

    cleanup: function () {
      ReactPagination.removeFooter(this.el);
    }
  });

  Views.ReactHeaderbar = FauxtonAPI.View.extend({
    afterRender: function () {
      ReactHeader.renderHeaderController(this.el);
    },

    cleanup: function () {
      this.disableHeader();
      ReactHeader.removeHeaderController(this.el);
    },

    disableHeader: function () {
      ReactHeaderActions.resetHeaderController();
    }
  });

  Views.RightAllDocsHeader = FauxtonAPI.View.extend({
    className: "header-right",
    template: "addons/documents/templates/all_docs_header",
    events: {
      'click .toggle-select-menu': 'selectAllMenu'
    },

    initialize: function(options) {
      this.database = options.database;
      this.params = options.params;

      _.bindAll(this);
      this.selectVisible = false;
      FauxtonAPI.Events.on('success:bulkDelete', this.selectAllMenu);

      // insert the Search Docs field
      this.headerSearch = this.insertView("#header-search", new Views.JumpToDoc({
        database: this.database,
        collection: this.database.allDocs
      }));

      // add the Query Options modal + header link
      this.queryOptions = this.insertView("#query-options", new QueryOptions.QueryOptionsTray({
        hasReduce: false,
        showStale: false
      }));
    },

    afterRender: function() {
      this.toggleQueryOptionsHeader(this.isHidden);
    },

    cleanup: function() {
      FauxtonAPI.Events.unbind('success:bulkDelete');
    },

    selectAllMenu: function(e) {
      FauxtonAPI.triggerRouteEvent("toggleSelectHeader");
      FauxtonAPI.Events.trigger("documents:showSelectAll",this.selectVisible);
    },

    // updates the API bar when the route changes
    updateApiUrl: function(api) {
      this.apiBar && this.apiBar.update(api);
    },

    // these are similar, but different! resetQueryOptions() completely resets the settings then overlays the new ones;
    // updateQueryOptions() just updates the existing settings with whatever is specified. Between them, the
    resetQueryOptions: function(options) {
      this.queryOptions.resetQueryOptions(options);
    },

    updateQueryOptions: function(options) {
      this.queryOptions.updateQueryOptions(options);
    },

    hideQueryOptions: function() {
      this.isHidden = true;
      if (this.hasRendered) {
        this.toggleQueryOptionsHeader(this.isHidden);
      }
    },

    showQueryOptions: function() {
      this.isHidden = false;
      if (this.hasRendered) {
        this.toggleQueryOptionsHeader(this.isHidden);
      }
    },

    toggleQueryOptionsHeader: function(hide) {
      $("#header-query-options").toggleClass("hide", hide);
    },

    serialize: function() {
      return {
        database: this.database.get('id')
      };
    }
  });


  Views.DeleteDBModal = Components.ModalView.extend({
    template: "addons/documents/templates/delete_database_modal",
    initialize: function (options) {
      this.database = options.database;
      this.isSystemDatabase = options.isSystemDatabase;
      FauxtonAPI.Events.on('database:delete', this.showDeleteDatabase, this);
    },

    serialize: function () {
      return {
        isSystemDatabase: this.isSystemDatabase,
        database: this.database
      };
    },

    showDeleteDatabase: function () {
      this.showModal();
    },

    cleanup: function() {
      FauxtonAPI.Events.off('database:delete', this.showDeleteDatabase);
    },

    events: {
      "click #delete-db-btn": "deleteDatabase",
      "submit #delete-db-check": "deleteDatabase"
    },

    deleteDatabase: function (event) {
      event.preventDefault();

      var enteredName = $('#db_name').val();
      if (this.database.id != enteredName) {
        this.set_error_msg(enteredName + " does not match the database name.");
        return;
      }

      this.hideModal();
      var databaseName = this.database.id;
      FauxtonAPI.addNotification({
        msg: "Deleting your database...",
        type: "error",
        clear: true
      });

      this.database.url = FauxtonAPI.urls('databaseBaseURL', 'server', this.database.safeID(), '');

      this.database.destroy().then(function () {
        FauxtonAPI.navigate(FauxtonAPI.urls('allDBs', 'app'));
        FauxtonAPI.addNotification({
          msg: 'The database <code>' + _.escape(databaseName) + '</code> has been deleted.',
          clear: true,
          escape: false // beware of possible XSS when the message changes
        });
      }).fail(function (rsp, error, msg) {
        FauxtonAPI.addNotification({
          msg: 'Could not delete the database, reason ' + msg + '.',
          type: 'error',
          clear: true
        });
      });
    }
  });

  Views.Document = FauxtonAPI.View.extend({
    template: "addons/documents/templates/all_docs_item",

    className: function () {
      var classNames = 'all-docs-item doc-row';

      if (this.checked) {
        classNames = classNames + ' js-to-delete';
      }

      return classNames;
    },

    initialize: function (options) {
      this.checked = options.checked;
    },

    events: {
      "dblclick .doc-item": "edit"
    },

    attributes: function() {
      return {
        "data-id": this.model.id
      };
    },

    serialize: function() {
      return {
        docIdentifier: this.model.isReducedShown() ? this.model.get('key') : this.model.get('_id'),
        doc: this.model,
        checked: this.checked
      };
    },

    beforeRender: function () {
      var extensions = FauxtonAPI.getExtensions('DocList:icons');
      _.each(extensions, function (View) {
        this.insertView('.doc-item-extension-icons', new View({ doc: this.model }));
      }, this);
    },

    establish: function() {
      return [this.model.fetch()];
    },

    edit: function(event) {
      event.preventDefault();
      if (!this.model.isReducedShown()) {
        FauxtonAPI.navigate(this.model.url('app'));
      }
    }
  });

  Views.AllDocsList = FauxtonAPI.View.extend({
    template: "addons/documents/templates/all_docs_list",

    className: function () {
      if (this.viewList) {
        return '';
      }
      return 'show-select';
    },

    events: {
      'change input': 'toggleDocument'
    },

    initialize: function (options) {
      this.rows = {};

      this.viewList = !!options.viewList;

      if (options.ddocInfo) {
        this.designDocs = options.ddocInfo.designDocs;
        this.ddocID = options.ddocInfo.id;
      }
      this.docParams = options.docParams || {};
      this.expandDocs = true;

      // some doclists don't have an option to delete
      if (!this.viewList) {
        this.bulkDeleteDocsCollection = options.bulkDeleteDocsCollection;
      }
    },

    removeDocuments: function (ids) {
      FauxtonAPI.when(ids.map(function (id) {
        return this.removeDocument(id);
      }.bind(this))).done(function () {
        FauxtonAPI.triggerRouteEvent('perPageChange', PaginationStores.indexPaginationStore.documentsLeftToFetch());
        FauxtonAPI.addNotification({
          msg: 'Successfully deleted your docs',
          clear:  true
        });

      }.bind(this));
    },

    removeDocument: function (id) {
      var that = this,
          deferred = FauxtonAPI.Deferred();

      if (!this.rows[id]) {
        return;
      }

      this.rows[id].$el.fadeOut('slow', function () {
        that.rows[id].remove();
        deferred.resolve();
      });

      return deferred;
    },

    showError: function (ids) {
      if (ids) {
        showError('Failed to delete: ' + ids.join(', '));
        return;
      }

      showError('Failed to delete your document!');
    },

    toggleDocument: function (event) {
      var $row = this.$(event.target).closest('.doc-row'),
          docId = $row.attr('data-id'),
          rev = this.collection.get(docId).get('_rev'),
          data = {_id: docId, _rev: rev, _deleted: true};

      if (!$row.hasClass('js-to-delete')) {
        this.bulkDeleteDocsCollection.add(data);
        $row.find('.js-row-select').prop('checked', true);
      } else {
        this.bulkDeleteDocsCollection.remove(this.bulkDeleteDocsCollection.get(docId));
        $row.find('.js-row-select').prop('checked', false);
      }

      $row.toggleClass('js-to-delete');

      ReactHeaderActions.updateDocumentCount({
        selectedOnPage: this.$('.js-to-delete').length,
        documentsOnPageCount: this.$('.doc-row').length
      });
    },

    establish: function() {
      if (this.newView) { return null; }

      return this.collection.fetch({reset: true}).then(function () {
        PaginationActions.collectionReset();
      }, function (model, xhr, options) {
          // TODO: handle error requests that slip through
          // This should just throw a notification, not break the page
          FauxtonAPI.addNotification({
            msg: "Bad Request",
            type: "error",
            clear:  true
          });

          //now redirect back to alldocs
          FauxtonAPI.navigate(model.database.url("index") + "?limit=100");
      });
    },

    toggleSelectAll: function (on) {
      this.selectAllBasedOnBoolean(on);
    },

    selectAllBasedOnBoolean: function (isActive) {
      var $allDocs = this.$('#doc-list'),
          $rows = $allDocs.find('.all-docs-item'),
          $checkboxes = $rows.find('input:checkbox'),
          modelsAffected,
          docs;

      $checkboxes.prop('checked', !isActive);
      $rows.toggleClass('js-to-delete', !isActive);

      if (isActive) {
        modelsAffected = _.reduce($rows, function (acc, el) {
          var docId = $(el).attr('data-id'),
              model = this.collection.get(docId);

          acc.push(model);
          return acc;
        }, [], this);

        this.bulkDeleteDocsCollection.remove(modelsAffected);
      } else {
        modelsAffected = _.reduce($rows, function (acc, el) {
          var docId = $(el).attr('data-id'),
              rev = this.collection.get(docId).get('_rev');

          acc.push({_id: docId, _rev: rev, _deleted: true});
          return acc;
        }, [], this);
        this.bulkDeleteDocsCollection.add(modelsAffected);
      }

      ReactHeaderActions.updateDocumentCount({
        selectedOnPage: this.$('.js-to-delete').length,
        documentsOnPageCount: this.$('.doc-row').length
      });
    },

    serialize: function() {
      return {
        endOfResults: !PaginationStores.indexPaginationStore.canShowNext()
      };
    },

    collapse: function () {
      if (this.expandDocs) {
        this.expandDocs = false;
      } else {
        this.expandDocs = true;
      }

      this.render();
    },

    bulkDelete: function() {
      var that = this,
          documentsLength = this.bulkDeleteDocsCollection.length,
          msg;

      msg = "Are you sure you want to delete these " + documentsLength + " docs?";
      if (documentsLength === 0 || !window.confirm(msg)) {
        return false;
      }

      this.bulkDeleteDocsCollection.bulkDelete();
    },

    cleanup: function () {
      this.allDocsNumber && this.allDocsNumber.remove();
      _.each(this.rows, function (row) {row.remove();});

      if (this.bulkDeleteDocsCollection) {
        this.bulkDeleteDocsCollection.reset();
      }
    },

    removeNestedViews: function () {
      _.each(this.rows, function (row) {
        row.remove();
      });
      this.rows = {};
    },

    beforeRender: function() {
      var docs;

      this.removeNestedViews();

      docs = this.expandDocs ? this.collection : this.collection.simple();

      docs.each(function(doc) {
        var isChecked;
        if (this.bulkDeleteDocsCollection) {
          isChecked = this.bulkDeleteDocsCollection.get(doc.id);
        }

        // the location of the ID attribute varies depending on the model. Also, for reduced view searches, the ID isn't
        // available so we use Backbone's own unique ID
        var id = _.has(doc, 'id') ? doc.id : doc.get('id');
        if (_.isUndefined(id)) {
          id = doc.cid;
        }

        this.rows[id] = this.insertView('#doc-list', new Views.Document({
          model: doc,
          checked: isChecked
        }));
      }, this);
    },

    afterRender: function () {
      $("#dashboard-content").scrollTop(0);

      prettyPrint();

      this.stopListening(FauxtonAPI.Events);
      this.listenTo(FauxtonAPI.Events, 'headerbar:collapse', this.collapse);
      this.listenTo(FauxtonAPI.Events, 'headerbar:selectall', this.toggleSelectAll);
      this.listenTo(FauxtonAPI.Events, 'headerbar:deleteselected', this.bulkDelete);

      if (this.bulkDeleteDocsCollection) {
        this.stopListening(this.bulkDeleteDocsCollection);
        this.listenTo(this.bulkDeleteDocsCollection, 'error', this.showError);
        this.listenTo(this.bulkDeleteDocsCollection, 'removed', this.removeDocuments);
      }

      ReactHeaderActions.updateDocumentCount({
        selectedOnPage: this.$('.js-to-delete').length,
        documentsOnPageCount: this.$('.doc-row').length
      });
    }

  });

  Views.JumpToDoc = FauxtonAPI.View.extend({
    template: "addons/documents/templates/jumpdoc",

    initialize: function (options) {
      this.database = options.database;
    },

    events: {
      "submit #jump-to-doc": "jumpToDoc"
    },

    jumpToDoc: function (event) {
      event.preventDefault();
      var docId = this.$('#jump-to-doc-id').val().trim();
      FauxtonAPI.navigate('/database/' + app.utils.safeURLName(this.database.id) +'/' + app.utils.safeURLName(docId), {trigger: true});
    },

    afterRender: function () {
     this.typeAhead = new Components.DocSearchTypeahead({el: '#jump-to-doc-id', database: this.database});
     this.typeAhead.render();
    }
  });



  Views.DdocInfo = FauxtonAPI.View.extend({
    template: "addons/documents/templates/ddoc_info",

    initialize: function (options) {
      this.ddocName = options.ddocName;
      this.refreshTime = options.refreshTime || 5000;
      this.listenTo(this.model, 'change', this.render);
    },

    establish: function () {
      return this.model.fetch();
    },

    afterRender: function(){
      this.startRefreshInterval();
    },

    serialize: function () {
      return {
        Ddoc: this.ddocName,
        view_index: this.model.get('view_index')
      };
    },

    startRefreshInterval: function () {
      var model = this.model;

      // Interval already set
      if (this.intervalId) { this.stopRefreshInterval(); }

      this.intervalId = setInterval(function () {
        model.fetch();
      }, this.refreshTime);
    },

    stopRefreshInterval: function () {
      clearInterval(this.intervalId);
    },

    cleanup: function () {
      this.stopRefreshInterval();
    }
  });

  Documents.Views = Views;

  return Documents;
});
