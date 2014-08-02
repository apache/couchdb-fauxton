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
       "addons/databases/resources"
],

function(app, FauxtonAPI, Components, Documents, Databases) {
  var Views = {};

  Views.Sidebar = FauxtonAPI.View.extend({
    template: "addons/documents/templates/sidebar",
    className: "sidenav",
    tagName: "nav",
    events: {
      "click button#delete-database": "showDeleteDatabaseModal"
    },

    initialize: function(options) {
      this.database = options.database;
      if (options.ddocInfo) {
        this.ddocID = options.ddocInfo.id;
        this.currView = options.ddocInfo.currView;
      }
    },
    showDeleteDatabaseModal: function(event){
      this.deleteDBModal.showModal();
    },

    serialize: function() {
      var docLinks = FauxtonAPI.getExtensions('docLinks'),
          newLinks = FauxtonAPI.getExtensions('sidebar:newLinks'),
          addLinks = FauxtonAPI.getExtensions('sidebar:links'),
          extensionList = FauxtonAPI.getExtensions('sidebar:list');
      return {
        changes_url: '#' + this.database.url('changes'),
        permissions_url: '#' + this.database.url('app') + '/permissions',
        db_url: '#' + this.database.url('index'),
        database: this.collection.database,
        database_url: '#' + this.database.url('app'),
        docLinks: docLinks,
        addLinks: addLinks,
        newLinks: newLinks,
        extensionList: extensionList > 0
      };
    },

    getNewButtonLinks: function () {
      var database = this.collection.database,
          newurlPrefix = "#" + database.url('app'),
          addLinks = FauxtonAPI.getExtensions('sidebar:links');

      return _.reduce(FauxtonAPI.getExtensions('sidebar:links'), function (menuLinks, link) {

        menuLinks.push({
          title: link.title,
          url: newurlPrefix + "/" + link.url,
          icon: 'fonticon-plus-circled'
        });

        return menuLinks; 
     }, [{
          title: 'New Doc',
          url: newurlPrefix + '/new',
          icon: 'fonticon-plus-circled'
        },{
          title: 'New View',
          url: newurlPrefix + '/new_view',
          icon: 'fonticon-plus-circled'
        }]);
    },


    beforeRender: function(manage) {
      this.deleteDBModal = this.setView(
        '#delete-db-modal',
        new Views.DeleteDBModal({database: this.database})
      );

      var newLinks = [{
        title: 'Add new',
        links: this.getNewButtonLinks()
      }];

      this.insertView("#new-all-docs-button", new Components.MenuDropDown({
        links: newLinks,
      }));

      this.insertView("#new-design-docs-button", new Components.MenuDropDown({
        links: newLinks,
      }));

      this.collection.each(function(design) {
        if (design.has('doc')){
          this.insertView(new Views.DdocSidenav({
            model: design,
            collection: this.collection
          }));
        }
      },this);
    },

    afterRender: function () {
      if (this.selectedTab) {
        this.setSelectedTab(this.selectedTab);
      }
    },

    setSelectedTab: function (selectedTab) {
      this.selectedTab = selectedTab;
      var $selectedTab = this.$('#' + selectedTab);

      this.$('li').removeClass('active');
      $selectedTab.parent().addClass('active');

      if ($selectedTab.parents(".accordion-body").length !== 0){
        $selectedTab
        .parents(".accordion-body")
        .addClass("in")
        .parents(".nav-header")
        .find(">.js-collapse-toggle").addClass("down");

        this.$('.js-toggle-' + $selectedTab.data('ddoctype')).addClass("down");
      }
    }
  });

  Views.DdocSidenav = FauxtonAPI.View.extend({
    tagName: "ul",
    className:  "nav nav-list",
    template: "addons/documents/templates/design_doc_menu",
    events: {
      "click .js-collapse-toggle": "toggleArrow"
    },

    toggleArrow:  function(e){
      this.$(e.currentTarget).toggleClass("down");
    },
    buildIndexList: function(collection, selector, ddocType){
    buildIndexList: function(collection, indexType){
    buildIndexList: function(collection, info){
      var design = this.model.id.replace(/^_design\//,"");
      var selector = indexType.selector;
      var ddocType = indexType.ddocType;
      var icon = indexType.icon;

      this.insertView(".accordion-body", new Views.IndexItem({
        selector: info.selector,
        ddoc: design,
        collection: collection[info.selector],
        name: info.name,
        database: this.model.collection.database.id
      }));
    },

    serialize: function(){
      var ddocName = this.model.id.replace(/^_design\//,"");
      return{
        database: this.collection.database,
        designDoc: ddocName,
        ddoc_clean: app.utils.removeSpecialCharacters(ddocName),
        ddoc_encoded: app.utils.safeURLName(ddocName),
        database_encoded: app.utils.safeURLName(this.model.collection.database.id),
      };
    },

    getSidebarLinks: function () {
      var ddocName = this.model.id.replace(/^_design\//,""),
          docSafe = app.utils.safeURLName(ddocName),
          database = this.collection.database;

      return _.reduce(FauxtonAPI.getExtensions('sidebar:links'), function (menuLinks, link) {

        menuLinks.push({
          title: link.title,
          url: "#" + database.url('app')+ "/" + link.url + "/" + docSafe,
          icon: 'fonticon-plus-circled'
        });

        return menuLinks; 
     }, [{
      title: 'New View',
      url: "#" + database.url('app') + "/new_view/" + docSafe,
      icon: 'fonticon-plus-circled'
     }]);

    },

    renderIndexLists: function () {
      var ddocDocs = this.model.get("doc"),
          sidebarListTypes = FauxtonAPI.getExtensions('sidebar:list');

      if (!ddocDocs){ return; }

      this.buildIndexList(ddocDocs, {
        selector: "views",
        name: 'Views'
      });

      _.each(sidebarListTypes, function (info) {
        this.buildIndexList(ddocDocs, info);
      },this);

    },

    beforeRender: function(manage) {
      var sideBarMenuLinks = [];

      sideBarMenuLinks.push({
        title: 'Add new',
        links: this.getSidebarLinks()
      });

      this.renderIndexLists();
      this.insertView(".new-button", new Components.MenuDropDown({
        links: sideBarMenuLinks,
      }));
    }
  });

  //Sidebar Index Item
  Views.IndexItem = FauxtonAPI.View.extend({
    template: "addons/documents/templates/index_menu_item",
    tagName: 'li',

    initialize: function(options){
      this.index = options.index;
      this.ddoc = options.ddoc;
      this.database = options.database;
      this.selected = !! options.selected;
      this.selector = options.selector;
      this.name = options.name;
      this.icons = {
        "Views": "fonticon-sidenav-map-reduce",
        "indexes": "fonticon-sidenav-search"
      };

    },

    serialize: function() {
      return {
        icon:  this.icons[this.ddocType],
        ddocType:  this.selector,
        name: this.name,
        index: this.index,
        ddoc: this.ddoc,
        database: this.database,
        selected: this.selected,
        collection: this.collection
      };
    },
    afterRender: function() {
      if (this.selected) {
        $(".sidenav ul.nav-list li").removeClass("active");
        this.$el.addClass("active");
      }
    }
  });



  return Views;
});

