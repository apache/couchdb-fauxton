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
import ReactComponents from "../components/react-components.react";
import ComponentsActions from "../components/actions";
import Helpers from "../documents/helpers";
import "velocity-animate/velocity.ui";
var Components = FauxtonAPI.addon();


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


export default Components;
