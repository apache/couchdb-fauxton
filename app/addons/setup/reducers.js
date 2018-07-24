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

import {
  SETUP_SET_CLUSTERSTATUS,
  SETUP_SET_USERNAME,
  SETUP_SET_PASSWORD,
  SETUP_BIND_ADDRESS_FOR_SINGLE_NODE,
  SETUP_PORT_FOR_SINGLE_NODE,
  SETUP_PORT_ADDITIONAL_NODE,
  SETUP_BIND_ADDRESS_ADDITIONAL_NODE,
  SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE,
  SETUP_ADD_NODE_TO_LIST,
  SETUP_RESET_ADDITIONAL_NODE,
  SETUP_NODE_COUNT
} from './actiontypes';
import FauxtonAPI from "../../core/api";
import _ from "lodash";


const initialState = {
  clusterState: '',
  username: '',
  password: '',
  setupNode: {
    bindAddress: '0.0.0.0',
    port: 5984,
    nodeCount: 3
  },
  nodeList: [],
  additionalNode: {
    bindAddress: '0.0.0.0',
    port: 5984,
    remoteAddress: '127.0.0.1'
  }
};

export default function setup(state = initialState, action) {
  const {options, type} = action;
  switch (type) {
    case SETUP_SET_CLUSTERSTATUS:
      return updateState(state, 'clusterState', options.state);
    case SETUP_SET_USERNAME:
      return updateState(state, 'username', options.value);
    case SETUP_SET_PASSWORD:
      return updateState(state, 'password', options.value);
    case SETUP_BIND_ADDRESS_FOR_SINGLE_NODE:
      return updateState(state, 'setupNode.bindAddress', options.value);
    case SETUP_PORT_FOR_SINGLE_NODE:
      return updateStateIfNotNaN(state, 'setupNode.port', parseInt(options.value));
    case SETUP_PORT_ADDITIONAL_NODE:
      return updateStateIfNotNaN(state, 'additionalNode.port', parseInt(options.value));
    case SETUP_BIND_ADDRESS_ADDITIONAL_NODE:
      return updateState(state, 'additionalNode.bindAddress', options.value);
    case SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE:
      return updateState(state, 'additionalNode.remoteAddress', options.value);
    case SETUP_ADD_NODE_TO_LIST:
      let addNodeListState = getStateCopy(state);
      addNodeListState.nodeList.push(options.value);
      resetAdditionalNode(addNodeListState);
      return addNodeListState;
    case SETUP_RESET_ADDITIONAL_NODE:
      return resetAdditionalNode(getStateCopy(state));
    case SETUP_NODE_COUNT:
      return updateStateIfNotNaN(state, 'setupNode.nodeCount', parseInt(options.value));
    default:
      return state;
  }
}

/**
 * Manual nested copy of the state object.
 * @param state The current state to copy.
 * @returns {{setupNode: {}, additionalNode: {}}}
 */
export const getStateCopy = (state) => {
  return {
    ...state,
    setupNode: {
      ...state.setupNode
    },
    additionalNode: {
      ...state.additionalNode
    }
  };
};

export const updateStateIfNotNaN = (state, path, value) => {
  let stateCopy = getStateCopy(state);
  if (_.isNaN(value)) {
    return stateCopy;
  }
  return _.set(stateCopy, path, value);
};

/**
 * Update a particular value for a state
 * @param state The state to update
 * @param path The property path to update
 * @param value The value to update
 */
const updateState = (state, path, value) => {
  let statecopy = getStateCopy(state);
  return _.set(statecopy, path, value);
};

/**
 * Reset the current additionalNode state for the initial one.
 * @param state The state to update
 * @returns {*}
 */
const resetAdditionalNode = state => {
  state.additionalNode = Object.assign({}, initialState.additionalNode);
  return state;
};

export const getState = state => state;
export const getClusterState = state => state.clusterState;
export const getNodeList = state => state.nodeList;
export const getIsAdminParty = () => FauxtonAPI.session.isAdminParty();
export const getUsername = state => state.username;
export const getPassword = state => state.password;
export const getSetupNode = state => state.setupNode;
export const getPortForSetupNode = state => state.setupNode.port;
export const getBindAddressForSetupNode = state => state.setupNode.bindAddress;
export const getNodeCountForSetupNode = state => state.setupNode.nodeCount;
export const getAdditionalNode = state => state.additionalNode;
export const getHostForSetupNode = () => '127.0.0.1';
