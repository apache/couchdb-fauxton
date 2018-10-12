import { connect } from 'react-redux';
import PermanentNotification from './PermanentNotification';

const mapStateToProps = ({ notifications }) => {
  return {
    visible: notifications.permanentNotificationVisible,
    message: notifications.permanentNotificationMessage
  };
};

const PermanentNotificationContainer = connect(
  mapStateToProps
)(PermanentNotification);

export default PermanentNotificationContainer;
