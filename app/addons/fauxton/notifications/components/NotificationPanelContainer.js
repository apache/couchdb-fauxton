import { connect } from 'react-redux';
import * as Actions from '../actions';
import NotificationPanelWithTransition from './NotificationPanelWithTransition';

const mapStateToProps = ({ notifications }) => {
  return {
    isVisible: notifications.notificationCenterVisible,
    filter: notifications.selectedNotificationFilter,
    notifications: notifications.notifications
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    hideNotificationCenter: () => {
      dispatch(Actions.hideNotificationCenter());
    },
    selectNotificationFilter: (filter) => {
      dispatch(Actions.selectNotificationFilter(filter));
    },
    clearAllNotifications: () => {
      dispatch(Actions.clearAllNotifications());
    },
    clearSingleNotification: (toastId) => {
      dispatch(Actions.clearSingleNotification(toastId));
    }
  };
};


const NotificationPanelContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationPanelWithTransition);

export default NotificationPanelContainer;
