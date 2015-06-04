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
  'react',
  'testUtils'
], function (FauxtonAPI, React, testUtils) {
  var assert = testUtils.assert,
  restore = testUtils.restore,
  RouteObject = FauxtonAPI.RouteObject;

  describe('RouteObjects', function () {

    describe('renderWith', function () {
      var TestRouteObject, testRouteObject, mockLayout;

      beforeEach(function () {
        TestRouteObject = RouteObject.extend({
          crumbs: ['mycrumbs']
        });

        testRouteObject = new TestRouteObject();
        var apiBar = {};
        apiBar.hide = sinon.spy();

        // Need to find a better way of doing this
        mockLayout = {
          setTemplate: function () {
            var promise = $.Deferred();
            promise.resolve();
            return promise;
          },
          clearBreadcrumbs: sinon.spy(),
          setView: sinon.spy(),
          renderView: sinon.spy(),
          hooks: [],
          setBreadcrumbs: sinon.spy(),
          apiBar: apiBar
        };

      });

      it('Should set template for first render ', function () {
        var setTemplateSpy = sinon.stub(mockLayout, 'setTemplate'),
        promise = $.Deferred();

        promise.resolve();
        setTemplateSpy.returns(promise);
        testRouteObject.renderWith('the-route', mockLayout, 'args');

        assert.ok(setTemplateSpy.calledOnce, 'setTempalte was called');
      });

      it('Should not set template after first render', function () {
        var setTemplateSpy = sinon.stub(mockLayout, 'setTemplate'),
        promise = $.Deferred();

        promise.resolve();
        setTemplateSpy.returns(promise);

        testRouteObject.renderWith('the-route', mockLayout, 'args');
        testRouteObject.renderWith('the-route', mockLayout, 'args');

        assert.ok(setTemplateSpy.calledOnce, 'SetTemplate not meant to be called');
      });

      it('Should call renderReactComponents', function () {
        var renderSpy = sinon.spy(testRouteObject, "renderReactComponents");

        testRouteObject.renderWith('the-route', mockLayout, 'args');
        assert.ok(renderSpy.calledOnce);
      });

      it("Should call establish of routeObject", function () {
        var establishSpy = sinon.spy(testRouteObject, "establish");

        testRouteObject.renderWith('the-route', mockLayout, 'args');
        assert.ok(establishSpy.calledOnce, 'Calls establish');
      });

      it("Should render views", function () {
        var view = new FauxtonAPI.View(),
        getViewsSpy = sinon.stub(testRouteObject, "getViews"),
        viewSpy = sinon.stub(view, "establish");

        view.hasRendered = false;
        view.promise = function () {
          var promise = $.Deferred();
          promise.resolve();
          return promise;
        };
        getViewsSpy.returns({'#view': view});
        mockLayout.renderView = function () { return view;};

        testRouteObject.renderWith('the-route', mockLayout, 'args');
        assert.ok(viewSpy.calledOnce, 'Should render view');
      });

      it("Should not re-render a view", function () {
        var view = new FauxtonAPI.View(),
        getViewsSpy = sinon.stub(testRouteObject, "getViews"),
        viewSpy = sinon.stub(view, "establish");

        view.hasRendered = true;
        getViewsSpy.returns({'#view': view});

        testRouteObject.renderWith('the-route', mockLayout, 'args');
        assert.notOk(viewSpy.calledOnce, 'Should render view');
      });
    });

    describe('React Integration', function () {
      var testRouteObject;

      beforeEach(function () {
        var TestRouteObject = RouteObject.extend({
          crumbs: ['mycrumbs']
        });

        testRouteObject = new TestRouteObject();
        var apiBar = {};
        //apiBar.hide = sinon.spy();

        var mockLayout = {
          setTemplate: function () {
            var promise = $.Deferred();
            promise.resolve();
            return promise;
          },
          clearBreadcrumbs: sinon.spy(),
          setView: sinon.spy(),
          renderView: sinon.spy(),
          hooks: [],
          setBreadcrumbs: sinon.spy(),
          apiBar: apiBar
        };

      });

      describe('setComponent', function () {

        afterEach(function () {
          restore(testRouteObject.removeComponent);
          restore(testRouteObject.removeView);
        });

        it('removes existing view for selector', function () {
          var fakeReactComponent = React.createElement('div');
          var fakeSelector = '.fake-selector';
          var spy = sinon.spy(testRouteObject, 'removeView');

          testRouteObject.setComponent(fakeSelector, fakeReactComponent);

          assert.ok(spy.calledWith(fakeSelector));
        });

        it('removes existing component for selector', function () {
          var fakeReactComponent = React.createElement('div');
          var fakeSelector = '.fake-selector';
          var spy = sinon.spy(testRouteObject, 'removeComponent');

          testRouteObject.setComponent(fakeSelector, fakeReactComponent);

          assert.ok(spy.calledWith(fakeSelector));
        });

        it('sets component for selector', function () {
          var fakeReactComponent = React.createElement('div');
          var fakeSelector = '.fake-selector';

          testRouteObject.setComponent(fakeSelector, fakeReactComponent);
          assert.deepEqual(fakeReactComponent, testRouteObject.reactComponents[fakeSelector].component);
        });

        it('sets props for the selector', function () {
          var fakeReactComponent = React.createElement('div');
          var fakeSelector = '.fake-selector';

          testRouteObject.setComponent(fakeSelector, fakeReactComponent, {foo: 'bar baromat'});
          assert.deepEqual(fakeReactComponent, testRouteObject.reactComponents[fakeSelector].component);
        });

      });

      describe('removeComponent', function () {

        afterEach(function () {
          restore(React.unmountComponentAtNode);
        });

        it('removes existing component via react', function () {
          var spy = sinon.stub(React, 'unmountComponentAtNode');
          var fakeSelector = 'remove-selector';
          testRouteObject.reactComponents[fakeSelector] = React.createElement('div');

          testRouteObject.removeComponent(fakeSelector);

          assert.ok(spy.calledOnce);

        });

        it('removes existing components key', function () {
          var spy = sinon.stub(React, 'unmountComponentAtNode');
          var fakeSelector = 'remove-selector';
          testRouteObject.reactComponents[fakeSelector] = React.createElement('div');

          testRouteObject.removeComponent(fakeSelector);

          assert.ok(_.isUndefined(testRouteObject.reactComponents[fakeSelector]));

        });

        it('does nothing for non existing component', function () {
          var spy = sinon.spy(React, 'unmountComponentAtNode');
          var fakeSelector = 'remove-selector';

          testRouteObject.removeComponent(fakeSelector);

          assert.notOk(spy.calledOnce);

        });

      });
    });

  });


});
