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
  'testUtils',
  'api',
  'addons/fauxton/stores',
], function (testUtils, FauxtonAPI, Stores) {
  var assert = testUtils.assert;
  var navBarStore = Stores.navBarStore;

  describe('NavBarStore', function () {
    beforeEach(function () {
      FauxtonAPI.dispatch({
        type: 'CLEAR_NAVBAR_LINK',
      });

    });

    describe('add links', function () {

      it('to nav links', function () {
        var link = {
          id: 'mylink'
        };
        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link
        });

        assert.equal(navBarStore.getNavLinks()[0].id, link.id);

      });

      it('to top nav links', function () {
        var link1 = {
          id: 'mylink1'
        };

        var link2 = {
          id: 'mylink2',
          top: true
        };

        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link1
        });

        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link2
        });

        assert.equal(navBarStore.getNavLinks()[0].id, link2.id);

      });

      it('to bottom nav', function () {
        var link = {
          id: 'bottomNav',
          bottomNav: true
        };
        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link
        });

        assert.equal(navBarStore.getBottomNavLinks()[1].id, link.id);
      });

      it('to top of bottom nav', function () {
        var link = {
          id: 'bottomNav',
          bottomNav: true,
          top: true
        };
        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link
        });

        assert.equal(navBarStore.getBottomNavLinks()[0].id, link.id);
      });

      it('to footer nav', function () {
        var link = {
          id: 'footerNav',
          footerNav: true
        };
        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link
        });

        assert.equal(navBarStore.getFooterNavLinks()[0].id, link.id);
      });
    });

    describe('remove link', function () {
      it('from nav links', function () {
        var link = {
          id: 'remove_link',
        };
        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link
        });

        FauxtonAPI.dispatch({
          type: 'REMOVE_NAVBAR_LINK',
          link: link
        });

        assert.equal(navBarStore.getNavLinks().length, 0);
      });

      it('from bottom nav links', function () {
        var link = {
          id: 'remove_link',
          bottomNav: true
        };
        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link
        });

        FauxtonAPI.dispatch({
          type: 'REMOVE_NAVBAR_LINK',
          link: link
        });

        assert.equal(navBarStore.getBottomNavLinks().length, 1);
      });

      it('from bottom nav links', function () {
        var link = {
          id: 'remove_link',
          footerNav: true
        };
        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link
        });

        FauxtonAPI.dispatch({
          type: 'REMOVE_NAVBAR_LINK',
          link: link
        });

        assert.equal(navBarStore.getFooterNavLinks().length, 0);
      });
    });

    describe('update link', function () {
      it('for nav links', function () {
        var link = {
          id: 'update-link',
          title: 'first'
        };
        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: link
        });

        link.title = 'second';

        FauxtonAPI.dispatch({
          type: 'UPDATE_NAVBAR_LINK',
          link: link
        });

        assert.equal(navBarStore.getNavLinks()[0].title, 'second');
      });

    });

    describe('set version', function () {
      it('stores version number', function () {
        FauxtonAPI.dispatch({
          type: 'NAVBAR_SET_VERSION_INFO',
          version: 1234
        });

        assert.equal(navBarStore.getVersion(), 1234);
      });

    });
  });
});
