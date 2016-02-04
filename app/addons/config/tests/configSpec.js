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
  '../../../core/api',
  '../resources',
  '../views',
  '../../../../test/mocha/testUtils',
  'sinon'
], function (FauxtonAPI, Resources, Views, testUtils, sinon) {
  var assert = testUtils.assert,
      ViewSandbox = testUtils.ViewSandbox,
      collection;

  beforeEach(function () {
    var optionModels = [];

    _.each([1, 2, 3], function (i) {
      var model = new Resources.OptionModel({
        section: "foo" + i,
        name: "bar" + i,
        options: [{
          name: "testname"
        }]
      }, {node: 'foo'});

      optionModels.push(model);
    });

    collection = new Resources.Collection(optionModels, {node: 'foo'}, "foo");
  });

  describe("Config: Add Option Tray", function () {
    var viewSandbox,
        tray;

    beforeEach(function (done) {
      tray = new Views.AddConfigOptionsButton({
        collection: collection
      });

      viewSandbox = new ViewSandbox();
      viewSandbox.renderView(tray, done);
    });

    afterEach(function () {
      viewSandbox.remove();
    });

    it("looks if entries are new", function () {
      tray.$('input[name="section"]').val("foo1");
      tray.$('input[name="name"]').val("testname");
      assert.ok(tray.isUniqueEntryInSection(collection));

      tray.$('input[name="name"]').val("testname2");
      assert.notOk(tray.isUniqueEntryInSection(collection));
    });

    it("does not send an error for a new section", function () {
      tray.$('input[name="section"]').val("newsection");
      tray.$('input[name="name"]').val("testname");
      tray.$('input[name="value"]').val("testvalue");
      var spy = sinon.spy(tray, "showError");

      tray.createConfigOption();
      assert.notOk(spy.called);
    });
  });

  describe("Config: Collection", function () {
    it("looks if entries are new", function () {
      assert.ok(collection.findEntryInSection("foo1", "testname"));
      assert.notOk(collection.findEntryInSection("foo1", "testname2"));
    });

    it("returns false if findEntryInSection does not have the section", function () {
      assert.notOk(collection.findEntryInSection("foo-not-exists", "testname"));
    });
  });

  describe("Config: TableRow", function () {
    var tabMenu, optionModel;

    beforeEach(function () {
      optionModel = new Resources.OptionModel({
        section: "foo",
        name: "bar"
      }, {node: 'foo'});

      tabMenu = new Views.TableRow({
        model: optionModel,
        uniqueName: function () {
          return false;
        }
      });
    });

    describe("editing Items", function () {
      var viewSandbox;
      beforeEach(function (done) {
        viewSandbox = new ViewSandbox();
        viewSandbox.renderView(tabMenu, done);
      });

      afterEach(function () {
        viewSandbox.remove();
      });

      it("click on save should save the model and render", function () {
        var renderSpy = sinon.stub(tabMenu, 'render');
        var saveSpy = sinon.stub(optionModel, 'save');

        var $fields = tabMenu.$('.js-edit-value').filter(function (el) {
          return $(this).find('[name="value"]').length;
        });

        $fields.find('.js-edit-value').trigger('dblclick');
        $fields.find('.js-save-value').trigger('click');

        assert.ok(renderSpy.calledOnce);
        assert.ok(saveSpy.calledOnce);
      });

      it("pressing enter should save the model and render", function () {
        var renderSpy = sinon.stub(tabMenu, 'render');
        var saveSpy = sinon.stub(optionModel, 'save');

        var e = $.Event("keyup");
        e.keyCode = 13;

        var $fields = tabMenu.$('.js-edit-value').filter(function (el) {
          return $(this).find('[name="value"]').length;
        });

        $fields.find('.js-value-input').trigger(e);

        assert.ok(renderSpy.calledOnce);
        assert.ok(saveSpy.calledOnce);
      });

      it("pressing Esc hides the field", function () {
        var e = $.Event("keyup");
        e.keyCode = 27;
        tabMenu.$('.js-value-input').trigger(e);

        assert.ok(tabMenu.$('.js-edit-value-form').hasClass('js-hidden'));
      });

      it("pressing Cancel hides the field", function () {
        tabMenu.$('.js-edit-value').trigger('dblclick');
        tabMenu.$('.js-cancel-value').trigger('click');

        assert.ok(tabMenu.$('.js-edit-value-form').hasClass('js-hidden'));
      });
    });
  });
});
