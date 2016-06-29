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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import spin from "../../../assets/js/libs/spin.min";
import ReactComponents from "../components/react-components.react";
import ComponentsActions from "../components/actions";
import Helpers from "../documents/helpers";
import "velocity-animate/velocity.ui";
var Components = FauxtonAPI.addon();

// XXX: move to /addons/documents - component is tightly coupled to documents/alldocs
Components.LeftHeader = FauxtonAPI.View.extend({
  className: "header-left",
  template: "addons/fauxton/templates/header_left",

  initialize: function (options) {
    this.crumbs = options.crumbs || [];

    this.dbName = options.databaseName;

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

  beforeRender: function () {
    this.setUpCrumbs();
    this.setUpDropDownMenu();
  },

  setUpCrumbs: function () {
    this.breadcrumbs = this.insertView("#header-breadcrumbs", new Components.Breadcrumbs({
      crumbs: this.crumbs
    }));
  },

  getModififyDbLinks: function () {
    var onClickDelete = ComponentsActions.showDeleteDatabaseModal;
    return Helpers.getModifyDatabaseLinks(this.dbName, onClickDelete);
  },

  setUpDropDownMenu: function () {
    var dropdownMenuLinks = Helpers.getNewButtonLinks(this.dbName);

    dropdownMenuLinks = this.getModififyDbLinks().concat(dropdownMenuLinks);

    this.dropdown = this.insertView("#header-dropdown-menu", new Components.MenuDropDownReact({
      links: dropdownMenuLinks,
    }));
  }
});

Components.MenuDropDownReact = FauxtonAPI.View.extend({
  initialize: function (options) {
    this.options = options;
  },

  afterRender: function () {
    ReactComponents.renderMenuDropDown(this.el, this.options);
  },

  cleanup: function () {
    ReactComponents.removeMenuDropDown(this.el);
  }
});
Components.Breadcrumbs = FauxtonAPI.View.extend({
  className: "breadcrumb pull-left",
  tagName: "ul",
  template: "addons/fauxton/templates/breadcrumbs",

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


export default Components;
