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
import FauxtonAPI from "../../../../core/api";
import Stores from "../stores";
const navBarStore = Stores.navBarStore;

describe('NavBarStore', () => {
  beforeEach(() => {
    FauxtonAPI.dispatch({
      type: 'CLEAR_NAVBAR_LINK',
    });

  });

  describe('add links', () => {

    it('to nav links', () => {
      var link = {
        id: 'mylink'
      };
      FauxtonAPI.dispatch({
        type: 'ADD_NAVBAR_LINK',
        link: link
      });

      expect(navBarStore.getNavLinks()[0].id).toMatch(link.id);
    });

    it('to top nav links', () => {
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

      expect(navBarStore.getNavLinks()[0].id).toMatch(link2.id);
    });

    it('to bottom nav', () => {
      var link = {
        id: 'bottomNav',
        bottomNav: true
      };
      FauxtonAPI.dispatch({
        type: 'ADD_NAVBAR_LINK',
        link: link
      });

      expect(navBarStore.getBottomNavLinks()[0].id).toMatch(link.id);
    });

    it('to top of bottom nav', () => {
      var link = {
        id: 'bottomNav',
        bottomNav: true,
        top: true
      };
      FauxtonAPI.dispatch({
        type: 'ADD_NAVBAR_LINK',
        link: link
      });

      expect(navBarStore.getBottomNavLinks()[0].id).toMatch(link.id);
    });

    it('to footer nav', () => {
      var link = {
        id: 'footerNav',
        footerNav: true
      };
      FauxtonAPI.dispatch({
        type: 'ADD_NAVBAR_LINK',
        link: link
      });

      expect(navBarStore.getFooterNavLinks()[0].id).toMatch(link.id);
    });
  });

  describe('remove link', () => {
    it('from nav links', () => {
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

      expect(navBarStore.getNavLinks().length).toBe(0);
    });

    it('remove link from list', () => {
      const addLink = (id) => {
        FauxtonAPI.dispatch({
          type: 'ADD_NAVBAR_LINK',
          link: {
            id: id,
            footerNav: true
          }
        });
      };
      const removeLink = () => {
        FauxtonAPI.dispatch({
          type: 'REMOVE_NAVBAR_LINK',
          link: {
            id: 'remove_link3',
            footerNav: true
          }
        });
      };
      addLink('remove_link1');
      addLink('remove_link2');
      addLink('remove_link3');

      removeLink();
      removeLink();
      removeLink();

      expect(navBarStore.getFooterNavLinks().length).toBe(2);
    });

    it('from bottom nav links', () => {
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

      expect(navBarStore.getBottomNavLinks().length).toBe(0);
    });

    it('from footer nav links', () => {
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

      expect(navBarStore.getFooterNavLinks().length).toBe(0);
    });
  });

  describe('update link', () => {
    it('for nav links', () => {
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

      expect(navBarStore.getNavLinks()[0].title).toMatch('second');
    });

  });

  describe('set version', () => {
    it('stores version number', () => {
      FauxtonAPI.dispatch({
        type: 'NAVBAR_SET_VERSION_INFO',
        version: 1234
      });

      expect(navBarStore.getVersion()).toBe(1234);
    });

  });
});
