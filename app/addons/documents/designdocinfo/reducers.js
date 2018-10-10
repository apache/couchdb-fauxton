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

import ActionTypes from './actiontypes';

const initialState = {
  isLoading: true,
  viewIndex: undefined
};

export default function designDocInfo (state = initialState, action) {
  const { options } = action;

  switch (action.type) {

    case ActionTypes.DESIGN_FETCHING:
      return {
        ...state,
        isLoading: true
      };

    case ActionTypes.DESIGN_DOC_MONITOR:
      return {
        ...state,
        isLoading: false,
        viewIndex: options.designDocInfo.get('view_index')
      };

    case ActionTypes.DESIGN_DOC_REFRESH:
      return {
        ...state,
        viewIndex: options.designDocInfo.get('view_index')
      };

    default:
      return state;
  }
}
