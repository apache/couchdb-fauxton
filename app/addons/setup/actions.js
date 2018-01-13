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
import FauxtonAPI from "../../core/api";
import 'whatwg-fetch';
import {isInvalid} from "./helpers";
import {
  SETUP_ADD_NODE_TO_LIST,
  SETUP_BIND_ADDRESS_ADDITIONAL_NODE,
  SETUP_BIND_ADDRESS_FOR_SINGLE_NODE,
  SETUP_NODE_COUNT,
  SETUP_PORT_ADDITIONAL_NODE,
  SETUP_PORT_FOR_SINGLE_NODE,
  SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE,
  SETUP_RESET_ADDITIONAL_NODE,
  SETUP_SET_CLUSTERSTATUS,
  SETUP_SET_PASSWORD,
  SETUP_SET_USERNAME
} from "./actiontypes";
import {get, rejectFetchError} from '../../core/ajax';
import Api from "../auth/api";


/**
 * @typedef {Object} CredentialObject
 * @param {string} username The username
 * @param {string} password The password
 */


/**
 * Public functions
 */

const getFetchOpts = (method = 'GET', body) => {
  const hasBody = method === 'POST' || method === 'PUT';
  let headers = {'Accept': 'application/json'};
  if (hasBody)
    headers['Content-Type'] = 'application/json';
  let options = {
    credentials: 'include',
    method,
    headers
  };

  if (hasBody)
    options.body = JSON.stringify(body);

  return options;
};


export const getClusterStateFromCouch = () => dispatch => {
  const baseUrl = FauxtonAPI.urls('cluster_setup', 'server');
  return get(baseUrl, {
    headers: {'Accept': 'application/json'},
    credentials: 'include'
  }).then(json => {
    dispatch({
      type: SETUP_SET_CLUSTERSTATUS,
      options: {
        state: json.state
      }
    });
  });
};

export const finishClusterSetup = message => () => {
  const baseUrl = FauxtonAPI.urls('cluster_setup', 'server');
  const body = {action: 'finish_cluster'};
  fetch(baseUrl, getFetchOpts('POST', body)).then(response => {
    if (response.ok) {
      FauxtonAPI.addNotification({
        msg: message,
        type: 'success',
        fade: false,
        clear: true
      });
      FauxtonAPI.navigate('#setup/finish');
    } else {
      response.json().then(json => {
        FauxtonAPI.addNotification({
          msg: 'The cluster is already finished. Error:' + json.reason,
          type: 'error',
          fade: false,
          clear: true
        });
      });
    }
  }).catch(err => {
    FauxtonAPI.addNotification({
      msg: 'There was an error. Please check your setup and try again. Error:' + err,
      type: 'error',
      fade: false,
      clear: true
    });
  });
};

export const setupSingleNode = (credentials, setupNode) => () => {
  const baseUrl = FauxtonAPI.urls('cluster_setup', 'server');
  const setupAttrs = {
    action: 'enable_single_node',
    username: credentials.username,
    password: credentials.password,
    bind_address: setupNode.bindAddress,
    port: setupNode.port,
    singlenode: true
  };

  const attrsAreInvalid = isInvalid(setupAttrs);

  if (attrsAreInvalid) {
    FauxtonAPI.addNotification({
      msg: attrsAreInvalid,
      type: 'error',
      fade: false,
      clear: true
    });
    return Promise.resolve();
  }

  return fetch(baseUrl, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(setupAttrs)
  }).then(response => {
    if (!response.ok) {
      return rejectFetchError(response);
    }
    return Api.login({name: credentials.username, password: credentials.password});

  }).then(() => {
    FauxtonAPI.addNotification({
      msg: 'Single node setup successful.',
      type: 'success',
      fade: false,
      clear: true
    });
    FauxtonAPI.navigate('#setup/finish');
  }).catch((err) => {
    FauxtonAPI.addNotification({
      msg: "The cluster has not been setuped successfully. Error: " + err,
      type: 'error',
      fade: false,
      clear: true
    });
  });
};

/**
 * Add a node to the current cluster configuration
 * 1. Enable cluster for the current node
 * 2. Enable cluster for the remote node
 * 3. Add the remote node
 * @param isOrWasAdminParty
 * @param credentials
 * @param setupNode
 * @param additionalNode
 */
