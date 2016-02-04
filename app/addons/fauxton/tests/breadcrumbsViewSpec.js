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
  '../../../app',
  '../components',
  '../../../../test/mocha/testUtils',
], function (app, Components, testUtils) {
  var assert = testUtils.assert,
    ViewSandbox = testUtils.ViewSandbox;

  describe('Breadcrumbs', function () {

    describe('3 Breadcrumbs', function () {
      var breadcrumbs, viewSandbox;

      // async setup with done-callback
      beforeEach(function (done) {

        // initialize a Breadcrumb-View with fake data
        breadcrumbs = new Components.Breadcrumbs({
          crumbs: [
            { link: "/root", name: "root" },
            { link: "/first", name: "first" },
            { link: "/second", name: "second" }
          ]
        });

        // render in a view-sandbox, which attaches it to the DOM
        // for us, so we can test it
        viewSandbox = new ViewSandbox();
        viewSandbox.renderView(breadcrumbs, done);
      });

      afterEach(function () {
        // sync cleanup (done callback not provided)!
        viewSandbox.remove();
      });

      // sync test
      it('should have 2 dividers between 3 breadcrumbs', function () {
        assert.equal(2, breadcrumbs.$('.divider').length);
      });
    });


    describe('2 Breadcrumbs, one empty', function () {
      var breadcrumbs, viewSandbox;

      beforeEach(function (done) {
        breadcrumbs = new Components.Breadcrumbs({
          crumbs: [
            {link: "/root", name: "" },
            {link: "/root", name: "crumb 2" }
          ]
        });
        viewSandbox = new ViewSandbox();
        viewSandbox.renderView(breadcrumbs, done);
      });

      afterEach(function () {
        viewSandbox.remove();
      });

      it('should have 0 dividers for 2 breadcrumb when one is empty', function () {
        assert.equal(0, breadcrumbs.$('.divider').length);
      });
    });


    describe('1 Breadcrumb', function () {
      var breadcrumbs, viewSandbox;

      beforeEach(function (done) {
        breadcrumbs = new Components.Breadcrumbs({
          crumbs: [
            {link: "/root", name: "root"}
          ]
        });
        viewSandbox = new ViewSandbox();
        viewSandbox.renderView(breadcrumbs, done);
      });

      afterEach(function () {
        viewSandbox.remove();
      });

      it('should have 0 dividers for 1 breadcrumb', function () {
        assert.equal(0, breadcrumbs.$('.divider').length);
      });
    });

  });
});
