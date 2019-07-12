import { connect } from 'react-redux';
import CORSScreen from './CORSScreen';
import Actions from '../actions';

const mapStateToProps = ({ cors }) => {
  return {
    node: cors.node,
    corsEnabled: cors.corsEnabled,
    isAllOrigins: cors.isAllOrigins,
    isLoading: cors.isLoading,
    origins: cors.origins,
    deleteDomainModalVisible: cors.deleteDomainModalVisible,
    domainToDelete: cors.domainToDelete
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    saveCORS: (options) => {
      dispatch(Actions.showLoadingBars());
      dispatch(Actions.saveCors(ownProps.url, options));
    },

    fetchAndLoadCORSOptions: () => {
      dispatch(Actions.fetchAndLoadCORSOptions(ownProps.url, ownProps.node));
    },

    showDeleteDomainConfirmation: (domain) => {
      dispatch(Actions.showDomainDeleteConfirmation(domain));
    },

    hideDeleteDomainConfirmation: () => {
      dispatch(Actions.hideDomainDeleteConfirmation());
    }
  };
};

const CORSContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CORSScreen);

export default CORSContainer;
