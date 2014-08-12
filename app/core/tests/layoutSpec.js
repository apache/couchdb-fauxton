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
  'api',
  'testUtils'
], function (FauxtonAPI, testUtils) {
  var assert = testUtils.assert;

  describe("Fauxton Layout", function () {
    var layout;

    beforeEach(function () {
      layout = new FauxtonAPI.Layout();
    });

    describe('#setTemplate', function () {

      it("Should set template without prefix", function () {
        layout.setTemplate('myTemplate');

        assert.equal(layout.layout.template, 'templates/layouts/myTemplate');

      });

      it("Should set template with prefix", function () {
        layout.setTemplate({name: 'myTemplate', prefix: 'myPrefix/'});

        assert.equal(layout.layout.template, 'myPrefix/myTemplate');
      });

      it("Should remove old views", function () {
        var view = new FauxtonAPI.View();

        layout.setView('#selector', view);

        var removeSpy = sinon.spy(view, 'removeView');
        layout.setTemplate('myTemplate');
        assert.ok(removeSpy.calledOnce);

      });

      it("Should render", function () {
        var mockRender = sinon.spy(layout, 'render');

        layout.setTemplate('myTemplate');

        assert.ok(mockRender.calledOnce);

      });

    });

    describe('#setView', function () {
      var view;
      beforeEach(function () {
        view = new FauxtonAPI.View();
      });

      it("Should keep record of view", function () {
        layout.setView('.selector', view);
        assert.equal(view, layout.layoutViews['.selector']);
      });

      it("Should not keep record of view if keep is false", function () {
        layout.setView('.selector', view, true);
        assert.ok(_.isUndefined(layout.layoutViews['.selector']));
        assert.equal(view, layout.permanentViews['.selector']);
      });

    });

    describe('#removeView', function () {
      var view;

      beforeEach(function () {
        view = new FauxtonAPI.View();
        layout.setView('#selector', view);
      });

      it('Should remove view from layout', function () {
        var removeSpy = sinon.spy(layout.layout, 'removeView');

        layout.removeView('#selector');
        assert.ok(removeSpy.calledOnce);
      });

      it('Should remove view from list of active views', function () {
        layout.setView('#selector', view);
        layout.removeView('#selector');

        assert.ok(_.isUndefined(layout.layoutViews['#selector']));
      });

      it("should return false if view doesn't exist", function () {
        assert.notOk(layout.removeView('#fake'));
      });

    });

    describe('#renderView', function () {
      var view;

      beforeEach(function () {
        view = new FauxtonAPI.View();
        layout.setView('#selector', view);
      });

      it('should render view', function () {
        var renderSpy = sinon.spy(view, 'render');
        layout.renderView('#selector');
        assert.ok(renderSpy.calledOnce);
      });

      it('should not render a non-existing view', function () {
        assert.notOk(layout.renderView('#fake'));
      });

    });
  });
});