export const addNode = (isOrWasAdminParty, credentials, setupNode, additionalNode) => dispatch => {
  const baseUrl = FauxtonAPI.urls('cluster_setup', 'server');
  const enableSetupData = {
    action: 'enable_cluster',
    username: credentials.username,
    password: credentials.password,
    bind_address: setupNode.bindAddress,
    port: setupNode.port,
    node_count: setupNode.nodeCount,
    singlenode: false
  };

  const attrsAreInvalid = isInvalid({
    username: credentials.username,
    password: credentials.password,
    ...setupNode
  });

  if (attrsAreInvalid) {
    FauxtonAPI.addNotification({
      msg: attrsAreInvalid,
      type: 'error',
      fade: false,
      clear: true
    });
    return Promise.resolve();
  }

  let enableNodeData = {
    action: 'enable_cluster',
    username: credentials.username,
    password: credentials.password,
    bind_address: additionalNode.bindAddress,
    port: additionalNode.port,
    node_count: setupNode.nodeCount,
    remote_node: additionalNode.remoteAddress,
    remote_current_user: credentials.username,
    remote_current_password: credentials.password
  };

  if (isOrWasAdminParty) {
    delete enableNodeData.remote_current_user;
    delete enableNodeData.remote_current_password;
  }

  const additionalNodeDataIsInvalid = isInvalid(enableNodeData);

  if (additionalNodeDataIsInvalid) {
    FauxtonAPI.addNotification({
      msg: additionalNodeDataIsInvalid,
      type: 'error',
      fade: false,
      clear: true
    });
    return Promise.resolve();
  }

  const continueSetup = () => {
    const addNodeData = {
      action: 'add_node',
      username: credentials.username,
      password: credentials.password,
      host: additionalNode.remoteAddress,
      port: additionalNode.port,
      singlenode: false
    };

    //Enable the remote node
    return fetch(baseUrl, getFetchOpts('POST', enableNodeData)).then(resp => {
      if (!resp.ok) {
        return rejectFetchError(resp);
      }
      return fetch(baseUrl, getFetchOpts('POST', addNodeData));

    }).then(response => {
      if (!response.ok) {
        return rejectFetchError(response);
      }
      dispatch({
        type: SETUP_ADD_NODE_TO_LIST,
        options: {
          value: {
            port: additionalNode.port,
            remoteAddress: additionalNode.remoteAddress
          }
        }
      });
      FauxtonAPI.addNotification({
        msg: 'Added node',
        type: 'success',
        fade: false,
        clear: true
      });

    }).catch(err => {
      FauxtonAPI.addNotification({
        msg: 'Unable to add the node. Error:' + err,
        type: 'error',
        fade: false,
        clear: true
      });
    });
  };

  return fetch(baseUrl, getFetchOpts('POST', enableSetupData)).then(() => {
    return Api.login({name: credentials.username, password: credentials.password});
  }).then(() => {
    continueSetup();
  }).catch(err => {
    FauxtonAPI.addNotification({
      msg: 'An error occured while adding the node. Error:' + err,
      type: 'error',
      fade: false,
      clear: true
    });
  });
};

export const resetAddtionalNodeForm = () => {
  return {
    type: SETUP_RESET_ADDITIONAL_NODE,
  };
};

export const alterPortAdditionalNode = value => {
  return {
    type: SETUP_PORT_ADDITIONAL_NODE,
    options: {
      value: value
    }
  };
};

export const alterRemoteAddressAdditionalNode = value => {
  return {
    type: SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE,
    options: {
      value: value
    }
  };
};

export const alterBindAddressAdditionalNode = value => {
  return {
    type: SETUP_BIND_ADDRESS_ADDITIONAL_NODE,
    options: {
      value: value
    }
  };
};

export const setUsername = value => {
  return {
    type: SETUP_SET_USERNAME,
    options: {
      value: value
    }
  };
};

export const setPassword = value => {
  return {
    type: SETUP_SET_PASSWORD,
    options: {
      value: value
    }
  };
};

export const setPortForSetupNode = value => {
  return {
    type: SETUP_PORT_FOR_SINGLE_NODE,
    options: {
      value: value
    }
  };
};

export const setBindAddressForSetupNode = value => {
  return {
    type: SETUP_BIND_ADDRESS_FOR_SINGLE_NODE,
    options: {
      value: value
    }
  };
};

export const setNodeCount = value => {
  return {
    type: SETUP_NODE_COUNT,
    options: {
      value: value
    }
  };
};


