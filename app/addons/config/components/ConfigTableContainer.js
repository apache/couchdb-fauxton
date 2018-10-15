//  Licensed under the Apache License, Version 2.0 (the "License"); you may not
//  use this file except in compliance with the License. You may obtain a copy of
//  the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
//  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
//  License for the specific language governing permissions and limitations under
//  the License.

import { connect } from 'react-redux';
import ConfigTableScreen from './ConfigTableScreen';
import * as Actions from '../actions';
import { options } from '../reducers';

const mapStateToProps = ({ config }, ownProps) => {
  return {
    node: ownProps.node,
    options: options(config),
    loading: config.loading,
    saving: config.saving,
    editSectionName: config.editSectionName,
    editOptionName: config.editOptionName,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAndEditConfig: (node) => {
      dispatch(Actions.fetchAndEditConfig(node));
    },

    saveOption: (node, options) => {
      dispatch(Actions.saveOption(node, options));
    },

    deleteOption: (node, options) => {
      dispatch(Actions.deleteOption(node, options));
    },

    editOption: (options) => {
      dispatch(Actions.editOption(options));
    },

    cancelEdit: (options) => {
      dispatch(Actions.cancelEdit(options));
    }
  };
};

const ConfigTableContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfigTableScreen);

export default ConfigTableContainer;
