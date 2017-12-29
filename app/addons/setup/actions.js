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
    SETUP_BIND_ADDRESS_FOR_SINGLE_NODE, SETUP_NODE_COUNT, SETUP_PORT_ADDITIONAL_NODE, SETUP_PORT_FOR_SINGLE_NODE,
    SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE, SETUP_RESET_ADDITIONAL_NODE,
    SETUP_SET_CLUSTERSTATUS, SETUP_SET_PASSWORD, SETUP_SET_USERNAME
} from "./actiontypes";
import Api from "../auth/api";


export default {

    getClusterStateFromCouch: function () {
        const baseUrl = FauxtonAPI.urls('_setup', 'apiurl');
        fetch(baseUrl)
            .then((response) => {
                response.json();
            })
            .then((json) => {
                FauxtonAPI.dispatch({
                    type: SETUP_SET_CLUSTERSTATUS,
                    options: {
                        state: json.state
                    }
                });
            });
    },

    finishClusterSetup: function (message) {
        const baseUrl = FauxtonAPI.urls('_setup', 'app');
        fetch(baseUrl, {
            method: 'POST',
            body: {
                action: 'finish_cluster'
            }
        }).then(() => {
            FauxtonAPI.addNotification({
                msg: message,
                type: 'success',
                fade: false,
                clear: true
            });
            FauxtonAPI.navigate('#setup/finish');
        }).catch((err) => {
            FauxtonAPI.addNotification({
                msg: 'There was an error. Please check your setup and try again. Error:' + err,
                type: 'error',
                fade: false,
                clear: true
            });
        });
    },

    setupSingleNode: function (credentials, setupNode) {
        const baseUrl = FauxtonAPI.urls('_setup', 'app');
        const setupAttrs = {
            action: 'enable_single_node',
            username: credentials.username,
            password: credentials.password,
            bind_address: setupNode.bindAddress,
            port: setupNode.port,
            singlenode: true
        };

        const attributesArevalids = isInvalid(setupAttrs);

        if (attributesArevalids) {
            FauxtonAPI.addNotification({
                msg: attributesArevalids,
                type: 'error',
                fade: false,
                clear: true
            });
        } else {
            fetch(baseUrl, {
                method: 'POST',
                body: setupAttrs
            }).then(function () {
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
        }
    },

    addNode: function (isOrWasAdminParty, credentials, setupNode, additionalNode) {
        const baseUrl = FauxtonAPI.urls('_setup', 'app');
        const setupNodeData = {
            action: 'enable_cluster',
            username: credentials.username,
            password: credentials.password,
            bind_address: setupNode.bindAddress,
            port: setupNode.port,
            node_count: setupNode.nodeCount,
            singlenode: false
        };

        const attributesArevalids = isInvalid(setupNode);

        if (attributesArevalids) {
            FauxtonAPI.addNotification({
                msg: attributesArevalids,
                type: 'error',
                fade: false,
                clear: true
            });
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
        }
        fetch(baseUrl, {
            method: 'POST',
            body: setupNodeData
        }).then(() => {
            Api.login({name: credentials.username, password: credentials.password}).then(function () {
                continueSetup(credentials, additionalNode);
            });
        });

        function continueSetup(credentials, additionalNode) {
            const attributes = {
                action: 'add_node',
                username: credentials.username,
                password: credentials.password,
                host: additionalNode.remoteAddress,
                port: additionalNode.port,
                singlenode: false
            };

            fetch(baseUrl, {
                method: 'POST',
                body: attributes
            })
                .then(function () {
                    FauxtonAPI.dispatch({
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
                })
                .fail(function (xhr) {
                    var responseText = JSON.parse(xhr.responseText).reason;
                    FauxtonAPI.addNotification({
                        msg: 'Adding node failed: ' + responseText,
                        type: 'error',
                        fade: false,
                        clear: true
                    });
                });
        }
    },

    resetAddtionalNodeForm: function () {
        FauxtonAPI.dispatch({
            type: SETUP_RESET_ADDITIONAL_NODE,
        });
    },

    alterPortAdditionalNode: function (value) {
        FauxtonAPI.dispatch({
            type: SETUP_PORT_ADDITIONAL_NODE,
            options: {
                value: value
            }
        });
    },

    alterRemoteAddressAdditionalNode: function (value) {
        FauxtonAPI.dispatch({
            type: SETUP_REMOTE_ADDRESS_ADDITIONAL_NODE,
            options: {
                value: value
            }
        });
    },

    alterBindAddressAdditionalNode: function (value) {
        FauxtonAPI.dispatch({
            type: SETUP_BIND_ADDRESS_ADDITIONAL_NODE,
            options: {
                value: value
            }
        });
    },

    setUsername: function (value) {
        FauxtonAPI.dispatch({
            type: SETUP_SET_USERNAME,
            options: {
                value: value
            }
        });
    },

    setPassword: function (value) {
        FauxtonAPI.dispatch({
            type: SETUP_SET_PASSWORD,
            options: {
                value: value
            }
        });
    },

    setPortForSetupNode: function (value) {
        FauxtonAPI.dispatch({
            type: SETUP_PORT_FOR_SINGLE_NODE,
            options: {
                value: value
            }
        });
    },

    setBindAddressForSetupNode: function (value) {
        FauxtonAPI.dispatch({
            type: SETUP_BIND_ADDRESS_FOR_SINGLE_NODE,
            options: {
                value: value
            }
        });
    },

    setNodeCount: function (value) {
        FauxtonAPI.dispatch({
            type: SETUP_NODE_COUNT,
            options: {
                value: value
            }
        });
    }
};
