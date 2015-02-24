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
        'addons/documents/views',
        'addons/documents/resources',
        'addons/databases/base',
        'addons/fauxton/components',
        'testUtils'
], function (Documents, Resources, Databases, Components, testUtils) {
  var assert = testUtils.assert,
      ViewSandbox = testUtils.ViewSandbox,
      viewSandbox;

  describe('AllDocsList', function () {
    it('should load', function () {
      assert.equal(typeof Documents.Views.AllDocsList, 'function');
    });
  });

  describe('Footer', function (done) {
    var footer;

    beforeEach(function () {
      footer = new Documents.Views.Footer();
      viewSandbox = new ViewSandbox();
      viewSandbox.renderView(footer, done);
    });

    afterEach(function () {
      viewSandbox.remove();
    });

    it('removes allDocs if it exists', function () {
      var spy = sinon.spy(footer.allDocsNumber, 'remove');

      footer.remove();

      assert.ok(spy.calledOnce);
    });


    it('does not remove allDocs if it exists', function () {
      var error = false;
      footer.allDocsNumber = false;

      try {
        footer.remove();
      } catch(e) {
        error = true;
      }

      assert.notOk(error);
    });

  });
});
