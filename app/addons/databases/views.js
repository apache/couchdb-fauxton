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

  "addons/fauxton/components",
  "api",
  "addons/databases/resources"
],

function(app, Components, FauxtonAPI, Databases) {
  var Views = {};

  Views.RightAllDBsHeader = FauxtonAPI.View.extend({
    className: "header-right",
    template: "addons/databases/templates/header_alldbs",
    initialize: function(options){
      //adding the database to the object
      _.bindAll(this);
      this.endpoint = options.endpoint;
    },

    updateApiUrl: function(api){
      //this will update the api bar when the route changes
      //you can find the method that updates it in components.js Components.ApiBar()
      this.apiBar && this.apiBar.update(api);
    },

    beforeRender:function(){
      this.headerSearch = this.insertView("#header-search", new Views.JumpToDB({
        collection: this.collection
      }));

      this.newbutton = this.insertView("#add-db-button", new Views.NewDatabaseButton({
        collection: this.collection
      }));


      //Moved the apibar view into the components file so you can include it in your views
      this.apiBar = this.insertView("#header-api-bar", new Components.ApiBar({
        endpoint: this.endpoint
        }));
    }
  });

  Views.Item = FauxtonAPI.View.extend({
    template: "addons/databases/templates/item",
    tagName: "tr",
    establish: function(){
      return [this.model.fetch()];
    },
    serialize: function() {

      return {
        encoded: app.utils.safeURLName(this.model.get("name")),
        database: this.model
      };
    }
  });


  Views.JumpToDB = FauxtonAPI.View.extend({
    template: "addons/databases/templates/jump_to_db",
    events: {
      "submit form#jump-to-db": "switchDatabase"
    },
    initialize: function(options) {
      var params = app.getParams();
      this.page = params.page ? parseInt(params.page, 10) : 1;
    },
    establish: function(){
      var currentDBs = this.paginated();
      var deferred = FauxtonAPI.Deferred();

      FauxtonAPI.when(currentDBs.map(function(database) {
        return database.status.fetchOnce();
      })).always(function(resp) {
        //make this always so that even if a user is not allowed access to a database
        //they will still see a list of all databases
        deferred.resolve();
      });
      return [deferred];
    },
    switchDatabase: function(event, selectedName) {
      event && event.preventDefault();

      var dbname = this.$el.find("[name='search-query']").val().trim();

      if (selectedName) {
        dbname = selectedName;
      }

      if (dbname && this.collection.where({"id":app.utils.safeURLName(dbname)}).length > 0){
          // TODO: switch to using a model, or Databases.databaseUrl()
          // Neither of which are in scope right now
          // var db = new Database.Model({id: dbname});
          var url = ["/database/", app.utils.safeURLName(dbname), "/_all_docs"].join('');
          FauxtonAPI.navigate(url);
      } else {
        FauxtonAPI.addNotification({
          msg: 'Database does not exist.',
          type: 'error'
        });
      }
    },
    afterRender: function() {
      var that = this,
          AllDBsArray = _.map(this.collection.toJSON(), function(item, key){
            return item.name;
          });

      this.dbSearchTypeahead = new Components.Typeahead({
        el: "input.search-autocomplete",
        source: AllDBsArray,
        onUpdate: function (item) {
          that.switchDatabase(null, item);
        }
      });
      this.dbSearchTypeahead.render();
      this.$el.find(".js-db-graveyard").tooltip();
    }
  });

  Views.List = FauxtonAPI.View.extend({
    dbLimit: 20,
    perPage: 20,
    template: "addons/databases/templates/list",
    events: {
      "click button.all": "selectAll"
    },

    initialize: function(options) {
      var params = app.getParams();
      this.page = params.page ? parseInt(params.page, 10) : 1;
    },

    serialize: function() {
      return {
        databases: this.collection
      };
    },
    establish: function(){
      var currentDBs = this.paginated();
      var deferred = FauxtonAPI.Deferred();

      FauxtonAPI.when(currentDBs.map(function(database) {
        return database.status.fetchOnce();
      })).always(function(resp) {
        //make this always so that even if a user is not allowed access to a database
        //they will still see a list of all databases
        deferred.resolve();
      });
      return [deferred];
    },

    paginated: function() {
      var start = (this.page - 1) * this.perPage;
      var end = this.page * this.perPage;
      return this.collection.slice(start, end);
    },

    beforeRender: function() {

      _.each(this.paginated(), function(database) {
        this.insertView("table.databases tbody", new Views.Item({
          model: database
        }));
      }, this);

      this.insertView("#database-pagination", new Components.Pagination({
        page: this.page,
        perPage: this.perPage,
        total: this.collection.length,
        urlFun: function(page) {
          return "#/_all_dbs?page=" + page;
        }
      }));
    },

    setPage: function(page) {
      this.page = page || 1;
    },
    selectAll: function(evt){
      $("input:checkbox").attr('checked', !$(evt.target).hasClass('active'));
    }
  });


  Views.NewDatabaseButton = FauxtonAPI.View.extend({
    template: "addons/databases/templates/newdatabase",
    events: {
      "click a#new": "newDatabase"
    },
    newDatabase: function() {
      var notification;
      var db;
      // TODO: use a modal here instead of the prompt
      var name = prompt('Name of database', 'newdatabase');
      if (name === null) {
        return;
      } else if (name.length === 0) {
        notification = FauxtonAPI.addNotification({
          msg: "Please enter a valid database name",
          type: "error",
          clear: true
        });
        return;
      }
      db = new this.collection.model({
        id: name,
        name: name
      });
      notification = FauxtonAPI.addNotification({msg: "Creating database."});
      db.save().done(function() {
        notification = FauxtonAPI.addNotification({
          msg: "Database created successfully",
          type: "success",
          clear: true
        });
        var route = "#/database/" +  app.utils.safeURLName(name) + "/_all_docs?limit=" + Databases.DocLimit;
        app.router.navigate(route, { trigger: true });
      }
      ).error(function(xhr) {
        var responseText = JSON.parse(xhr.responseText).reason;
        notification = FauxtonAPI.addNotification({
          msg: "Create database failed: " + responseText,
          type: "error",
          clear: true
        });
      }
      );
    }
  });

  return Views;
});
