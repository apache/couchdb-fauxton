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

import ActionTypes from "./actiontypes";

const initialState = {
      corsEnabled: false,
      origins: [],
      isAllOrigins: false,
      configChanged: false,
      shouldSaveChange: false,
      node: '',
      isLoading: true,
      deleteDomainModalVisible: false,
      domainToDelete: ''
};

export default function cors (state = initialState, action) {
  switch (action.type) {

    case ActionTypes.EDIT_CORS:
      console.log('reducing ' + action.type + ' using ', action);
      const corsOptions = action.options;
      return Object.assign({}, state, {
        isLoading: false,
        node: corsOptions.node,
        corsEnabled: corsOptions.corsEnabled,
        isAllOrigins: _.include(corsOptions.origins, '*'),
        origins: corsOptions.origins,
        deleteDomainModalVisible: false,
        domainToDelete: ''
      });

    case ActionTypes.CORS_SHOW_DELETE_DOMAIN_MODAL:
      console.log('reducing ' + action.type + ' using ', action);
      return Object.assign({}, state, {
        deleteDomainModalVisible: true,
        domainToDelete: action.domainToDelete
      });

    case ActionTypes.CORS_HIDE_DELETE_DOMAIN_MODAL:
      console.log('reducing ' + action.type + ' using ', action);
      return Object.assign({}, state, {
        deleteDomainModalVisible: false,
        domainToDelete: ''
      });

    case ActionTypes.CORS_SET_IS_LOADING:
      console.log('reducing ' + action.type + ' using ', action);
      return Object.assign({}, state, {
        isLoading: action.isLoading
      });

    default:
      return state;
  }
};

