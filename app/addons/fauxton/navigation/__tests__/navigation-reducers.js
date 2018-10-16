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

import ActionTypes from '../actiontypes';
import reducer from '../reducers';

describe('NavBar Reducer', () => {

  describe('add links', () => {

    it('to nav links', () => {
      const action = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: {
          id: 'mylink'
        }
      };
      const newState = reducer(undefined, action);
      expect(newState.navLinks[0].id).toMatch(action.link.id);
    });

    it('to top nav links', () => {
      const action1 = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: { id: 'mylink1' }
      };
      const action2 = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: { id: 'mylink2', top: true }
      };
      let newState = reducer(undefined, action1);
      newState = reducer(newState, action2);

      expect(newState.navLinks[0].id).toMatch(action2.link.id);
    });

    it('to bottom nav', () => {
      const action = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: {
          id: 'bottomNav',
          bottomNav: true
        }
      };
      const newState = reducer(undefined, action);
      expect(newState.bottomNavLinks[0].id).toMatch(action.link.id);
    });

    it('to top of bottom nav', () => {
      const action = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: {
          id: 'bottomNav',
          bottomNav: true,
          top: true
        }
      };
      const newState = reducer(undefined, action);
      expect(newState.bottomNavLinks[0].id).toMatch(action.link.id);
    });

    it('to footer nav', () => {
      const action = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: {
          id: 'footerNav',
          footerNav: true
        }
      };
      const newState = reducer(undefined, action);
      expect(newState.footerNavLinks[0].id).toMatch(action.link.id);
    });
  });

  describe('remove link', () => {
    it('from nav links', () => {
      const action = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: {
          id: 'remove_link'
        }
      };
      let newState = reducer(undefined, action);
      action.type = ActionTypes.REMOVE_NAVBAR_LINK;
      newState = reducer(newState, action);

      expect(newState.navLinks.length).toBe(0);
    });

    it('remove link from list only when it exists', () => {
      const addAction = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: {
          id: 'remove_link1',
          footerNav: true
        }
      };
      let newState = reducer(undefined, addAction);
      addAction.link = { id: 'remove_link2', footerNav: true };
      newState = reducer(newState, addAction);
      addAction.link = { id: 'remove_link3', footerNav: true };
      newState = reducer(newState, addAction);
      expect(newState.footerNavLinks.length).toBe(3);

      const removeAction = {
        type: ActionTypes.REMOVE_NAVBAR_LINK,
        link: addAction.link
      };
      newState = reducer(newState, removeAction);
      newState = reducer(newState, removeAction);
      newState = reducer(newState, removeAction);
      expect(newState.footerNavLinks.length).toBe(2);
    });

    it('from bottom nav links', () => {
      const action = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: {
          id: 'remove_link',
          bottomNav: true
        }
      };
      let newState = reducer(undefined, action);
      action.type = ActionTypes.REMOVE_NAVBAR_LINK;
      newState = reducer(newState, action);

      expect(newState.bottomNavLinks.length).toBe(0);
    });

    it('from footer nav links', () => {
      const action = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: {
          id: 'remove_link',
          footerNav: true
        }
      };
      let newState = reducer(undefined, action);
      action.type = ActionTypes.REMOVE_NAVBAR_LINK;
      newState = reducer(newState, action);

      expect(newState.footerNavLinks.length).toBe(0);
    });
  });

  describe('update link', () => {
    it('for nav links', () => {
      const action = {
        type: ActionTypes.ADD_NAVBAR_LINK,
        link: {
          id: 'update-link',
          title: 'first'
        }
      };
      let newState = reducer(undefined, action);
      action.type = ActionTypes.UPDATE_NAVBAR_LINK;
      action.link.title = 'second';
      newState = reducer(newState, action);

      expect(newState.navLinks[0].title).toMatch('second');
    });

  });

  describe('set version', () => {
    it('stores version number', () => {
      const action = {
        type: ActionTypes.NAVBAR_SET_VERSION_INFO,
        version: 1234
      };
      const newState = reducer(undefined, action);
      expect(newState.version).toBe(1234);
    });

  });
});
