import { connect } from 'react-redux';
import FauxtonAPI from "../../../../core/api";
import MangoQueryEditor from './MangoQueryEditor';
import Helpers from '../mango.helper';
import Actions from '../mango.actions';

const getAvailableQueryIndexes = ({ availableIndexes }) => {
  if (!availableIndexes) {
    return [];
  }
  return availableIndexes.filter(function ({ type }) {
    // if (el && el.type) {
      return ['json', 'special'].indexOf(type) !== -1;
    // }
    // return false;
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

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    // saveCORS: (options) => {
    //   dispatch(showLoadingBars());
    //   dispatch(saveCors(ownProps.url, options));
    // },

    fetchAndLoadIndexList: () => {
      console.log('Loading indexes...', ownProps);
      console.log(Actions.getIndexList);
      dispatch(Actions.getIndexList({ databaseName: ownProps.databaseName }));
    },

    // showDeleteDomainConfirmation: (domain) => {
    //   dispatch(showDomainDeleteConfirmation(domain));
    // },

    // hideDeleteDomainConfirmation: () => {
    //   dispatch(hideDomainDeleteConfirmation());
    // }
  };
};

const MangoQueryEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MangoQueryEditor);

export default MangoQueryEditorContainer;
