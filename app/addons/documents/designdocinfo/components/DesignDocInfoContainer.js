import { connect } from 'react-redux';
import DesignDocInfo from './DesignDocInfo';
import Actions from '../actions';

const mapStateToProps = ({ designDocInfo }, ownProps) => {
  return {
    isLoading: designDocInfo.isLoading,
    showLoadError: designDocInfo.showLoadError,
    viewIndex: designDocInfo.viewIndex,
    designDocInfo: ownProps.designDocInfo,
    designDocName: ownProps.designDocName
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchDesignDocInfo: (options) => {
      dispatch(Actions.fetchDesignDocInfo(options));
    },

    stopRefresh: () => {
      Actions.stopRefresh();
    }
  };
};

const DesignDocInfoContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(DesignDocInfo);

export default DesignDocInfoContainer;
