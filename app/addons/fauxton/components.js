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
  config.set("workerPath", path);
  config.set("modePath", path);
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
  "plugins/zeroclipboard/ZeroClipboard",
  "velocity.ui"
],

function (app, FauxtonAPI, ace, spin, ZeroClipboard) {
  var Components = FauxtonAPI.addon();

  // setting up the left header with the backbutton used in Views and All docs
  Components.LeftHeader = FauxtonAPI.View.extend({
    className: "header-left",
    template: "addons/fauxton/templates/header_left",

    initialize: function (options) {
      this.dropdownEvents = options.dropdownEvents;
      this.dropdownMenuLinks = options.dropdownMenu;
      this.lookaheadTrayOptions = options.lookaheadTrayOptions || null;
      this.crumbs = options.crumbs || [];

      // listen for breadcrumb clicks
      this.listenTo(FauxtonAPI.Events, 'breadcrumb:click', this.toggleTray);
      this.listenTo(FauxtonAPI.Events, 'lookaheadTray:close', this.unselectLastBreadcrumb);
    },

    updateCrumbs: function (crumbs) {

      // if the breadcrumbs haven't changed, don't bother re-rendering the component
      if (_.isEqual(this.crumbs, crumbs)) {
        return;
      }

      this.crumbs = crumbs;
      this.breadcrumbs && this.breadcrumbs.update(crumbs);
    },

    unselectLastBreadcrumb: function () {
      this.breadcrumbs.unselectLastBreadcrumb();
    },

    toggleTray: function () {
      if (this.lookaheadTray !== null) {
        this.lookaheadTray.toggleTray();
      }
    },

    beforeRender: function () {
      this.setUpCrumbs();
      this.setUpDropDownMenu();

      if (this.lookaheadTray !== null) {
        this.setUpLookaheadTray();
      }
    },

    setUpCrumbs: function () {
      this.breadcrumbs = this.insertView("#header-breadcrumbs", new Components.Breadcrumbs({
        crumbs: this.crumbs
      }));
    },

    setUpDropDownMenu: function () {
      if (this.dropdownMenuLinks) {
        this.dropdown = this.insertView("#header-dropdown-menu", new Components.MenuDropDown({
          icon: 'fonticon-cog',
          links: this.dropdownMenuLinks,
          events: this.dropdownEvents
        }));
      }
    },

    setUpLookaheadTray: function () {
      var options = this.lookaheadTrayOptions,
          dbNames = options.databaseCollection.getDatabaseNames(),
          currentDBName = this.crumbs[1].name;

      // remove the current database name from the list
      dbNames = _.without(dbNames, currentDBName);

      this.lookaheadTray = this.insertView("#header-lookahead", new Components.LookaheadTray({
        data: dbNames,
        toggleEventName: options.toggleEventName,
        onUpdateEventName: options.onUpdateEventName,
        placeholder: options.placeholder
      }));
    }
  });

  Components.Breadcrumbs = FauxtonAPI.View.extend({
    className: "breadcrumb pull-left",
    tagName: "ul",
    template: "addons/fauxton/templates/breadcrumbs",

    events:  {
      "click .js-lastelement": "toggleLastElement"
    },

    serialize: function () {
      var crumbs = _.clone(this.crumbs);

      // helper template function to determine when to insert a delimiter char
      var nextCrumbHasLabel = function (crumb, index) {
        var nextHasLabel = crumbs[index + 1].name !== "";
        return index < crumbs.length && crumb.name && nextHasLabel;
      };

      return {
        toggleDisabled: this.toggleDisabled,
        crumbs: crumbs,
        nextCrumbHasLabel: nextCrumbHasLabel
      };
    },

    toggleLastElement: function (event) {
      if (this.toggleDisabled) {
        return;
      }
      this.$(event.currentTarget).toggleClass('js-enabled');
      FauxtonAPI.Events.trigger('breadcrumb:click');
    },

    unselectLastBreadcrumb: function () {
      if (this.toggleDisabled) {
        return;
      }
      this.$('.js-enabled').removeClass('js-enabled');
    },

    update: function (crumbs) {
      this.crumbs = crumbs;
      this.render();
    },

    initialize: function (options) {
      this.crumbs = options.crumbs;
      this.toggleDisabled = options.toggleDisabled || false;
    }
  });

  /**
   * Our generic Tray component. All trays should extend this guy - it offers some convenient boilerplate code for
   * hiding/showing, event publishing and so on. The important functions that can be called on the child Views are:
   * - hideTray
   * - showTray
   * - toggleTray
   */
  Components.Tray = FauxtonAPI.View.extend({

    // populated dynamically
    events: {},

    initTray: function (opts) {
      this.toggleTrayBtnSelector = (_.has(opts, 'toggleTrayBtnSelector')) ? opts.toggleTrayBtnSelector : null;
      this.onShowTray = (_.has(opts, 'onShowTray')) ? opts.onShowTray : null;

      // if the component extending this one passed along the selector of the element that toggles the tray,
      // add the appropriate events
      if (!_.isNull(this.toggleTrayBtnSelector)) {
        this.events['click ' + this.toggleTrayBtnSelector] = 'toggleTray';
      }

      _.bind(this.toggleTray, this);
      _.bind(this.trayVisible, this);
      _.bind(this.hideTray, this);
      _.bind(this.showTray, this);

      // a unique identifier for this tray
      this.trayId = 'tray-' + this.cid;

      var that = this;
      $('body').on('click.' + this.trayId, function (e) {
        var $clickEl = $(e.target);

        if (!that.trayVisible()) {
          return;
        }
        if (!_.isNull(that.toggleTrayBtnSelector) && $clickEl.closest(that.toggleTrayBtnSelector).length) {
          return;
        }
        if (!$clickEl.closest('.tray').length) {
          that.hideTray();
        }
      });

      FauxtonAPI.Events.on(FauxtonAPI.constants.EVENTS.TRAY_OPENED, this.onTrayOpenEvent, this);
    },

    cleanup: function () {
      $('body').off('click.' + this.trayId);
    },

    // all trays publish a EVENTS.TRAY_OPENED event containing their unique ID. This listens for those events and
    // closes the current tray if it's already open
    onTrayOpenEvent: function (msg) {
      if (!_.has(msg, 'trayId')) {
        return;
      }
      if (msg.trayId !== this.trayId && this.trayVisible()) {
        this.hideTray();
      }
    },

    toggleTray: function (e) {
      e.preventDefault();

      if (this.trayVisible()) {
        this.hideTray();
      } else {
        this.showTray();
      }
    },

    hideTray: function () {
      var $tray = this.$('.tray');
      $tray.velocity('reverse', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
        $tray.hide();
      });

      if (!_.isNull(this.toggleTrayBtnSelector)) {
        this.$(this.toggleTrayBtnSelector).removeClass('enabled');
      }
      // announce that the tray is being closed
      FauxtonAPI.Events.trigger(FauxtonAPI.constants.EVENTS.TRAY_CLOSED, { trayId: this.trayId });
    },

    showTray: function () {
      this.$('.tray').velocity('transition.slideDownIn', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED);
      if (!_.isNull(this.toggleTrayBtnSelector)) {
        this.$(this.toggleTrayBtnSelector).addClass('enabled');
      }

      if (!_.isNull(this.onShowTray)) {
        this.onShowTray();
      }

      FauxtonAPI.Events.trigger(FauxtonAPI.constants.EVENTS.TRAY_OPENED, { trayId: this.trayId });
    },

    trayVisible: function () {
      return this.$('.tray').is(':visible');
    }
  });


  Components.ApiBar = Components.Tray.extend({
    template: "addons/fauxton/templates/api_bar",

    initialize: function (options) {
      var _options = options || {};
      this.endpoint = _options.endpoint || '_all_docs';
      this.documentation = _options.documentation || FauxtonAPI.constants.DOC_URLS.GENERAL;

      this.initTray({ toggleTrayBtnSelector: '.api-url-btn' });
    },

    serialize: function () {
      return {
        endpoint: this.endpoint,
        documentation: this.documentation
      };
    },

    hide: function () {
      this.$el.addClass('hide');
    },

    show: function () {
      this.$el.removeClass('hide');
    },

    update: function (endpoint) {
      this.endpoint = endpoint[0];
      this.documentation = endpoint[1];
      this.render();
    },

    afterRender: function () {
      var client = new Components.Clipboard({
        $el: this.$('.copy-url')
      });

      client.on('load', function () {
        client.on('mouseup', function () {
          FauxtonAPI.addNotification({
            msg: 'The API URL has been copied to the clipboard.',
            type: 'success',
            clear: true
          });
        });
      });
    }
  });

  Components.Pagination = FauxtonAPI.View.extend({
    tagName: "ul",
    className: 'pagination',
    template: "addons/fauxton/templates/pagination",

    initialize: function (options) {
      this.page = parseInt(options.page, 10);
      this.perPage = options.perPage;
      this.urlFun = options.urlFun;
    },

    serialize: function () {
      var total = this.collection.length;
      var totalPages = Math.ceil(total / this.perPage);

      var visiblePagesObject = this.getVisiblePages(this.page, totalPages);

      var from = visiblePagesObject.from,
          to = visiblePagesObject.to;

      return {
        page: this.page,
        perPage: this.perPage,
        total: total,
        totalPages: totalPages,
        urlFun: this.urlFun,
        from: from,
        to: to
      };
    },

    getVisiblePages: function (page, totalPages) {
      var from, to;

      if (totalPages < 10) {
        from = 1;
        to = totalPages + 1;
      } else { // if totalPages is more than 10
        from = page - 5;
        to = page + 5;

        if (from <= 1) {
          from = 1;
          to = 11;
        }
        if (to > totalPages + 1) {
          from =  totalPages - 9;
          to = totalPages + 1;
        }

      }

      return {
        from: from,
        to: to
      };

    }
  });


  // A super-simple replacement for window.confirm()
  Components.ConfirmationModal = FauxtonAPI.View.extend({
    template: 'addons/fauxton/templates/confirmation_modal',

    events: {
      'click .js-btn-success': 'onSelectOkay'
    },

    initialize: function (options) {
      this.options = _.extend({
        title: 'Please confirm',
        text: '',
        action: null
      }, options);
    },

    onSelectOkay: function () {
      this.hideModal();
      if (_.isFunction(this.options.action)) {
        this.options.action();
      }
    },

    showModal: function () {
      this.$('.modal').modal();
      $('.modal-backdrop').css('z-index', FauxtonAPI.constants.MISC.MODAL_BACKDROP_Z_INDEX);
    },

    hideModal: function () {
      this.$('.modal').modal('hide');
    },

    serialize: function () {
      return {
        title: this.options.title,
        text: this.options.text
      };
    }
  });

  Components.ModalView = FauxtonAPI.View.extend({
    disableLoader: true,

    initialize: function (options) {
      _.bindAll(this);
    },

    afterRender: function () {
      var that = this;
      this.$('.modal').on('shown', function () {
        that.$('input:text:visible:first').focus();
      });
    },

    showModal: function () {
      if (this._showModal) { this._showModal();}
      this.clear_error_msg();
      this.$('.modal').modal();

      // hack to get modal visible
      $('.modal-backdrop').css('z-index', FauxtonAPI.constants.MISC.MODAL_BACKDROP_Z_INDEX);
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
      if (this.model) {
        return this.model.toJSON();
      }
      return {};
    }
  });

  Components.Typeahead = FauxtonAPI.View.extend({

    initialize: function (options) {
      this.source = options.source;
      this.onUpdateEventName = options.onUpdateEventName;
    },

    afterRender: function () {
      var onUpdateEventName = this.onUpdateEventName;

      this.$el.typeahead({
        source: this.source,
        updater: function (item) {
          FauxtonAPI.Events.trigger(onUpdateEventName, item);
          return item;
        }
      });
    }
  });

  Components.DbSearchTypeahead = Components.Typeahead.extend({
    initialize: function (options) {
      this.dbLimit = options.dbLimit || 30;
      if (options.filter) {
        this.resultFilter = options.resultFilter;
      }
      _.bindAll(this);
    },

    getURL: function (query, dbLimit) {
      query = encodeURIComponent(query);
      return [
        app.host,
        "/_all_dbs?startkey=%22",
        query,
        "%22&endkey=%22",
        query,
        encodeURIComponent("\u9999"),
        "%22&limit=",
        dbLimit
      ].join('');
    },

    source: function (query, process) {
      var url = this.getURL(query, this.dbLimit);
      var resultFilter = this.resultFilter;

      if (this.ajaxReq) { this.ajaxReq.abort(); }

      this.ajaxReq = $.ajax({
        cache: false,
        url: url,
        dataType: 'json',
        success: function (data) {
          if (resultFilter) {
            data = resultFilter(data);
          }
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
    source: function (id, process) {
      var query = '?' + $.param({
        startkey: JSON.stringify(id),
        endkey: JSON.stringify(id + "\u9999"),
        limit: this.docLimit
      });

      var url = FauxtonAPI.urls('allDocs', 'server', this.database.safeID(), query);

      if (this.ajaxReq) { this.ajaxReq.abort(); }

      this.ajaxReq = $.ajax({
        cache: false,
        url: url,
        dataType: 'json',
        success: function (data) {
          var ids = _.map(data.rows, function (row) {
            return row.id;
          });
          process(ids);
        }
      });
    }
  });

  Components.FilteredView = FauxtonAPI.View.extend({
    createFilteredData: function (json) {
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

  Components.Editor = FauxtonAPI.View.extend({
    initialize: function (options) {
      this.editorId = options.editorId;
      this.mode = options.mode || "json";
      this.commands = options.commands;
      this.theme = options.theme || 'idle_fingers';
      this.couchJSHINT = options.couchJSHINT;

      // going forward we can use flexbox for all editors with a fixed height and drop all custom JS to adjust its height
      this.setHeightWithJS = _.has(options, 'setHeightWithJS') ? options.setHeightWithJS : true;

      this.edited = false;

      // the full-page document editor does some extra work to adjust the total height of the editor based
      // on available space. This setting ensures that only takes place there, and not with other editor locations
      this.isFullPageEditor = options.isFullPageEditor || false;

      var that = this;
      this.onPageResize = _.debounce(function () {
        if (that.isFullPageEditor) {
          that.setAvailableEditorHeight();
        }
        that.setHeightToLineCount();
        that.editor.resize(true);
      }, 300);

      $(window).on('resize.editor', this.onPageResize);
      this.listenTo(FauxtonAPI.Events, FauxtonAPI.constants.EVENTS.NAVBAR_SIZE_CHANGED, this.onPageResize);

      _.bindAll(this);
    },

    afterRender: function () {
      this.editor = ace.edit(this.editorId);
      this.setAvailableEditorHeight();
      this.setHeightToLineCount();
      this.editor.setTheme("ace/theme/" + this.theme);

      if (this.mode != "plain") {
        this.editor.getSession().setMode("ace/mode/" + this.mode);
      }

      this.editor.setShowPrintMargin(false);
      this.editor.autoScrollEditorIntoView = true;
      this.addCommands();

      if (this.couchJSHINT) {
        this.removeIncorrectAnnotations();
      }

      this.editor.getSession().setTabSize(2);

      this.editor.getSession().on('change', function () {
        this.setHeightToLineCount();
        this.edited = true;
      }.bind(this));

      $(window).on('beforeunload.editor_' + this.editorId, function () {
        if (this.edited) {
          return 'Your changes have not been saved. Click cancel to return to the document.';
        }
      }.bind(this));

      FauxtonAPI.beforeUnload('editor_' + this.editorId, function (deferred) {
        if (this.edited) {
          return 'Your changes have not been saved. Click cancel to return to the document.';
        }
      }.bind(this));
    },

    cleanup: function () {
      $(window).off('beforeunload.editor_' + this.editorId);
      $(window).off('resize.editor', this.onPageResize);
      FauxtonAPI.removeBeforeUnload('editor_' + this.editorId);
      this.editor.destroy();
    },

    // we need to track the possible available height of the editor to tell it how large it can grow vertically
    setAvailableEditorHeight: function () {
      this.availableEditorHeight = $('.code-region').height();
    },

    setHeightToLineCount: function () {
      if (!this.setHeightWithJS) {
        return;
      }
      var lines = this.editor.getSession().getDocument().getLength();

      if (this.isFullPageEditor) {
        var maxLines = this.getMaxAvailableLinesOnPage();
        lines = lines < maxLines ? lines : maxLines;
      }
      this.editor.setOptions({
        maxLines: lines
      });
    },

    getMaxAvailableLinesOnPage: function () {
      var singleLine = this.getRowHeight();
      return Math.floor(this.availableEditorHeight  / singleLine);
    },

    getLines: function () {
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
      return _.every(errors, function (error) {
        return this.isIgnorableError(error.raw);
      }, this);
    },

    // List of JSHINT errors to ignore
    // Gets around problem of anonymous functions not being a valid statement
    excludedViewErrors: [
      "Missing name in function declaration.",
      "['{a}'] is better written in dot notation."
    ],

    isIgnorableError: function (msg) {
      return _.contains(this.excludedViewErrors, msg);
    },

    configureFixedHeightEditor: function (numLines) {
      this.editor.renderer.setVScrollBarAlwaysVisible(true);
      this.editor.renderer.setHScrollBarAlwaysVisible(true);
      /* customize the ace scrolling for static edit height */
      this.editor.renderer.$autosize = function () {
        this.$size.height = numLines * this.lineHeight;
        this.desiredHeight = numLines * this.lineHeight;
        this.container.style.height = this.desiredHeight + "px";
        this.scrollBarV.setVisible(true);
        this.scrollBarH.setVisible(true);
      };
    },

    replaceCurrentLine: function (replacement) {
      this.editor.getSelection().selectLine();
      this.editor.insert(replacement);
      this.editor.getSelection().moveCursorUp();
    },

    getLine: function (lineNum) {
      return this.editor.session.getLine(lineNum);
    },

    getSelectionStart: function () {
      return this.editor.getSelectionRange().start;
    },

    getSelectionEnd: function () {
      return this.editor.getSelectionRange().end;
    },

    getRowHeight: function () {
      return this.editor.renderer.layerConfig.lineHeight;
    },

    isRowExpanded: function (row) {
      return !this.editor.getSession().isRowFolded(row);
    },

    documentToScreenRow: function (row) {
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
    initialize: function (options) {
      this.links = options.links;
      this.icon = options.icon || "fonticon-plus-circled";
      this.setUpEvents();
    },
    setUpEvents: function () {
      this.events = {};
      _.each(this.links, function (parentLink) {
        _.each(parentLink.links, function (link) {
          if (!link.trigger) { return; }
          this.events['click .' + link.icon] = "triggerEvent";
        }, this);
      }, this);
    },
    triggerEvent: function (e) {
      e.preventDefault();
      var eventTrigger = $(e.currentTarget).attr('triggerEvent');
      FauxtonAPI.Events.trigger(eventTrigger);
    },
    update: function (links) {
      this.links = links;
      this.render();
    },
    serialize: function () {
      return {
        links: this.links,
        icon: this.icon
      };
    }
  });

  Components.Clipboard = FauxtonAPI.View.extend({
    initialize: function (options) {
      this.$el = options.$el;

      ZeroClipboard.config({ moviePath: app.zeroClipboardPath });
      this.client = new ZeroClipboard(this.$el);
    },

    on: function () {
      return this.client.on.apply(this.client, arguments);
    }
  });


  Components.LookaheadTray = FauxtonAPI.View.extend({
    className: "lookahead-tray tray",
    template: "addons/fauxton/templates/lookahead_tray",
    placeholder: "Enter to search",

    events: {
      'click #js-close-tray': 'closeTray',
      'keyup': 'onKeyup'
    },

    serialize: function () {
      return {
        placeholder: this.placeholder
      };
    },

    initialize: function (opts) {
      this.data = opts.data;
      this.toggleEventName = opts.toggleEventName;
      this.onUpdateEventName = opts.onUpdateEventName;

      var trayIsVisible = _.bind(this.trayIsVisible, this);
      var closeTray = _.bind(this.closeTray, this);
      $("body").on("click.lookaheadTray", function (e) {
        if (!trayIsVisible()) { return; }
        if ($(e.target).closest(".lookahead-tray").length === 0 &&
            $(e.target).closest('.lookahead-tray-link').length === 0) {
          closeTray();
        }
      });
    },

    afterRender: function () {
      var that = this;
      this.dbSearchTypeahead = new Components.Typeahead({
        el: 'input.search-autocomplete',
        source: that.data,
        onUpdateEventName: that.onUpdateEventName
      });
      this.dbSearchTypeahead.render();
    },

    clearValue: function () {
      this.$('.search-autocomplete').val('');
    },

    cleanup: function () {
      $("body").off("click.lookaheadTray");
    },

    trayIsVisible: function () {
      return this.$el.is(":visible");
    },

    toggleTray: function () {
      if (this.trayIsVisible()) {
        this.closeTray();
      } else {
        this.openTray();
      }
    },

    openTray: function () {
      var speed = FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED;
      this.$el.velocity('transition.slideDownIn', speed, function () {
        this.$el.find('input').focus();
      }.bind(this));
    },

    closeTray: function () {
      var $tray = this.$el;
      $tray.velocity("reverse", FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
        $tray.hide();
      });
      FauxtonAPI.Events.trigger('lookaheadTray:close');
    },

    onKeyup: function (e) {
      if (e.which === 27) {
        this.closeTray();
      }
    }
  });


  //need to make this into a backbone view...
  var routeObjectSpinner;

  FauxtonAPI.RouteObject.on('beforeEstablish', function (routeObject) {
    if (!routeObject.disableLoader) {
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

    if (viewSpinner) {
      viewSpinner.stop();
      $(selector).find('.spinner').remove();
      delete viewSpinners[selector];
    }
  };

  var viewSpinners = {};
  FauxtonAPI.RouteObject.on('beforeRender', function (routeObject, view, selector) {
    removeRouteObjectSpinner();

    if (!view.disableLoader) {
      var opts = _.extend({
        lines: 16, // The number of lines to draw
        length: 8, // The length of each line
        width: 4, // The line thickness
        radius: 12, // The radius of the inner circle
        color: '#333', // #rbg or #rrggbb
        speed: 1, // Rounds per second
        trail: 10, // Afterglow percentage
        shadow: false // Whether to render a shadow
      }, view.loaderStyles);

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
