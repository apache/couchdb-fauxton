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

import sidebar from "../reducers";
import ActionTypes from "../actiontypes";

function isVisible (state, designDoc, indexGroup) {
  if (!state.toggledSections[designDoc]) {
    return false;
  }
  if (indexGroup) {
    return state.toggledSections[designDoc].indexGroups[indexGroup];
  }
  return state.toggledSections[designDoc].visible;
}

describe('Sidebar Reducer', () => {

  describe('toggle state', () => {

    it('should be visible after being toggled', () => {
      const designDoc = 'designDoc';
      const action = {
        type: ActionTypes.SIDEBAR_TOGGLE_CONTENT,
        designDoc: designDoc
      };
      const newState = sidebar(undefined, action);
      expect(isVisible(newState, designDoc)).toBeTruthy();
    });

    it('should not be visible after being toggled twice', () => {
      const designDoc = 'designDoc2';
      const action = {
        type: ActionTypes.SIDEBAR_TOGGLE_CONTENT,
        designDoc: designDoc
      };
      let newState = sidebar(undefined, action);
      newState = sidebar(newState, action);
      expect(isVisible(newState, designDoc)).toBe(false);
    });

  });

  describe('toggle state for index', () => {
    const designDoc = 'design-doc';
    const indexGroup = 'index';
    const action = {
      type: ActionTypes.SIDEBAR_TOGGLE_CONTENT,
      designDoc: designDoc,
      indexGroup: indexGroup
    };

    it('should toggle the state', () => {
      let newState = sidebar(undefined, action);
      expect(isVisible(newState, designDoc)).toBeTruthy();

      newState = sidebar(newState, action);
      expect(isVisible(newState, designDoc, indexGroup)).toBeTruthy();

      newState = sidebar(newState, action);
      expect(isVisible(newState, designDoc, indexGroup)).toBe(false);
    });

  });
});
