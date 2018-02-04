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
import {connect} from 'react-redux';
import MultipleNodeController from '../components/MultipleNodeController';
import {getNodeList, getIsAdminParty, getAdditionalNode, getUsername, getPassword, getSetupNode} from '../reducers';
import {
  addNode,
  alterBindAddressAdditionalNode, alterPortAdditionalNode, alterRemoteAddressAdditionalNode, finishClusterSetup,
  setBindAddressForSetupNode, setNodeCount, setPassword,
  setPortForSetupNode, setUsername
} from "../actions";

const mapStateToProps = ({setup}) => {
  return {
    nodeList: getNodeList(setup),
    isAdminParty: getIsAdminParty(setup),
    setupNode: getSetupNode(setup),
    username: getUsername(setup),
    password: getPassword(setup),
    additionalNode: getAdditionalNode(setup)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addNode(isAdminParty, credentials, setupNode, additionalNode) {
      dispatch(addNode(isAdminParty, credentials, setupNode, additionalNode));
    },
    alterPortAdditionalNode(port) {
      dispatch(alterPortAdditionalNode(port));
    },
    alterBindAddressAdditionalNode(bindAddress) {
      dispatch(alterBindAddressAdditionalNode(bindAddress));
    },
    alterRemoteAddressAdditionalNode(remoteAddress) {
      dispatch(alterRemoteAddressAdditionalNode(remoteAddress));
    },
    alterUsername(username) {
      dispatch(setUsername(username));
    },
    alterPassword(password) {
      dispatch(setPassword(password));
    },
    alterBindAddressForSetupNode(bindAddress) {
      dispatch(setBindAddressForSetupNode(bindAddress));
    },
    alterPortForSetupNode(port) {
      dispatch(setPortForSetupNode(port));
    },
    finishClusterSetup(msg) {
      dispatch(finishClusterSetup(msg));
    },
    alterNodeCount(nodeCount) {
      dispatch(setNodeCount(nodeCount));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultipleNodeController);
