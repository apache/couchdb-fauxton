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

import { connect } from 'react-redux';

import ExplainPage from './ExplainPage';
import Actions from '../mango.actions';

const mapStateToProps = ({ mangoQuery }, ownProps) => {
  return {
    explainPlan: ownProps.explainPlan,
    viewFormat: mangoQuery.explainViewFormat,
    isReasonsModalVisible: mangoQuery.isReasonsModalVisible
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onViewFormatChange: (options) => {
      dispatch(Actions.setExplainViewFormat(options));
    },
    resetState: () => {
      dispatch(Actions.resetState());
    },
    hideReasonsModal: () => {
      dispatch(Actions.hideReasonsModal());
    },
    showReasonsModal: () => {
      dispatch(Actions.showReasonsModal());
    },
  };
};

const ExplainPageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ExplainPage);

export default ExplainPageContainer;
