// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import PropTypes from 'prop-types';
import React from 'react';
import {TransitionMotion, spring, presets} from 'react-motion';
import Notification from './Notification';

export default class GlobalNotifications extends React.Component {
  static propTypes = {
    notifications: PropTypes.array.isRequired,
    hideAllVisibleNotifications: PropTypes.func.isRequired,
    startHidingNotification: PropTypes.func.isRequired,
    hideNotification: PropTypes.func.isRequired
  };

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e) => {
    const code = e.keyCode || e.which;
    if (code === 27) {
      this.props.hideAllVisibleNotifications();
    }
  };

  getNotifications = () => {
    if (!this.props.notifications.length) {
      return null;
    }

    return _.map(this.props.notifications, (notification, index) => {

      // notifications are completely removed from the DOM once they're
      if (!notification.visible) {
        return;
      }

      return (
        <Notification
          notificationId={notification.notificationId}
          isHiding={notification.isHiding}
          key={index}
          msg={notification.msg}
          type={notification.type}
          escape={notification.escape}
          visibleTime={notification.visibleTime}
          onStartHide={this.props.startHidingNotification}
          onHideComplete={this.props.hideNotification} />
      );
    });
  };

  getchildren = (items) => {
    const notifications = items.map(({key, data, style}) => {
      const notification = data;
      return (
        <Notification
          key={key}
          style={style}
          notificationId={notification.notificationId}
          isHiding={notification.isHiding}
          msg={notification.msg}
          type={notification.type}
          escape={notification.escape}
          visibleTime={notification.visibleTime}
          onStartHide={this.props.startHidingNotification}
          onHideComplete={this.props.hideNotification} />
      );
    });

    return (
      <div>
        {notifications}
      </div>
    );
  };

  getStyles = (prevItems) => {
    if (!prevItems) {
      prevItems = [];
    }

    return this.props.notifications
      .filter(notification => notification.visible)
      .map(notification => {
        let item = prevItems.find(style => style.key === (notification.notificationId.toString()));
        let style = !item ? {opacity: 0.5, minHeight: 50} : false;

        if (!style && !notification.isHiding) {
          style = {
            opacity: spring(1, presets.stiff),
            minHeight: spring(64)
          };
        } else if (!style && notification.isHiding) {
          style = {
            opacity: spring(0, presets.stiff),
            minHeight: spring(0, presets.stiff)
          };
        }

        return {
          key: notification.notificationId.toString(),
          style,
          data: notification
        };
      });
  };

  render() {
    return (
      <div id="global-notifications">
        <TransitionMotion
          styles={this.getStyles}
        >
          {this.getchildren}
        </TransitionMotion>
      </div>
    );
  }
}
