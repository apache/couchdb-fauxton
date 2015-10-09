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
  'api',
  'testUtils',
  'addons/components/stores',
  'addons/components/actions'
], function (app, FauxtonAPI, utils, Stores, ComponentActions, Resources) {

  var assert = utils.assert;
  var componentStore = Stores.componentStore;

  describe('Components Store', function () {

    afterEach(function () {
      componentStore.reset();
    });

    it("UPDATE_API_BAR only updates whatever data is passed", function () {
      var url    = 'http://whoanelly.com';
      var docURL = 'http://website.com/docs';
      ComponentActions.updateAPIBar({
        visible: false,
        endpoint: url,
        docURL: docURL
      });
      assert.equal(componentStore.isAPIBarVisible(), false);
      assert.equal(componentStore.getEndpoint(), url);
      assert.equal(componentStore.getDocURL(), docURL);

      ComponentActions.updateAPIBar({
        visible: true
      });
      assert.equal(componentStore.isAPIBarVisible(), true);
      assert.equal(componentStore.getEndpoint(), url);
      assert.equal(componentStore.getDocURL(), docURL);

      var newEndpoint = 'http://movies.com';
      ComponentActions.updateAPIBar({
        endpoint: newEndpoint
      });
      assert.equal(componentStore.isAPIBarVisible(), true);
      assert.equal(componentStore.getEndpoint(), newEndpoint);
      assert.equal(componentStore.getDocURL(), docURL);

      var newDocURL = 'http://newwebsite.org';
      ComponentActions.updateAPIBar({
        docURL: newDocURL
      });
      assert.equal(componentStore.isAPIBarVisible(), true);
      assert.equal(componentStore.getEndpoint(), newEndpoint);
      assert.equal(componentStore.getDocURL(), newDocURL);
    });

  });

});
