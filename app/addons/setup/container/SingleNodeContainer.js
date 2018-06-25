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
import SingleNodeController from '../components/SingleNodeController';
import {
  getIsAdminParty,
  getBindAddressForSetupNode,
  getPortForSetupNode,
  getNodeList,
  getPassword,
  getSetupNode,
  getUsername
} from '../reducers';
import {setBindAddressForSetupNode, setPassword, setPortForSetupNode, setupSingleNode, setUsername} from "../actions";

const mapStateToProps = ({setup}) => {
  return {
    nodeList: getNodeList(setup),
    isAdminParty: getIsAdminParty(setup),
    setupNode: getSetupNode(setup),
    username: getUsername(setup),
    password: getPassword(setup),
    port: getPortForSetupNode(setup),
    bindAddress: getBindAddressForSetupNode(setup)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    alterUsername(username) {
      dispatch(setUsername(username));
    },
    alterPassword(password) {
      dispatch(setPassword(password));
    },
    alterBindAddress(bindAddress) {
      dispatch(setBindAddressForSetupNode(bindAddress));
    },
    alterPort(port) {
      dispatch(setPortForSetupNode(port));
    },
    setupSingleNode(credentials, setupNode) {
      dispatch(setupSingleNode(credentials, setupNode));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleNodeController);
