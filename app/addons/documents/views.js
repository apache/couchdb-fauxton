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

  //Views
  "addons/documents/views-sidebar",
  "addons/documents/views-advancedopts",
  // Libs
  "addons/fauxton/resizeColumns",
  //plugins
  "plugins/prettify"
],

function(app, FauxtonAPI, Components, Documents, Databases, Views, QueryOptions,
         resizeColumns, prettify) {

  function showError (msg) {
    FauxtonAPI.addNotification({
      msg: msg,
      type: 'error',
      clear:  true
    });
  }

  //Header for alldocs with search, Query options,& api bar
  Views.RightAllDocsHeader = FauxtonAPI.View.extend({
    className: "header-right",
    template: "addons/documents/templates/header_alldocs",
    events: {
      'click .toggle-select-menu': 'selectAllMenu'
    },

    initialize: function(options){
      //adding the database to the object
      this.database = options.database;
      _.bindAll(this);
      this.selectVisible = false;
      FauxtonAPI.Events.on('advancedOptions:updateView', this.updateAllDocs);
      FauxtonAPI.Events.on('success:bulkDelete', this.selectAllMenu);
    },

    selectAllMenu: function(e){
      FauxtonAPI.triggerRouteEvent("toggleSelectHeader");
      FauxtonAPI.Events.trigger("documents:show-select-all",this.selectVisible);
    },

    addAllDocsMenu: function(){
      //search docs
      this.headerSearch = this.insertView("#header-search", new Views.JumpToDoc({
        database: this.database,
        collection: this.database.allDocs
      }));
      //insert queryoptions
      //that file is included in require() above and the argument is QueryOptions
      // and it wants all these params:
      /* Sooooo I searched this file for where Advanced options was originally inserted to see what the hell
         is happening.  and it's in AllDocsLayout.  So I'm going to move some of those functions over here

        These are required:
        this.database = options.database;
        this.updateViewFn = options.updateViewFn;
        this.previewFn = options.previewFn;

        these are booleans:
        this.showStale = _.isUndefined(options.showStale) ? false : options.showStale;
        this.hasReduce = _.isUndefined(options.hasReduce) ? true : options.hasReduce;

        these you only need for view indexes, not all docs because they are about
        specific views and design docs (ddocs, also views live inside a ddoc):
        this.viewName = options.viewName;
        this.ddocName = options.ddocName;
      */

      this.queryOptions = this.insertView("#query-options", new QueryOptions.AdvancedOptions({
        database: this.database,
        hasReduce: false,
        showPreview: false,
      }));

      //Moved the apibar view into the components file so you can include it in your views
      this.apiBar = this.insertView("#header-api-bar", new Components.ApiBar({}));

      this.apiBar.render();
      this.queryOptions.render();
      this.headerSearch.render();
    },

    updateApiUrl: function(api){
      //this will update the api bar when the route changes
      //you can find the method that updates it in components.js Components.ApiBar()
      this.apiBar && this.apiBar.update(api);
    },

    serialize: function() {
      //basically if you want something in a template, You can define it here
      return {
        database: this.database.get('id')
      };
    },

    beforeRender:function(){
      this.addAllDocsMenu();
    },

    //moved from alldocs layout
    updateAllDocs: function (event, paramInfo) {
      event.preventDefault();

      var errorParams = paramInfo.errorParams,
          params = paramInfo.params;

      if (_.any(errorParams)) {
        _.map(errorParams, function(param) {

          // TODO: Where to add this error?
          // bootstrap wants the error on a control-group div, but we're not using that
          //$('form.view-query-update input[name='+param+'], form.view-query-update select[name='+param+']').addClass('error');
          return FauxtonAPI.addNotification({
            msg: "JSON Parse Error on field: "+param.name,
            type: "error",
            selector: ".advanced-options .errors-container",
            clear:  true
          });
        });
        FauxtonAPI.addNotification({
          msg: "Make sure that strings are properly quoted and any other values are valid JSON structures",
          type: "warning",
          selector: ".advanced-options .errors-container",
          clear:  true
        });

        return false;
      }

      var fragment = window.location.hash.replace(/\?.*$/, '');

      if (!_.isEmpty(params)) {
        fragment = fragment + '?' + $.param(params);
      }

      FauxtonAPI.navigate(fragment, {trigger: false});
      FauxtonAPI.triggerRouteEvent('updateAllDocs', {allDocs: true});
    }
  });

  // select docs header
  Views.SelectMenuHeader = FauxtonAPI.View.extend({
    className: "header-right",
    template:"addons/documents/templates/select-doc-menu",
    events: {
      "click button.all": "selectAll",
      "click button.js-bulk-delete": "bulkDelete",
      "click #collapse": "collapse",
      'click .toggle-select-menu': 'selectAllMenu'
    },

    selectAllMenu: function(e){
      FauxtonAPI.triggerRouteEvent("toggleSelectHeader");
      FauxtonAPI.Events.trigger("documents:show-select-all",this.selectVisible);
    },

    bulkDelete: function(){
      FauxtonAPI.Events.trigger("documents:bulkDelete");
    },
    selectAll: function(evt){
      this.$(evt.target).toggleClass('active');

      FauxtonAPI.Events.trigger("documents:selectAll", this.$(evt.target).hasClass('active'));
    },
    collapse: function(evt){
      var icon = this.$(evt.target).find('i');
      icon.toggleClass('icon-minus');
      icon.toggleClass('icon-plus');
      FauxtonAPI.Events.trigger("documents:collapse");
    }
  });


  Views.DeleteDBModal = Components.ModalView.extend({
    template: "addons/documents/templates/delete_database_modal",

    events: {
      "click #delete-db-btn": "deleteDatabase",
      "submit #delete-db-check": "deleteDatabase"
    },

    deleteDatabase: function (event) {
      event.preventDefault();
      var enterredName = this.$('#db_name')[0].value;
      if (this.database.id != enterredName) {
        this.set_error_msg(enterredName + " does not match database id - are you sure you want to delete " + this.database.id + "?");
        return;
      }
      this.hideModal();
      var databaseName = this.database.id;
      FauxtonAPI.addNotification({
        msg: "Deleting your database...",
        type: "error",
        clear: true
      });

      this.database.destroy().then(function () {
        FauxtonAPI.navigate('#/_all_dbs');
        FauxtonAPI.addNotification({
          msg: 'The database <code>' + _.escape(databaseName) + '</code> has been deleted.',
          clear: true,
          type: "error",
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
    className: function(){
      return (this.showSelect? "showSelect":"") + " all-docs-item doc-row";
    },
    initialize: function (options) {
      this.checked = options.checked;
      this.expanded = options.expanded;
      this.showSelect = false;
      _.bindAll(this);
      FauxtonAPI.Events.on("documents:show-select-all", this.showSelectBox);
      FauxtonAPI.Events.on("documents:collapse", this.collapse);
      FauxtonAPI.Events.on("documents:selectAll", this.selectAll);
    },

    showSelectBox: function(bool){
      this.$el.toggleClass('showSelect');
    },

    selectAll: function(checked){
      this.$("input:checkbox").prop('checked', checked).trigger('click');
    },

    collapse: function(bool){
      this.collapse = bool;
      this.$('.doc-data').toggle(this.collapse);
    },

    events: {
      "click button.delete": "destroy",
      "dblclick pre.prettyprint": "edit"
    },

    attributes: function() {
      return {
        "data-id": this.model.id
      };
    },

    serialize: function() {
      return {
        expanded: this.expanded,
        docID: this.model.get('_id'),
        doc: this.model,
        checked: this.checked
      };
    },

    establish: function() {
      return [this.model.fetch()];
    },

    edit: function(event) {
      event.preventDefault();
      FauxtonAPI.navigate("#" + this.model.url('web-index'));
    },

    destroy: function(event) {
      event.preventDefault();
      var that = this;

      if (!window.confirm("Are you sure you want to delete this doc?")) {
        return false;
      }
      var storeID = _.clone(this.model);
      this.model.destroy().then(function(resp) {
        FauxtonAPI.addNotification({
          msg: "Doc "+storeID.get('id')+" has been deleted.",
          type: "error",
          clear:  true
        });
        that.$el.fadeOut(function () {
          that.remove();
        });

        that.model.collection.remove(that.model.id);
        if (!!that.model.id.match('_design')) {
          FauxtonAPI.triggerRouteEvent('reloadDesignDocs');
        }
      }, function(resp) {
        FauxtonAPI.addNotification({
          msg: "Failed to deleted your doc!",
          type: "error",
          clear:  true
        });
      });
    }
  });



  Views.AllDocsNumber = FauxtonAPI.View.extend({
    template: "addons/documents/templates/all_docs_number",

    initialize: function (options) {
      this.newView = options.newView || false;
      this.pagination = options.pagination;
      _.bindAll(this);

      this._perPage = options.perPageDefault || 20;
      this.listenTo(this.collection, 'totalRows:decrement', this.render);
    },

    events: {
      'change #select-per-page': 'updatePerPage'
    },

    updatePerPage: function (event) {
      this._perPage = parseInt(this.$('#select-per-page :selected').val(), 10);
      this.pagination.updatePerPage(this.perPage());
      FauxtonAPI.triggerRouteEvent('perPageChange', this.pagination.documentsLeftToFetch());
    },

    afterRender: function () {
      this.$('option[value="' + this.perPage() + '"]').attr('selected', "selected");
    },

    serialize: function () {
       var totalRows = 0,
          updateSeq = false,
          pageStart = 0,
          pageEnd = 20;

      if (!this.newView) {
        totalRows = this.collection.length;
        updateSeq = this.collection.updateSeq();
      }

      if (this.pagination) {
        pageStart = this.pagination.pageStart();
        pageEnd =  this.pagination.pageEnd();
      }

      return {
        database: app.utils.safeURLName(this.collection.database.id),
        updateSeq: updateSeq,
        totalRows: totalRows,
        pageStart: pageStart,
        pageEnd: pageEnd
      };
    },

    perPage: function () {
      return this._perPage;
    },

    setCollection: function (collection) {
      this.collection = collection;
    }

  });


  // TODO: Rename to reflect that this is a list of rows or documents
  Views.AllDocsList = FauxtonAPI.View.extend({
    template: "addons/documents/templates/all_docs_list",
    events: {
      "click .all-docs-item": "toggleDocument",
      "click #js-end-results": "scrollToQuery"
    },

    initialize: function (options) {
      _.bindAll(this);
      this.nestedView = options.nestedView || Views.Document;
      this.rows = {};
      this.viewList = !!options.viewList;

      if (options.ddocInfo) {
        this.designDocs = options.ddocInfo.designDocs;
        this.ddocID = options.ddocInfo.id;
      }
      this.newView = options.newView || false;
      this.docParams = options.docParams || {};
      this.params = options.params || {};
      this.expandDocs = true;
      this.perPageDefault = this.docParams.limit || 20;

      // some doclists don't have an option to delete
      if (!this.viewList) {
        this.bulkDeleteDocsCollection = options.bulkDeleteDocsCollection;
      }

      FauxtonAPI.Events.on("documents:bulkDelete", this.bulkDelete);
      FauxtonAPI.Events.on("documents:selectAll", this.toggleTrash);
    },

    removeDocuments: function (ids) {
      _.each(ids, function (id) {
        this.removeDocument(id);
      }, this);

      this.pagination.updatePerPage(parseInt(this.$('#select-per-page :selected').val(), 10));
      FauxtonAPI.triggerRouteEvent('perPageChange', this.pagination.documentsLeftToFetch());
    },

    removeDocument: function (id) {
      var that = this;

      if (!this.rows[id]) {
        return;
      }

      this.rows[id].$el.fadeOut('slow', function () {
        that.rows[id].remove();
      });
    },

    showError: function (ids) {
      if (ids) {
        showError('Failed to delete: ' + ids.join(', '));
        return;
      }

      showError('Failed to delete your doc!');
    },

    toggleDocument: function (event) {
      var $row = this.$(event.target).closest('.doc-row'),
          docId = $row.attr('data-id'),
          rev = this.collection.get(docId).get('_rev'),
          data = {_id: docId, _rev: rev, _deleted: true};

      if (!$row.hasClass('js-to-delete')) {
        this.bulkDeleteDocsCollection.add(data);
      } else {
        this.bulkDeleteDocsCollection.remove(this.bulkDeleteDocsCollection.get(docId));
      }

      $row.find('.js-row-select').prop('checked', !$row.hasClass('js-to-delete'));
      $row.toggleClass('js-to-delete');

      this.toggleTrash();
    },

    toggleTrash: function () {
      var $bulkdDeleteButton = this.$('.js-bulk-delete');

      if (this.bulkDeleteDocsCollection && this.bulkDeleteDocsCollection.length > 0) {
        $bulkdDeleteButton.removeClass('disabled');
      } else {
        $bulkdDeleteButton.addClass('disabled');
      }
    },

    scrollToQuery: function () {
      $('#dashboard-content').animate({ scrollTop: 0 }, 'slow');
    },

    establish: function() {
      if (this.newView) { return null; }

      return this.collection.fetch({
        reset: true,
        success:  function() { },
        error: function(model, xhr, options){
          // TODO: handle error requests that slip through
          // This should just throw a notification, not break the page
          FauxtonAPI.addNotification({
            msg: "Bad Request",
            type: "error",
            clear:  true
          });

          //now redirect back to alldocs
          FauxtonAPI.navigate(model.database.url("index") + "?limit=100");
        }
      });
    },

    serialize: function() {
      return {
        resizeLayout: this.viewList?"-half":"",
        endOfResults: !this.pagination.canShowNextfn()
      };
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

    addPagination: function () {
      this.pagination = new Components.IndexPagination({
        collection: this.collection,
        scrollToSelector: '#dashboard-content',
        docLimit: this.params.limit,
        perPage: this.perPageDefault
      });
    },

    cleanup: function () {
      this.pagination && this.pagination.remove();
      this.allDocsNumber && this.allDocsNumber.remove();
      _.each(this.rows, function (row) {row.remove();});
    },

    beforeRender: function() {
      var docs;

      if (!this.pagination) {
        this.addPagination();
      }

      this.insertView('#documents-pagination', this.pagination);

      if (!this.allDocsNumber) {
        this.allDocsNumber = new Views.AllDocsNumber({
          collection: this.collection,
          newView: this.newView,
          pagination: this.pagination,
          perPageDefault: this.perPageDefault
        });
      }

      this.setView('#item-numbers', this.allDocsNumber);

      docs = this.expandDocs ? this.collection : this.collection.simple();

      docs.each(function(doc) {
        var isChecked;
        if (this.bulkDeleteDocsCollection) {
          isChecked = this.bulkDeleteDocsCollection.get(doc.id);
        }
        this.rows[doc.id] = this.insertView("#doc-list", new this.nestedView({
          model: doc,
          expanded: this.expandDocs,
          checked: isChecked
        }));
      }, this);
    },

    setCollection: function (collection) {
      this.collection = collection;
      this.pagination.setCollection(collection);
      this.allDocsNumber.setCollection(collection);
    },

    setParams: function (docParams, urlParams) {
      this.docParams = docParams;
      this.params = urlParams;
      this.perPageDefault = this.docParams.limit;

      if (this.params.limit) {
        this.pagination.docLimit = this.params.limit;
      }
    },

    afterRender: function () {
      prettyPrint();

      if (this.bulkDeleteDocsCollection) {
        this.stopListening(this.bulkDeleteDocsCollection);
        this.listenTo(this.bulkDeleteDocsCollection, 'error', this.showError);
        this.listenTo(this.bulkDeleteDocsCollection, 'removed', this.removeDocuments);
        this.listenTo(this.bulkDeleteDocsCollection, 'updated', this.toggleTrash);
      }

      this.toggleTrash();
      this.setPaginationWidth();
    },
    setPaginationWidth: function(){
      this.$('#documents-pagination').css('width', this.$el.outerWidth());
    },
    perPage: function () {
      return this.allDocsNumber.perPage();
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
