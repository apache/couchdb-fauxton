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
import reducer, {options} from '../reducers';

describe('Config Reducer', () => {
  const editConfigAction = {
    type: ActionTypes.EDIT_CONFIG,
    options: {
      sections: {
        test: { b: 1, c: 2, a: 3 }
      }
    }
  };
  describe('fetchConfig', () => {
    it('sorts options ascending', () => {
      const newState = reducer(undefined, editConfigAction);
      expect(options(newState)[0].optionName).toBe('a');
    });

    it('sets the first option as the header', () => {
      const newState = reducer(undefined, editConfigAction);
      expect(options(newState)[0].header).toBe(true);
    });
  });

  describe('editOption', () => {
    it('sets the option that is being edited', () => {
      let newState = reducer(undefined, editConfigAction);
      const opts = options(newState);
      opts.forEach(el => {
        expect(el.editing).toBe(false);
      });

      const editOptionAction = {
        type: ActionTypes.EDIT_OPTION,
        options: {
          sectionName: 'test',
          optionName: 'b'
        }
      };
      newState = reducer(newState, editOptionAction);
      const opts2 = options(newState);
      expect(opts2[1].editing).toBe(true);
    });
  });

  describe('saveOption', () => {
    it('sets new option value', () => {
      let newState = reducer(undefined, editConfigAction);
      expect(options(newState)[1].value).toBe(1);

      const saveOptionAction = {
        type: ActionTypes.OPTION_SAVE_SUCCESS,
        options: {
          sectionName: 'test',
          optionName: 'b',
          value: 'new_value'
        }
      };
      newState = reducer(newState, saveOptionAction);
      expect(options(newState)[1].value).toBe('new_value');
    });
  });

  describe('deleteOption', () => {
    it('deletes option from section', () => {
      let newState = reducer(undefined, editConfigAction);
      expect(options(newState).length).toBe(3);

      const deleteOptionAction = {
        type: ActionTypes.OPTION_DELETE_SUCCESS,
        options: {
          sectionName: 'test',
          optionName: 'b'
        }
      };
      newState = reducer(newState, deleteOptionAction);
      expect(options(newState).length).toBe(2);
    });

    it('deletes section when all options are deleted', () => {
      let newState = reducer(undefined, editConfigAction);
      expect(options(newState).length).toBe(3);

      const deleteOptionAction = {
        type: ActionTypes.OPTION_DELETE_SUCCESS,
        options: {
          sectionName: 'test',
          optionName: 'a'
        }
      };
      newState = reducer(newState, deleteOptionAction);
      deleteOptionAction.options.optionName = 'b';
      newState = reducer(newState, deleteOptionAction);
      deleteOptionAction.options.optionName = 'c';
      newState = reducer(newState, deleteOptionAction);
      expect(options(newState).length).toBe(0);
    });
  });
});
