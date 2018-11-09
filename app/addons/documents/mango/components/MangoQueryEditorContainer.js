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
import * as IndexResultActions from '../../index-results/actions/fetch';
import * as IndexResultBaseActions from '../../index-results/actions/base';
import MangoQueryEditor from './MangoQueryEditor';
import Helpers from '../mango.helper';
import Actions from '../mango.actions';
import * as MangoAPI from '../mango.api';

const getAvailableQueryIndexes = ({ availableIndexes }) => {
  if (!availableIndexes) {
    return [];
  }
  return availableIndexes.filter(({ type }) => {
    return ['json', 'special'].includes(type);
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

  return additionalIndexes.filter((el) => {
    return el.get('type').indexOf(indexes.type) !== -1;
  });
};

const mapStateToProps = (state, ownProps) => {
  const mangoQuery = state.mangoQuery;
  const indexResults = state.indexResults;

  return {
    databaseName: ownProps.databaseName,
    queryFindCode: Helpers.formatCode(mangoQuery.queryFindCode),
    queryFindCodeChanged: mangoQuery.queryFindCodeChanged,
    availableIndexes: getAvailableQueryIndexes(mangoQuery),
    additionalIndexes: getAvailableAdditionalIndexes(mangoQuery),
    isLoading: mangoQuery.isLoading,
    history: mangoQuery.history,
    description: ownProps.description,
    editorTitle: ownProps.editorTitle,
    additionalIndexesText: ownProps.additionalIndexesText,
    fetchParams: indexResults.fetchParams,
    executionStats: indexResults.executionStats,
    warning: indexResults.warning,
    partitionKey: ownProps.partitionKey
  };
};

const mapDispatchToProps = (dispatch/*, ownProps*/) => {
  return {
    loadQueryHistory: (options) => {
      dispatch(Actions.loadQueryHistory(options));
    },

    runExplainQuery: (options) => {
      dispatch(Actions.runExplainQuery(options));
    },

    runQuery: (options) => {
      const queryDocs = (params) => {
        return MangoAPI.mangoQueryDocs(options.databaseName, options.partitionKey, options.queryCode, params);
      };

      dispatch(Actions.hideQueryExplain());
      dispatch(Actions.newQueryFindCode(options));
      dispatch(IndexResultActions.fetchDocs(queryDocs, options.fetchParams, {}));
    },

    clearResults: () => {
      dispatch(IndexResultBaseActions.resetState());
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
