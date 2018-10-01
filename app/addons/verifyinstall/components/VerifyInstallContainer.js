import { connect } from 'react-redux';
import VerifyInstallScreen from './VerifyInstallScreen';
import { resetTests, startVerification } from '../actions';

const mapStateToProps = ({ verifyinstall }) => {
  return {
    isVerifying: verifyinstall.isVerifying,
    testResults: verifyinstall.tests
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    resetTests: () => {
      dispatch(resetTests());
    },

    startVerification: () => {
      dispatch(resetTests());
      dispatch(startVerification());
    }
  };
};

const VerifyInstallContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(VerifyInstallScreen);

export default VerifyInstallContainer;
