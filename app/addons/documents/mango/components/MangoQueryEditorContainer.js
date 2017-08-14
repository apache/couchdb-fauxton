import { connect } from 'react-redux';
import MangoQueryEditor from './MangoQueryEditor';
import {
  getIndexList
} from '../mango.actions';

const mapStateToProps = ({ mangoQuery }, ownProps) => {
  console.log('mapStateToProps::state:', mangoQuery);
  return {
    database: mangoQuery.database,
    queryFindCode: mangoQuery.queryFindCode,
    queryFindCodeChanged: mangoQuery.queryFindCodeChanged,
    availableIndexes: mangoQuery.availableIndexes,
    additionalIndexes: mangoQuery.additionalIndexes,
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
      dispatch(getIndexList(ownProps.options));
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
