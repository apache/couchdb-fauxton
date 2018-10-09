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

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PartitionKeySelector from './PartitionKeySelector';
import { checkDbPartitioned } from './actions';

const mapStateToProps = ({ partitionKey }, ownProps) => {
  return {
    selectorVisible: partitionKey.selectorVisible,
    databaseName: ownProps.databaseName,
    partitionKey: ownProps.partitionKey,
    onPartitionKeySelected: ownProps.onPartitionKeySelected,
    globalMode: ownProps.globalMode
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    checkDbPartitioned: (databaseName) => {
      dispatch(checkDbPartitioned(databaseName));
    }
  };
};

const PartitionKeySelectorContainer = connect (
  mapStateToProps,
  mapDispatchToProps
)(PartitionKeySelector);

export default PartitionKeySelectorContainer;

PartitionKeySelectorContainer.propTypes = {
  databaseName: PropTypes.string.isRequired,
  partitionKey: PropTypes.string.isRequired,
  onPartitionKeySelected: PropTypes.func.isRequired,
  onGlobalModeSelected: PropTypes.func.isRequired,
  globalMode: PropTypes.bool
};
