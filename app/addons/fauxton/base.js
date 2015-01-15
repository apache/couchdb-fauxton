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
  "plugins/zeroclipboard/ZeroClipboard"
],

function(app, FauxtonAPI, Components, ZeroClipboard) {

  var Fauxton = FauxtonAPI.addon();
  FauxtonAPI.addNotification = function (options) {
    options = _.extend({
      msg: "Notification Event Triggered!",
      type: "info",
      selector: "#global-notifications",
      escape: true
    }, options);

    var view = new Fauxton.Notification(options);
    return view.renderNotification();
  };

  FauxtonAPI.UUID = FauxtonAPI.Model.extend({
    initialize: function(options) {
      options = _.extend({count: 1}, options);
      this.count = options.count;
    },

    url: function() {
      return app.host + "/_uuids?count=" + this.count;
    },

    next: function() {
      return this.get("uuids").pop();
    }
  });

  Fauxton.initialize = function () {
    app.navBar = new Fauxton.NavBar();
    app.apiBar = new Components.ApiBar();

    FauxtonAPI.when.apply(null, app.navBar.establish()).done(function() {
      FauxtonAPI.masterLayout.setView("#primary-navbar", app.navBar, true);
      FauxtonAPI.masterLayout.setView("#api-navbar", app.apiBar, true);
      app.navBar.render();
      app.apiBar.render();
    });

    FauxtonAPI.masterLayout.navBar = app.navBar;
    FauxtonAPI.masterLayout.apiBar = app.apiBar;

    FauxtonAPI.RouteObject.on('beforeFullRender', function (routeObject) {
      $('#primary-navbar li').removeClass('active');

      if (routeObject.selectedHeader) {
        app.selectedHeader = routeObject.selectedHeader;
        $('#primary-navbar li[data-nav-name="' + routeObject.selectedHeader + '"]').addClass('active');
      }
    });

    FauxtonAPI.RouteObject.on('beforeEstablish', function (routeObject) {
      if (routeObject.overrideBreadcrumbs) { return; }

      FauxtonAPI.masterLayout.removeView('#breadcrumbs');
      var crumbs = routeObject.get('crumbs');

      if (crumbs.length) {
        FauxtonAPI.masterLayout.setView('#breadcrumbs', new Components.Breadcrumbs({
          crumbs: crumbs
        }), true).render();
      }
    });

    FauxtonAPI.RouteObject.on('renderComplete', function (routeObject) {
      var masterLayout = FauxtonAPI.masterLayout;

      if (routeObject.get('apiUrl')) {
        masterLayout.apiBar.show();
        masterLayout.apiBar.update(routeObject.get('apiUrl'));
      } else {
        masterLayout.apiBar.hide();
      }
    });
  };
  
  Fauxton.VersionInfo = Backbone.Model.extend({
    url: function () {
      return app.host;
    }
  });

  Fauxton.Footer = FauxtonAPI.View.extend({
    tagName: "p",
    template: "addons/fauxton/templates/footer",

    initialize: function() {
      this.versionInfo = new Fauxton.VersionInfo();
    },

    establish: function() {
      return [this.versionInfo.fetch()];
    },

    serialize: function() {
      return {
        version: this.versionInfo.get("version")
      };
    }
  });

  Fauxton.NavBar = FauxtonAPI.View.extend({
    className:"navbar",
    template: "addons/fauxton/templates/nav_bar",

    events:  {
      "click .burger" : "toggleMenu"
    },

    toggleMenu: function(){
       var $selectorList = $('body');
      var minimized = !$selectorList.hasClass('closeMenu');
      this.setState(minimized);
       $selectorList.toggleClass('closeMenu');
       FauxtonAPI.Events.trigger(FauxtonAPI.constants.EVENTS.BURGER_CLICKED, { minimized: minimized });
    },

    // TODO: can we generate this list from the router?
    navLinks: [
      {href:"#/_all_dbs", title:"Databases", icon: "fonticon-database", className: 'databases'}
    ],

    bottomNavLinks: [],
    footerNavLinks: [],

    initialize: function () {
      _.bindAll(this);

      FauxtonAPI.extensions.on('add:navbar:addHeaderLink', this.addLink);
      FauxtonAPI.extensions.on('removeItem:navbar:addHeaderLink', this.removeLink);
      this.versionFooter = new Fauxton.Footer({});

      // if needed, minimize the sidebar
      if (this.isMinimized()) {
        $('body').addClass('closeMenu');
      }
    },

    serialize: function() {
      return {
        navLinks: this.navLinks,
        bottomNavLinks: this.bottomNavLinks,
        footerNavLinks: this.footerNavLinks
      };
    },

    establish: function(){
      return [this.versionFooter.establish()];
    },

    addLink: function(link) {
      // link.top means it gets pushed to the top of the array,
      // link.bottomNav means it goes to the additional bottom nav
      // link.footerNav means goes to the footer nav
      if (link.top && !link.bottomNav){
        this.navLinks.unshift(link);
      } else if (link.top && link.bottomNav){
        this.bottomNavLinks.unshift(link);
      } else if (link.bottomNav) {
        this.bottomNavLinks.push(link);
      } else if (link.footerNav) {
        this.footerNavLinks.push(link);
      } else {
        this.navLinks.push(link);
      }
    },

    removeLink: function (removeLink) {
      var links = this.navlinks;

      if (removeLink.bottomNav) {
        links = this.bottomNavLinks;
      } else if (removeLink.footerNav) {
        links = this.footerNavLinks;
      }

      var foundIndex = -1;

      _.each(links, function (link, index) {
        if (link.title === removeLink.title) {
          foundIndex = index;
        }
      });

      if (foundIndex === -1) {return;}
      links.splice(foundIndex, 1);
      this.render();
    },

    afterRender: function(){
      $('#primary-navbar li[data-nav-name="' + app.selectedHeader + '"]').addClass('active');
    },

    beforeRender: function () {
      this.insertView(".js-version", this.versionFooter);
      this.addLinkViews();
    },

    addLinkViews: function () {
      var that = this;

      _.each(_.union(this.navLinks, this.bottomNavLinks), function (link) {
        if (!link.view) { return; }

        //TODO check if establish is a function
        var establish = link.establish || [];
        $.when.apply(null, establish).then( function () {
          var selector =  link.bottomNav ? '#bottom-nav-links' : '#nav-links';
          that.insertView(selector, link.view).render();
        });
      }, this);
    },

    setState: function (minimized) {
      app.utils.localStorageSet(FauxtonAPI.constants.LOCAL_STORAGE.SIDEBAR_MINIMIZED, minimized);
    },

    isMinimized: function () {
      var isMinimized = app.utils.localStorageGet(FauxtonAPI.constants.LOCAL_STORAGE.SIDEBAR_MINIMIZED);
      return (_.isUndefined(isMinimized)) ? false : isMinimized;
    }

    // TODO: ADD ACTIVE CLASS
  });

  Fauxton.Notification = FauxtonAPI.View.extend({
    animationTimer: 5000,

    events: {
      'click .js-dismiss': 'removeWithAnimation'
    },

    initialize: function(options) {
      this.htmlToRender = options.msg;
      // escape always, except the value is false
      if (options.escape !== false) {
        this.htmlToRender = _.escape(this.htmlToRender);
      }
      this.type = options.type || "info";
      this.selector = options.selector;
      this.fade = options.fade === undefined ? true : options.fade;
      this.data = options.data || "";
      this.template = options.template || "addons/fauxton/templates/notification";
    },

    serialize: function () {
      var icon;

      switch (this.type) {
        case 'error':
          icon = 'fonticon-attention-circled';
          break;
        case 'info':
          icon = 'fonticon-info-circled';
          break;
        case 'success':
          icon = 'fonticon-ok-circled';
          break;
        default:
          icon = 'fonticon-info-circled';
          break;
      }

      return {
        icon: icon,
        data: this.data,
        htmlToRender: this.htmlToRender,
        type: this.type
      };
    },

    removeWithAnimation: function () {
      this.$el.velocity('reverse', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED, function () {
        this.$el.remove();
      }.bind(this));
    },

    delayedRemoval: function () {
      setTimeout(function () {
        this.removeWithAnimation();
      }.bind(this), this.animationTimer);
    },

    renderNotification: function(selector) {
      selector = selector || this.selector;
      if (this.clear) {
        $(selector).html('');
      }
      this.render().$el.appendTo(selector);
      this.$el.velocity('transition.slideDownIn', FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED);
      this.delayedRemoval();
      return this;
    }
  });

  return Fauxton;
});
