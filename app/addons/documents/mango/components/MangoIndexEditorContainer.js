import { connect } from 'react-redux';
import MangoIndexEditor from './MangoIndexEditor';
import Helpers from '../mango.helper';
// import Actions from '../mango.actions';

const mapStateToProps = ({ mangoQuery }, ownProps) => {
  console.log('MangoIndexEditor::mapStateToProps::state:', mangoQuery);
  console.log('MangoIndexEditor::ownProps:', ownProps);
  return {
    description: ownProps.description,
    databaseName: ownProps.databaseName,
    queryIndexCode: Helpers.formatCode(mangoQuery.queryIndexCode)
  };
};

const mapDispatchToProps = (dispatch/*, ownProps*/) => {
  return {
    saveQuery: (options) => {
      // dispatch(showLoadingBars());
      //dispatch(Actions.saveQuery(options));
      console.log('saveQuery::NOT_IMPLEMENTED::', options, dispatch);
    }

    // fetchAndLoadIndexList: () => {
    //   dispatch(getIndexList(ownProps.options));
    // },

    // showDeleteDomainConfirmation: (domain) => {
    //   dispatch(showDomainDeleteConfirmation(domain));
    // },

    // hideDeleteDomainConfirmation: () => {
    //   dispatch(hideDomainDeleteConfirmation());
    // }
  };
};

const MangoIndexEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MangoIndexEditor);

export default MangoIndexEditorContainer;
