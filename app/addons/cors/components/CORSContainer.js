import { connect } from 'react-redux';

import CORSScreen from './CORSScreen';
import { saveCors, showLoadingBars, fetchAndLoadCORSOptions,
    showDomainDeleteConfirmation, hideDomainDeleteConfirmation } from '../actions';

const mapStateToProps = (state) => {
    const cors = state.cors;
    console.log('mapStateToProps-CORS STATE:', state.cors);
    const newProps = {
        node: cors.node,
        corsEnabled: cors.corsEnabled,
        isAllOrigins: cors.isAllOrigins,
        isLoading: cors.isLoading,
        origins: cors.origins,
        deleteDomainModalVisible: cors.deleteDomainModalVisible,
        domainToDelete: cors.domainToDelete
    };
    console.log('mapStateToProps-NEW PROPS:', newProps);
    return newProps;
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        saveCORS: (options) => {
            console.log('saveCORS with:', options, ' ownProps:', ownProps);
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
