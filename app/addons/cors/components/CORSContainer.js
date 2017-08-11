import { connect } from 'react-redux';
import CORSScreen from './CORSScreen';
import {
  saveCors, showLoadingBars, fetchAndLoadCORSOptions,
  showDomainDeleteConfirmation, hideDomainDeleteConfirmation
} from '../actions';

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
      dispatch(showLoadingBars());
      dispatch(saveCors(ownProps.url, options));
    },

    fetchAndLoadCORSOptions: () => {
      dispatch(fetchAndLoadCORSOptions(ownProps.url, ownProps.node));
    },

    showDeleteDomainConfirmation: (domain) => {
      dispatch(showDomainDeleteConfirmation(domain));
    },

    hideDeleteDomainConfirmation: () => {
      dispatch(hideDomainDeleteConfirmation());
    }
  };
};

const CORSContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CORSScreen);

export default CORSContainer;
