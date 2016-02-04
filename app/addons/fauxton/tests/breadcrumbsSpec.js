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
  '../base',
  '../../../../test/mocha/testUtils',
  'sinon'
], function (FauxtonAPI, Fauxton, testUtils, sinon) {
  var assert = testUtils.assert;

  describe('Breadcrumbs', function () {

    describe('can be overriden in routeObject', function () {
      var routeObj;

      beforeEach(function () {
        var RouteObj = FauxtonAPI.RouteObject.extend({
          overrideBreadcrumbs: true,
          crumbs: ["crumb"]
        });
        routeObj = new RouteObj({});
      });

      it('should not remove old breadcrumbs', function () {
        var removeViewSpy = sinon.spy(FauxtonAPI.masterLayout, 'removeView');

        routeObj.triggerBroadcast('beforeEstablish');
        assert.notOk(removeViewSpy.called);
        FauxtonAPI.masterLayout.removeView.restore();
      });
    });

    //Breadcrumbs are create and managed in Fauxton/base.js
    //If the route object has a crumbs function a breadcrumbs view is created
    //and rendered on the page in #breadcrumbs
    describe('Auto creation of breadcrumbs', function () {
      var routeObj;

      beforeEach(function () {
        var RouteObj = FauxtonAPI.RouteObject.extend({
          crumbs: ["crumb1", "crumb2"]
        });
        routeObj = new RouteObj({});
      });

      afterEach(function () {
        if (FauxtonAPI.masterLayout.removeView.restore) {
          FauxtonAPI.masterLayout.removeView.restore();
        }

        if (FauxtonAPI.masterLayout.setView.restore) {
          FauxtonAPI.masterLayout.setView.restore();
        }
      });

      it('should remove old breadcrumbs', function () {
        var removeViewSpy = sinon.spy(FauxtonAPI.masterLayout, 'removeView');

        routeObj.triggerBroadcast('beforeEstablish');
        assert.ok(removeViewSpy.called);
      });

      it('should create new breadcrumbs', function () {
        var setViewSpy = sinon.spy(FauxtonAPI.masterLayout, 'setView');

        routeObj.triggerBroadcast('beforeEstablish');
        assert.equal(setViewSpy.getCall(0).args[0], '#breadcrumbs');
      });

      it('should not create new breadcrumbs when no crumbs are on routeObject', function () {
        var removeViewSpy = sinon.spy(FauxtonAPI.masterLayout, 'setView');
        routeObj.crumbs = [];
        routeObj.triggerBroadcast('beforeEstablish');

        assert.notOk(removeViewSpy.called);
      });

    });
  });


});
