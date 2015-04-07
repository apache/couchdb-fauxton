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
  "addons/config/resources",
  "addons/fauxton/components"
],
function (app, FauxtonAPI, Config, Components) {
  var Views = {};

  Views.TableRow = FauxtonAPI.View.extend({
    tagName: "tr",
    className: "config-item",
    template: "addons/config/templates/item",
    events: {
      "dblclick .js-edit-value": "editValue",
      "click .js-delete-value": "deleteValue",
      "click .js-cancel-value": "cancelEdit",
      "click .js-save-value": "saveAndRender",
      "keyup .js-value-input": "processKeyEvents"
    },

    deleteValue: function () {
      var collection = this.collection,
          result = confirm("Are you sure you want to delete this configuration value?");

      if (!result) { return; }

      this.model.destroy().done(function () {
        collection.fetch({reset: true}).done(function () {
          FauxtonAPI.Events.trigger("config:rerender");
        });
      });

      this.remove();
    },

    editValue: function (event) {
      this.$(event.currentTarget).find(".js-show-value").addClass("js-hidden");
      this.$(event.currentTarget).find(".js-edit-value-form").removeClass("js-hidden");
      this.$(event.currentTarget).find(".js-value-input").focus();
    },

    processKeyEvents: function (event) {
      // Enter key
      if (event.keyCode === 13) {
        return this.saveAndRender(event);
      }
      // Esc key
      if (event.keyCode === 27) {
        return this.discardValue(event);
      }
    },

    discardValue: function (event) {
      this.$(event.currentTarget).parents('td').find(".js-edit-value-form").addClass("js-hidden");
      this.$(event.currentTarget).parents('td').find(".js-show-value").removeClass("js-hidden");
    },

    cancelEdit: function (event) {
      this.discardValue(event);
    },

    serialize: function () {
      return {option: this.model.toJSON()};
    },

    saveAndRender: function (event) {
      var options = {},
          $input = this.$(event.currentTarget).parents('td').find(".js-value-input"),
          sectionName,
          nameInSectionExists;

      options[$input.attr('name')] = $input.val();

      if ($input.attr('name') === 'name') {
        sectionName = this.model.get("section");
        nameInSectionExists = this.collection.findEntryInSection(sectionName, $input.val());
        if (nameInSectionExists) {
          FauxtonAPI.addNotification({
            msg: "This config already exists, enter a unique name",
            type: "error",
            clear: true
          });
        } else {
          var newModel = this.model.clone();
          newModel.save(options);
          this.model.destroy();
          this.model = newModel;
          this.render();
        }
      } else {
        this.model.save(options);
        this.render();
      }
    }

  });

  Views.Table = FauxtonAPI.View.extend({
    template: "addons/config/templates/dashboard",

    initialize: function () {
      this.listenTo(FauxtonAPI.Events, "config:newSection", this.render);
      this.listenTo(FauxtonAPI.Events, "config:rerender", this.render);
    },

    beforeRender: function () {
      var collection = this.collection;

      this.collection.each(function (config) {
        _.each(config.get("options"), function (option, index) {
          this.insertView("table.config tbody", new Views.TableRow({
            collection: collection,
            model: new Config.OptionModel({
              section: config.get("section"),
              name: option.name,
              value: option.value,
              index: index
            })
          }));
        }, this);
      }, this);
    },

    establish: function () {
      return [this.collection.fetch()];
    }
  });

  Views.ConfigHeader = FauxtonAPI.View.extend({
    template: 'addons/config/templates/header',
    className: 'header-right',

    initialize: function () {
      this.rightHeader = this.setView('#add-section-button', new Views.AddConfigOptionsButton({ collection: this.collection }));
    }
  });


  Views.AddConfigOptionsButton = Components.Tray.extend({
    template: 'addons/config/templates/add_config_option',

    events: {
      'click #js-create-config-section': 'createConfigOption'
    },

    initialize: function () {
      this.initTray({ toggleTrayBtnSelector: '#add-new-section' });
    },

    processKey: function (e) {
      if (e.which === 13) {
        e.preventDefault();
        this.createConfigOption();
      }
    },

    afterRender: function () {
      this.sectionNames = _.map(this.collection.toJSON(), function (item) {
        return item.section;
      });

      this.sectionTypeAhead = new Components.Typeahead({
        source: this.sectionNames,
        el: 'input[name="section"]'
      });
      this.sectionTypeAhead.render();
    },

    createConfigOption: function (e) {
      if (e) {
        e.preventDefault();
      }

      var section = this.$('input[name="section"]').val(),
          name = this.$('input[name="name"]').val(),
          value = this.$('input[name="value"]').val(),
          collection = this.collection;

      // perform a little validation, then submit
      if (!section) {
        this.showError('Please enter or select a section.');
      } else if (!name) {
        this.showError('Please add an option name.');
      } else if (this.isUniqueEntryInSection(collection)) {
        this.showError('The option have a unique name.');
      } else if (!value) {
        this.showError('Please add a value.');
      } else {
        this.submitForm();
      }
    },

    submitForm: function () {
      var option = new Config.OptionModel({
        section: this.$('input[name="section"]').val(),
        name: this.$('input[name="name"]').val(),
        value: this.$('input[name="value"]').val()
      });
      option.save();

      var section = this.collection.find(function (section) {
        return section.get('section') === option.get('section');
      });

      if (section) {
        section.get('options').push(option.attributes);
      } else {
        this.collection.add({
          section: option.get('section'),
          options: [option.attributes]
        });
      }

      this.hideTray();
      FauxtonAPI.Events.trigger('config:newSection');
    },

    isUniqueEntryInSection: function (collection) {
      var sectionName = this.$('input[name="section"]').val(),
          entry = this.$('input[name="name"]').val();

      return collection.findEntryInSection(sectionName, entry);
    },

    showError: function (msg) {
      FauxtonAPI.addNotification({
        msg: msg,
        type: 'error',
        clear: true
      });
    }
  });

  Views.Tabs = FauxtonAPI.View.extend({
    className: "sidenav",
    tagName: "nav",
    template: 'addons/config/templates/sidebartabs',
    initialize: function (options) {
      this.sidebarItems = options.sidebarItems;
    },

    setSelectedTab: function (selectedTab) {
      this.selectedTab = selectedTab;
      this.$('li').removeClass('active');
      this.$('a[data-type-select="' + this.selectedTab + '"]').parent("li").addClass('active');
    },
    afterRender: function () {
      this.setSelectedTab(this.selectedTab);
    },

    serialize: function () {
      return {
        sidebarItems: this.sidebarItems
      };
    }
  });

  Views.BackdoorPortInfo = FauxtonAPI.View.extend({
    tagName: 'div',
    template: 'addons/config/templates/infoscreen'
  });

  var errorHandler = function (xhr, type, msg) {
    msg = xhr;
    if (arguments.length === 3) {
      msg = xhr.responseJSON.reason;
    }

    FauxtonAPI.addNotification({
      msg: msg,
      type: 'error'
    });
  };

  Views.CreateAdminView = FauxtonAPI.View.extend({
    template: 'addons/config/templates/create_admin',
    className: 'auth-page',

    initialize: function (options) {
      options = options || {};
      this.loginAfter = options.loginAfter === false ? false : true;
    },

    events: {
      'submit #create-admin-form': 'createAdmin'
    },

    createAdmin: function (event) {
      event.preventDefault();

      var username = this.$('#username').val(),
          password = this.$('#password').val();

      var promise = this.model.createAdmin(username, password, this.loginAfter);

      promise.then(function () {
        FauxtonAPI.addNotification({
          msg: FauxtonAPI.session.messages.adminCreated,
        });

        if (this.login_after) {
          FauxtonAPI.navigate('/');
        } else {
          this.$('#username').val('');
          this.$('#password').val('');
        }
      }.bind(this));

      promise.fail(function (xhr, type, msg) {
        msg = xhr;
        if (arguments.length === 3) {
          msg = xhr.responseJSON.reason;
        }
        msg = FauxtonAPI.session.messages.adminCreationFailedPrefix + ' ' + msg;
        errorHandler(msg);
      });
    },

    afterRender: function () {
      $('#username').focus();
    }
  });

  Views.ChangePassword = FauxtonAPI.View.extend({
    template: 'addons/config/templates/change_password',
    className: 'auth-page',

    events: {
      'submit #change-password': 'changePassword'
    },

    changePassword: function (event) {
      event.preventDefault();

      var newPassword = this.$('#password').val(),
          passwordConfirm = this.$('#password-confirm').val();

      var promise = this.model.changePassword(newPassword, passwordConfirm);

      promise.done(function () {
        FauxtonAPI.addNotification({msg: FauxtonAPI.session.messages.changePassword});
        this.$('#password').val('');
        this.$('#password-confirm').val('');
      }.bind(this));

      promise.fail(errorHandler);
    },

    afterRender: function () {
      $('#password').focus();
    }
  });

  Views.NavDropDown = FauxtonAPI.View.extend({
    template: 'addons/config/templates/nav_dropdown',

    beforeRender: function () {
      this.listenTo(FauxtonAPI.session, 'change', this.render);
    },

    setTab: function (selectedTab) {
      this.selectedTab = selectedTab;
      this.$('.active').removeClass('active');
      var $tab = this.$('a[data-select="' + selectedTab + '"]');
      $tab.parent().addClass('active');
    },

    afterRender: function () {
      if (this.selectedTab) {
        this.setTab(this.selectedTab);
      }
    },

    serialize: function () {
      return {
        user: FauxtonAPI.session.user()
      };
    }
  });

  return Views;
});
