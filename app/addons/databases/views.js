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
  'app',
  'addons/fauxton/components',
  'api',
  'addons/databases/resources'
],

function(app, Components, FauxtonAPI, Databases) {

  var Views = {};

  Views.RightAllDBsHeader = FauxtonAPI.View.extend({
    className: 'header-right',
    template: 'addons/databases/templates/header_alldbs',

    beforeRender: function () {
      this.headerSearch = this.insertView('#header-search', new JumpToDBView({
        collection: this.collection
      }));

      this.newbutton = this.insertView('#add-db-button', new NewDatabaseView({
        collection: this.collection
      }));
    }
  });

  Views.Item = FauxtonAPI.View.extend({
    template: 'addons/databases/templates/item',
    tagName: 'tr',

    establish: function () {
      return [this.model.fetch()];
    },

    serialize: function () {
      return {
        encoded: app.utils.safeURLName(this.model.get('name')),
        database: this.model
      };
    }
  });

  Views.List = FauxtonAPI.View.extend({
    dbLimit: 20,
    perPage: 20,
    template: 'addons/databases/templates/list',
    events: {
      'click button.all': 'selectAll'
    },

    initialize: function (options) {
      var params = app.getParams();
      this.page = params.page ? parseInt(params.page, 10) : 1;
    },

    serialize: function () {
      return {
        databases: this.collection
      };
    },
    establish: function () {
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

    paginated: function () {
      var start = (this.page - 1) * this.perPage;
      var end = this.page * this.perPage;
      return this.collection.slice(start, end);
    },

    beforeRender: function () {
      _.each(this.paginated(), function(database) {
        this.insertView('table.databases tbody', new Views.Item({
          model: database
        }));
      }, this);

      this.insertView('#database-pagination', new Components.Pagination({
        page: this.page,
        perPage: this.perPage,
        total: this.collection.length,
        urlFun: function (page) {
          return '#/_all_dbs?page=' + page;
        }
      }));
    },

    setPage: function (page) {
      this.page = page || 1;
    },

    selectAll: function (event) {
      $('input:checkbox').attr('checked', !$(event.target).hasClass('active'));
    }
  });


  // private Views

  var JumpToDBView = FauxtonAPI.View.extend({
    template: 'addons/databases/templates/jump_to_db',
    events: {
      'submit form#jump-to-db': 'switchDatabase'
    },

    initialize: function () {
      var params = app.getParams();
      this.page = params.page ? parseInt(params.page, 10) : 1;
    },

    establish: function () {
      var currentDBs = this.paginated();
      var deferred = FauxtonAPI.Deferred();

      FauxtonAPI.when(currentDBs.map(function (database) {
        return database.status.fetchOnce();
      })).always(function (resp) {
        // make this always so that even if a user is not allowed access to a database
        // they will still see a list of all databases
        deferred.resolve();
      });
      return [deferred];
    },

    switchDatabase: function (event, selectedName) {
      event && event.preventDefault();

      var dbname = this.$el.find('[name="search-query"]').val().trim();

      if (selectedName) {
        dbname = selectedName;
      }
      if (dbname && this.collection.where({ id: app.utils.safeURLName(dbname) }).length > 0) {
          // TODO: switch to using a model, or Databases.databaseUrl()
          // Neither of which are in scope right now
          // var db = new Database.Model({id: dbname});
          var url = ['/database/', app.utils.safeURLName(dbname), '/_all_docs'].join('');
          FauxtonAPI.navigate(url);
      } else {
        FauxtonAPI.addNotification({
          msg: 'Database does not exist.',
          type: 'error'
        });
      }
    },

    afterRender: function () {
      var that = this,
          AllDBsArray = _.map(this.collection.toJSON(), function (item, key) {
            return item.name;
          });

      this.dbSearchTypeahead = new Components.Typeahead({
        el: 'input.search-autocomplete',
        source: AllDBsArray,
        onUpdate: function (item) {
          that.switchDatabase(null, item);
        }
      });
      this.dbSearchTypeahead.render();
      this.$el.find('.js-db-graveyard').tooltip();
    }
  });

  var NewDatabaseView = FauxtonAPI.View.extend({
    template: 'addons/databases/templates/newdatabase',
    events: {
      'click #add-new-database': 'toggleTray',
      'click #js-create-database': 'createDatabase',
      'keyup #js-new-database-name': 'processKey'
    },

    initialize: function () {
      var hideTray = _.bind(this.hideTray, this),
        trayVisible = _.bind(this.trayVisible, this);

      $('body').on('click.add-new-database', function(e) {
        var $clickEl = $(e.target);

        if (!trayVisible()) { return; }
        if ($clickEl.closest('.add-new-database-btn').length) { return; }

        if (!$clickEl.closest('.new-database-tray').length) {
          hideTray();
        }
      });
    },

    cleanup: function() {
      $('body').off('click.add-new-database');
    },

    processKey: function (e) {
      if (e.which === 13) {
        this.createDatabase(e);
      }
    },

    toggleTray: function (e) {
      e.preventDefault();

      // curious. If we don't prevent bubbling, the parent View is redrawn (?)
      e.stopImmediatePropagation();

      if (this.trayVisible()) {
        this.hideTray();
      } else {
        this.showTray();
      }
    },

    hideTray: function () {
      var $tray = this.$('.tray');
      $tray.velocity('reverse', FauxtonAPI.constants.TRAY_TOGGLE_SPEED, function () {
        $tray.hide();
      });
      this.$('#add-new-database').removeClass('enabled');
    },

    showTray: function () {
      // boo! to be refactored out later (see COUCHDB-2401)
      FauxtonAPI.Events.trigger("APIbar:closeTray");

      this.$('.tray').velocity('transition.slideDownIn', FauxtonAPI.constants.TRAY_TOGGLE_SPEED);
      this.$('#add-new-database').addClass('enabled');
    },

    trayVisible: function () {
      return this.$('.tray').is(':visible');
    },

    createDatabase: function (e) {
      e.preventDefault();

      var databaseName = $.trim(this.$('#js-new-database-name').val());
      if (databaseName.length === 0) {
        FauxtonAPI.addNotification({
          msg: 'Please enter a valid database name',
          type: 'error',
          clear: true
        });
        return;
      }
      this.hideTray();

      var db = new this.collection.model({
        id: databaseName,
        name: databaseName
      });
      FauxtonAPI.addNotification({ msg: 'Creating database.' });

      db.save().done(function () {
          FauxtonAPI.addNotification({
            msg: 'Database created successfully',
            type: 'success',
            clear: true
          });
          var route = '#/database/' + app.utils.safeURLName(databaseName) + '/_all_docs?limit=' + Databases.DocLimit;
          app.router.navigate(route, { trigger: true });
        }
      ).error(function (xhr) {
          var responseText = JSON.parse(xhr.responseText).reason;
          FauxtonAPI.addNotification({
            msg: 'Create database failed: ' + responseText,
            type: 'error',
            clear: true
          });
        }
      );
    }
  });

  return Views;
});
