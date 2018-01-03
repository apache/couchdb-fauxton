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
import {get} from '../../core/ajax';
import Api from "../auth/api";

/**
 * @typedef {Object} CredentialObject
 * @param {string} username The username
 * @param {string} password The password
 */


/**
 * Public functions
 */


export const getClusterStateFromCouch = () => dispatch => {
    const baseUrl = FauxtonAPI.urls('cluster_setup', 'apiurl');
    return get(baseUrl).then(json => {
        console.log(json.state);
        dispatch({
            type: SETUP_SET_CLUSTERSTATUS,
            options: {
                state: json.state
            }
        });
    });
};

export const finishClusterSetup = message => {
    const baseUrl = FauxtonAPI.urls('cluster_setup', 'app');
    fetch(baseUrl, {
        action: 'finish_cluster'
    }).then(response => {
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
                    msg: 'The cluster is already finished. Error:' + json.error,
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

export const setupSingleNode = (credentials, setupNode) => {
    const baseUrl = FauxtonAPI.urls('cluster_setup', 'app');
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
        return;
    }

    fetch(baseUrl, {
        method: 'POST',
        body: setupAttrs
    }).then(response => {
        if (response.ok) {
            Api.login({name: credentials.username, password: credentials.password})
                .then(() => {
                    FauxtonAPI.addNotification({
                        msg: 'Single node setup successful.',
                        type: 'success',
                        fade: false,
                        clear: true
                    });
                    FauxtonAPI.navigate('#setup/finish');
                });
        } else {
            response.json(json => {
                FauxtonAPI.addNotification({
                    msg: 'The cluster is already finished. Error:' + json.error,
                    type: 'error',
                    fade: false,
                    clear: true
                });
            });
        }
    }).catch((err) => {
        FauxtonAPI.addNotification({
            msg: "The cluster has not been setuped successfully. Error: " + err,
            type: 'error',
            fade: false,
            clear: true
        });
    });
};

export const addNode = (isOrWasAdminParty, credentials, setupNode, additionalNode) => dispatch => {
    const baseUrl = FauxtonAPI.urls('cluster_setup', 'app');
    const setupNodeData = {
        action: 'enable_cluster',
        username: credentials.username,
        password: credentials.password,
        bind_address: setupNode.bindAddress,
        port: setupNode.port,
        node_count: setupNode.nodeCount,
        singlenode: false
    };

    const attrsAreInvalid = isInvalid(setupNode);

    if (attrsAreInvalid) {
        FauxtonAPI.addNotification({
            msg: attrsAreInvalid,
            type: 'error',
            fade: false,
            clear: true
        });
        return Promise.resolve();
    }

    let additionalNodeData = {
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
        delete additionalNodeData.remote_current_user;
        delete additionalNodeData.remote_current_password;
    }

    const additionalNodeDataIsInvalid = isInvalid(additionalNodeData);

    if (additionalNodeDataIsInvalid) {
        FauxtonAPI.addNotification({
            msg: additionalNodeDataIsInvalid,
            type: 'error',
            fade: false,
            clear: true
        });
        return Promise.resolve();
    }

    const continueSetup = (credentials, additionalNode) => {
        const attributes = {
            action: 'add_node',
            username: credentials.username,
            password: credentials.password,
            host: additionalNode.remoteAddress,
            port: additionalNode.port,
            singlenode: false
        };

        return fetch(baseUrl, {
            method: 'POST',
            body: attributes
        }).then(response => {
            if (response.ok) {
                dispatch({
                    type: SETUP_ADD_NODE_TO_LIST,
                    options: {
                        value: {
                            port: additionalNode.node,
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
            } else {
                response.json(json => {
                    FauxtonAPI.addNotification({
                        msg: 'Unable to add the node. Error:' + json.error,
                        type: 'error',
                        fade: false,
                        clear: true
                    });
                });
            }
        }).catch((err) => {
            FauxtonAPI.addNotification({
                msg: 'Adding node failed. Error:' + err,
                type: 'error',
                fade: false,
                clear: true
            });
        });
    };

    return fetch(baseUrl, {
        method: 'POST',
        body: setupNodeData
    }).then(response => {
        if (response.ok) {
            Api.login({name: credentials.username, password: credentials.password}).then(() => {
                continueSetup(credentials, additionalNode);
            });
        } else {
            response.json(json => {
                FauxtonAPI.addNotification({
                    msg: 'The cluster is already finished. Error:' + json.error,
                    type: 'error',
                    fade: false,
                    clear: true
                });
            });
        }
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


