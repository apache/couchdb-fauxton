import { connect } from 'react-redux';
import * as Actions from '../actions';
import GlobalNotifications from './GlobalNotifications';

const mapStateToProps = ({ notifications }) => {
  return {
    notifications: notifications.notifications
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startHidingNotification: (notificationId) => {
      dispatch(Actions.startHidingNotification(notificationId));
    },
    hideNotification: (notificationId) => {
      dispatch(Actions.hideNotification(notificationId));
    },
    hideAllVisibleNotifications: () => {
      dispatch(Actions.hideAllVisibleNotifications());
    }
  };
};

const GlobalNotificationsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(GlobalNotifications);

export default GlobalNotificationsContainer;
