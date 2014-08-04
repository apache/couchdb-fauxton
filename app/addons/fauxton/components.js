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

define('ace_configuration', ["app", "ace/ace"], function (app, ace) {
  var path = app.host + app.root + 'js/ace';
  var config = require("ace/config");
  config.set("packaged", true);
  config.set("workerPath",path);
  config.set("modePath",path);
  config.set("themePath", path);
  return ace;
});

define([
  "app",
  // Libs
  "api",
  "ace_configuration",
  "spin",
  // this should never be global available:
  // https://github.com/zeroclipboard/zeroclipboard/blob/master/docs/security.md
  "plugins/zeroclipboard/ZeroClipboard"
],

function(app, FauxtonAPI, ace, spin, ZeroClipboard) {
  var Components = FauxtonAPI.addon();


  Components.Breadcrumbs = FauxtonAPI.View.extend({
    template: "addons/fauxton/templates/breadcrumbs",

    serialize: function() {
      var crumbs = _.clone(this.crumbs);
      return {
        crumbs: crumbs
      };
    },

    initialize: function(options) {
      this.crumbs = options.crumbs;
    }
  });

  Components.ApiBar = FauxtonAPI.View.extend({
    template: "addons/fauxton/templates/api_bar",
    endpoint: '_all_docs',

    documentation: 'docs',

    events:  {
      "click .api-url-btn" : "toggleAPIbar"
    },

    toggleAPIbar: function(e){
      var $currentTarget = $(e.currentTarget).find('span');
      if ($currentTarget.hasClass("fonticon-plus")){
        $currentTarget.removeClass("fonticon-plus").addClass("fonticon-minus");
      }else{
        $currentTarget.removeClass("fonticon-minus").addClass("fonticon-plus");
      }
      $('.api-navbar').toggle();
    },

    serialize: function() {
      return {
        endpoint: this.endpoint,
        documentation: this.documentation
      };
    },

    hide: function(){
      this.$el.addClass('hide');
    },
    show: function(){
      this.$el.removeClass('hide');
    },
    update: function(endpoint) {
      this.show();
      this.endpoint = endpoint[0];
      this.documentation = endpoint[1];
      this.render();
    },
    afterRender: function(){
      ZeroClipboard.config({ moviePath: "/assets/js/plugins/zeroclipboard/ZeroClipboard.swf" });
      var client = new ZeroClipboard(this.$(".copy-url"));
      client.on("load", function(e){
        var $apiInput = $('#api-navbar input');
        var copyURLTimer;
        client.on("mouseup", function(e){
          $apiInput.css("background-color","#aaa");
          window.clearTimeout(copyURLTimer);
          copyURLTimer = setInterval(function () {
            $apiInput.css("background-color","#fff");
          }, 200);
        });
      });
    }

  });




  Components.Pagination = FauxtonAPI.View.extend({
    template: "addons/fauxton/templates/pagination",

    initialize: function(options) {
      this.page = parseInt(options.page, 10);
      this.perPage = options.perPage;
      this.total = options.total;
      this.totalPages = Math.ceil(this.total / this.perPage);
      this.urlFun = options.urlFun;
    },

    serialize: function() {
      return {
        page: this.page,
        perPage: this.perPage,
        total: this.total,
        totalPages: this.totalPages,
        urlFun: this.urlFun
      };
    }
  });

  Components.IndexPagination = FauxtonAPI.View.extend({
    template: "addons/fauxton/templates/index_pagination",
    events: {
      "click a": 'scrollTo',
      "click a#next": 'nextClicked',
      "click a#previous": 'previousClicked'
    },

    scrollTo: function () {
      if (!this.scrollToSelector) { return; }
      $(this.scrollToSelector).animate({ scrollTop: 0 }, 'slow');
    },

    initialize: function (options) {
      this.previousUrlfn = options.previousUrlfn;
      this.nextUrlfn = options.nextUrlfn;
      this.scrollToSelector = options.scrollToSelector;
      _.bindAll(this);
      this.docLimit = options.docLimit || 1000000;
      this.perPage = options.perPage || 20;
      this.setDefaults();
    },

    setDefaults: function () {
      this._pageNumber = [];
      this._pageStart = 1;
      this.enabled = true;
      this.currentPage = 1;
    },

    canShowPreviousfn: function () {
      if (!this.enabled) { return this.enabled; }
      return this.collection.hasPrevious();
    },

    canShowNextfn: function () {
      if (!this.enabled) { return this.enabled; }

      if ((this.pageStart() + this.perPage) >= this.docLimit) {
        return false;
      }

      return this.collection.hasNext();
    },

    previousClicked: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (!this.canShowPreviousfn()) { return; }

      this.decPageNumber();

      FauxtonAPI.triggerRouteEvent('paginate', {
       direction: 'previous',
       perPage: this.perPage,
       currentPage: this.currentPage
      });
    },

    documentsLeftToFetch: function () {
      var documentsLeftToFetch = this.docLimit - this.totalDocsViewed(),
          limit = this.perPage;

      if (documentsLeftToFetch < this.perPage ) {
        limit = documentsLeftToFetch;
      }

      return limit;
    },

    nextClicked: function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (!this.canShowNextfn()) { return; }

      this.incPageNumber();

      FauxtonAPI.triggerRouteEvent('paginate', {
       direction: 'next',
       perPage: this.documentsLeftToFetch(),
       currentPage: this.currentPage
      });

    },

    serialize: function () {
      return {
        canShowNextfn: this.canShowNextfn,
        canShowPreviousfn: this.canShowPreviousfn,
      };
    },

    updatePerPage: function (newPerPage) {
      this.setDefaults();
      this.perPage = newPerPage;
    },

    page: function () {
      return this._pageStart - 1;
    },

    incPageNumber: function () {
      this.currentPage = this.currentPage + 1;
      this._pageNumber.push({perPage: this.perPage});
      this._pageStart = this._pageStart + this.perPage;
    },

    totalDocsViewed: function () {
      return _.reduce(this._pageNumber, function (total, value) {
        return total + value.perPage;
      }, 0);
    },

    decPageNumber: function () {
      this.currentPage = this.currentPage - 1;
      this._pageNumber.pop();
      var val = this._pageStart - this.perPage;
      if (val < 1) {
        val = 1;
      }

      this._pageStart = val;
    },

    pageStart: function () {
      return this._pageStart;
    },

    pageEnd: function () {
      return this.page() + this.collection.length;
    },

    disable: function () {
      this.enabled = false;
    },

    enable: function () {
      this.enabled = true;
    },

    setCollection: function (collection) {
      this.collection = collection;
      this.setDefaults();
    },

  });



  Components.ModalView = FauxtonAPI.View.extend({

    disableLoader: true,

    initialize: function (options) {
      _.bindAll(this);
    },

    showModal: function () {
      if (this._showModal){ this._showModal();}
      this.clear_error_msg();
      this.$('.modal').modal();
      // hack to get modal visible
      $('.modal-backdrop').css('z-index',1025);
    },

    hideModal: function () {
      this.$('.modal').modal('hide');
    },

    set_error_msg: function (msg) {
      var text;
      if (typeof(msg) == 'string') {
        text = msg;
      } else {
        text = JSON.parse(msg.responseText).reason;
      }
      this.$('#modal-error').text(text).removeClass('hide');
    },

    clear_error_msg: function () {
      this.$('#modal-error').text(' ').addClass('hide');
    },

    serialize: function () {
      if (this.model){
        return this.model.toJSON();
      }
      return {};
    }
  });

  //TODO allow more of the typeahead options.
  //Current this just does what we need but we
  //need to support the other typeahead options.
  Components.Typeahead = FauxtonAPI.View.extend({

    initialize: function (options) {
      this.source = options.source;
      this.onUpdate = options.onUpdate;
      _.bindAll(this);
    },

    afterRender: function () {
      var onUpdate = this.onUpdate;

      this.$el.typeahead({
        source: this.source,
        updater: function (item) {
          if (onUpdate) {
            onUpdate(item);
          }

          return item;
        }
      });
    }

  });

  Components.DbSearchTypeahead = Components.Typeahead.extend({
    initialize: function (options) {
      this.dbLimit = options.dbLimit || 30;
      this.onUpdate = options.onUpdate;
      _.bindAll(this);
    },
    source: function(query, process) {
      var url = [
        app.host,
        "/_all_dbs?startkey=%22",
        query,
        "%22&endkey=%22",
        query,
        "\u9999",
        "%22&limit=",
        this.dbLimit
      ].join('');

      if (this.ajaxReq) { this.ajaxReq.abort(); }

      this.ajaxReq = $.ajax({
        cache: false,
        url: url,
        dataType: 'json',
        success: function(data) {
          process(data);
        }
      });
    }
  });

  Components.DocSearchTypeahead = Components.Typeahead.extend({
    initialize: function (options) {
      this.docLimit = options.docLimit || 30;
      this.database = options.database;
      _.bindAll(this);
    },
    source: function(query, process) {
      var url = [
        app.host,
        "/",
        this.database.id,
        "/_all_docs?startkey=%22",
        query,
        "%22&endkey=%22",
        query,
        "\u9999",
        "%22&limit=",
        this.docLimit
      ].join('');

      if (this.ajaxReq) { this.ajaxReq.abort(); }

      this.ajaxReq = $.ajax({
        cache: false,
        url: url,
        dataType: 'json',
        success: function(data) {
          var ids = _.map(data.rows, function (row) {
            return row.id;
          });
          process(ids);
        }
      });
    }
  });

  Components.FilteredView = FauxtonAPI.View.extend({
    filters: [],
    createFilteredData: function (json) {
      var that = this;
      return _.reduce(this.filters, function (elements, filter) {
        return _.filter(elements, function (element) {
          var match = false;
          _.each(element, function (value) {
            if (new RegExp(filter, 'i').test(value.toString())) {
              match = true;
            }
          });
          return match;
        });
      }, json, this);
    }
  });

  Components.FilterView = FauxtonAPI.View.extend({
    template: "addons/fauxton/templates/filter",

    initialize: function (options) {
      this.eventNamespace = options.eventNamespace;
      this.tooltipText = options.tooltipText;
    },

    events: {
      "submit .js-filter-form": "filterItems"
    },

    serialize: function () {
      return {
        tooltipText: this.tooltipText
      };
    },

    filterItems: function (event) {
      event.preventDefault();
      var $filter = this.$('input[name="filter"]'),
          filter = $.trim($filter.val());

      if (!filter) {
        return;
      }

      FauxtonAPI.triggerRouteEvent(this.eventNamespace + "FilterAdd", filter);

      this.insertView(".filter-list", new Components.FilterItemView({
        filter: filter,
        eventNamespace: this.eventNamespace
      })).render();

      $filter.val('');
    },

    afterRender: function () {
      if (this.tooltipText) {
        this.$el.find(".js-filter-tooltip").tooltip();
      }
    }
  });

  Components.FilterItemView = FauxtonAPI.View.extend({
    template: "addons/fauxton/templates/filter_item",
    tagName: "li",

    initialize: function (options) {
      this.filter = options.filter;
      this.eventNamespace = options.eventNamespace;
    },

    events: {
      "click .js-remove-filter": "removeFilter"
    },

    serialize: function () {
      return {
        filter: this.filter
      };
    },

    removeFilter: function (event) {
      event.preventDefault();

      FauxtonAPI.triggerRouteEvent(this.eventNamespace + "FilterRemove", this.filter);
      this.remove();
    }

  });

  Components.Editor = FauxtonAPI.View.extend({
    initialize: function (options) {
      this.editorId = options.editorId;
      this.mode = options.mode || "json";
      this.commands = options.commands;
      this.theme = options.theme || 'crimson_editor';
      this.couchJSHINT = options.couchJSHINT;
      this.edited = false;

      _.bindAll(this);
    },

    afterRender: function () {
      this.editor = ace.edit(this.editorId);
      this.setHeightToLineCount();

      this.editor.setTheme("ace/theme/" + this.theme);

      if (this.mode != "plain") {
        this.editor.getSession().setMode("ace/mode/" + this.mode);
      }

      this.editor.setShowPrintMargin(false);
      this.addCommands();

      if (this.couchJSHINT) {
        this.removeIncorrectAnnotations();
      }

      var that = this;
      this.editor.getSession().on('change', function () {
        that.setHeightToLineCount();
        that.edited = true;
      });

      $(window).on('beforeunload.editor', function() {
        if (that.edited) {
          return 'Your changes have not been saved. Click cancel to return to the document.';
        }
      });

      FauxtonAPI.beforeUnload("editor", function (deferred) {
        if (that.edited) {
          return 'Your changes have not been saved. Click cancel to return to the document.';
        }
      });
    },

    cleanup: function () {
      $(window).off('beforeunload.editor');
      FauxtonAPI.removeBeforeUnload("editor");
    },

    setHeightToLineCount: function () {
      var lines = this.editor.getSession().getDocument().getLength();
      this.editor.setOptions({
        maxLines: lines
      });

      this.editor.resize();
    },

    getLines: function(){
     return this.editor.getSession().getDocument().getLength();
    },

    addCommands: function () {
      _.each(this.commands, function (command) {
        this.editor.commands.addCommand(command);
      }, this);
    },

    removeIncorrectAnnotations: function () {
      var editor = this.editor,
          isIgnorableError = this.isIgnorableError;

      this.editor.getSession().on("changeAnnotation", function () {
        var annotations = editor.getSession().getAnnotations();

        var newAnnotations = _.reduce(annotations, function (annotations, error) {
          if (!isIgnorableError(error.raw)) {
            annotations.push(error);
          }
          return annotations;
        }, []);

        if (annotations.length !== newAnnotations.length) {
          editor.getSession().setAnnotations(newAnnotations);
        }
      });
    },

    editSaved: function () {
      this.edited = false;
    },

    setReadOnly: function (value) {
      return this.editor.setReadOnly(value);
    },

    setValue: function (data, lineNumber) {
      lineNumber = lineNumber ? lineNumber : -1;
      this.editor.setValue(data, lineNumber);
    },

    getValue: function () {
      return this.editor.getValue();
    },

    getAnnotations: function () {
      return this.editor.getSession().getAnnotations();
    },

    hadValidCode: function () {
     var errors = this.getAnnotations();
     // By default CouchDB view functions don't pass lint
     return _.every(errors, function(error) {
      return this.isIgnorableError(error.raw);
      },this);
    },

    // List of JSHINT errors to ignore
    // Gets around problem of anonymous functions not being a valid statement
    excludedViewErrors: [
      "Missing name in function declaration.",
      "['{a}'] is better written in dot notation."
    ],

    isIgnorableError: function(msg) {
      return _.contains(this.excludedViewErrors, msg);
    },

    configureFixedHeightEditor: function(numLines) {
      this.editor.renderer.setVScrollBarAlwaysVisible(true);
      this.editor.renderer.setHScrollBarAlwaysVisible(true);
      /* customize the ace scrolling for static edit height */
      this.editor.renderer.$autosize = function() {
        this.$size.height = numLines * this.lineHeight;
        this.desiredHeight = numLines * this.lineHeight;
        this.container.style.height = this.desiredHeight + "px";
        this.scrollBarV.setVisible(true);
        this.scrollBarH.setVisible(true);
      };
    },

    replaceCurrentLine: function(replacement) {
      this.editor.getSelection().selectLine();
      this.editor.insert(replacement);
      this.editor.getSelection().moveCursorUp();
    },

    getLine: function(lineNum) {
      return this.editor.session.getLine(lineNum);
    },

    getSelectionStart: function() {
      return this.editor.getSelectionRange().start;
    },

    getSelectionEnd: function() {
      return this.editor.getSelectionRange().end;
    },

    getRowHeight: function() {
      return this.editor.renderer.layerConfig.lineHeight;
    },

    isRowExpanded: function(row) {
      return !this.editor.getSession().isRowFolded(row);
    },

    documentToScreenRow: function(row) {
      return this.editor.getSession().documentToScreenRow(row, 0);
    }

  });


  //Menu Drop down component. It takes links in this format and renders the Dropdown:
  // [{
  //  title: 'Section Title (optional)',
  //  links: [{
  //    icon: 'icon-class (optional)',
  //    url: 'clickalble-url',
  //    title: 'name of link'
  //  }]
  // }]
  Components.MenuDropDown = FauxtonAPI.View.extend({
    template: "addons/fauxton/templates/menu_dropdown",
    className: "dropdown",
    initialize: function(options){
      this.links = options.links;
      this.icon = options.icon || "fonticon-plus-circled2";
    },
    serialize: function(){
      return {
        links: this.links,
        icon: this.icon
      };
    }
  });

  Components.Clipboard = FauxtonAPI.View.extend({
    initialize: function (options) {
      this.$el = options.$el;
      this.moviePath = FauxtonAPI.getExtensions('zeroclipboard:movielist')[0];

      if (_.isUndefined(this.moviePath)) {
       this.moviePath = app.host + app.root + "js/zeroclipboard/ZeroClipboard.swf";
      }

      ZeroClipboard.config({ moviePath: this.moviePath });
      this.client = new ZeroClipboard(this.$el);
    },

    on: function () {
      return this.client.on.apply(this.client, arguments);
    }

  });


  //need to make this into a backbone view...
  var routeObjectSpinner;
  FauxtonAPI.RouteObject.on('beforeEstablish', function (routeObject) {
    if (!routeObject.disableLoader){
      var opts = {
        lines: 16, // The number of lines to draw
        length: 8, // The length of each line
        width: 4, // The line thickness
        radius: 12, // The radius of the inner circle
        color: '#333', // #rbg or #rrggbb
        speed: 1, // Rounds per second
        trail: 10, // Afterglow percentage
        shadow: false // Whether to render a shadow
     };

     if (routeObjectSpinner) { return; }

     if (!$('.spinner').length) {
       $('<div class="spinner"></div>')
        .appendTo('#app-container');
     }

     routeObjectSpinner = new Spinner(opts).spin();
     $('.spinner').append(routeObjectSpinner.el);
   }
  });

  var removeRouteObjectSpinner = function () {
    if (routeObjectSpinner) {
      routeObjectSpinner.stop();
      routeObjectSpinner = null;
      $('.spinner').remove();
    }
  };

  var removeViewSpinner = function (selector) {
    var viewSpinner = viewSpinners[selector];

    if (viewSpinner){
      viewSpinner.stop();
      $(selector).find('.spinner').remove();
      delete viewSpinners[selector];
    }
  };

  var viewSpinners = {};
  FauxtonAPI.RouteObject.on('beforeRender', function (routeObject, view, selector) {
    removeRouteObjectSpinner();

    if (!view.disableLoader){
      var opts = {
        lines: 16, // The number of lines to draw
        length: 8, // The length of each line
        width: 4, // The line thickness
        radius: 12, // The radius of the inner circle
        color: '#333', // #rbg or #rrggbb
        speed: 1, // Rounds per second
        trail: 10, // Afterglow percentage
        shadow: false // Whether to render a shadow
      };

      var viewSpinner = new Spinner(opts).spin();
      $('<div class="spinner"></div>')
        .appendTo(selector)
        .append(viewSpinner.el);

      viewSpinners[selector] = viewSpinner;
    }
  });

  FauxtonAPI.RouteObject.on('afterRender', function (routeObject, view, selector) {
    removeViewSpinner(selector);
  });

  FauxtonAPI.RouteObject.on('viewHasRendered', function (view, selector) {
    removeViewSpinner(selector);
    removeRouteObjectSpinner();
  });


  return Components;
});

