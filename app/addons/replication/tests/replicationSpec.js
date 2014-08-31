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
        'addons/replication/base',
        'addons/replication/views',
        'addons/replication/resources',
        'testUtils'
], function (Replication, Views, Resources, testUtils) {
  var assert = testUtils.assert,
      ViewSandbox = testUtils.ViewSandbox,
      viewSandbox;

  describe('Replication Addon', function () {
    describe('Replication View', function () {
      var view = new Views.ReplicationForm({
        collection: new Replication.DBList()
      });
      beforeEach(function (done) {
        viewSandbox = new ViewSandbox();
        viewSandbox.renderView(view, done);
      });

      afterEach(function () {
        viewSandbox.remove();
      });

      it("should render", function () {
        assert.ok(view.$el.length > 0);
      });
    });
  });
});
