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
import FauxtonAPI from "../../../../core/api";
import IndexResultActions from "../../index-results/actions";
import MangoQueryEditor from './MangoQueryEditor';
import Helpers from '../mango.helper';
import Actions from '../mango.actions';

const getAvailableQueryIndexes = ({ availableIndexes }) => {
  if (!availableIndexes) {
    return [];
  }
  return availableIndexes.filter(function ({ type }) {
      return ['json', 'special'].indexOf(type) !== -1;
  });
};

const getAvailableAdditionalIndexes = ({ additionalIndexes }) => {
  if (!additionalIndexes) {
    return [];
  }
  const indexes = FauxtonAPI.getExtensions('mango:additionalIndexes')[0];
  if (!indexes) {
    return;
  }

  return additionalIndexes.filter(function (el) {
    return el.get('type').indexOf(indexes.type) !== -1;
  });
};

const mapStateToProps = (state, ownProps) => {
  const mangoQuery = state.mangoQuery;
  console.log('MangoQueryEditor::mapStateToProps::state:', state);
  return {
    // database: mangoQuery.database,
    databaseName: ownProps.databaseName,
    queryFindCode: Helpers.formatCode(mangoQuery.queryFindCode),
    queryFindCodeChanged: mangoQuery.queryFindCodeChanged,
    availableIndexes: getAvailableQueryIndexes(mangoQuery),
    additionalIndexes: getAvailableAdditionalIndexes(mangoQuery),
    isLoading: mangoQuery.isLoading,
    description: ownProps.description,
    editorTitle: ownProps.editorTitle,
    additionalIndexesText: ownProps.additionalIndexesText
  };
};

const mapDispatchToProps = (dispatch/*, ownProps*/) => {
  return {
    runExplainQuery: (options) => {
      dispatch(Actions.runExplainQuery(options));
    },

    runQuery: (options) => {
      dispatch(Actions.hideQueryExplain());
      IndexResultActions.runMangoFindQuery(options);
    },

    manageIndexes: () => {
      dispatch(Actions.hideQueryExplain());
    }

  };
};

const MangoQueryEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MangoQueryEditor);

export default MangoQueryEditorContainer;
