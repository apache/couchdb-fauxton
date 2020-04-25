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
import NotificationPanelRow from './NotificationPanelRow';

export default class NotificationCenterPanel extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool.isRequired,
    filter: PropTypes.string.isRequired,
    notifications: PropTypes.array.isRequired,
    hideNotificationCenter: PropTypes.func.isRequired,
    selectNotificationFilter: PropTypes.func.isRequired,
    clearAllNotifications: PropTypes.func.isRequired,
    clearSingleNotification: PropTypes.func.isRequired
  };

  getNotifications = (items) => {
    let notifications;
    if (!items.length && !this.props.notifications.length) {
      notifications = <li className="no-notifications">
          No notifications.
      </li>;
    } else {
      notifications = items
        .map(({key, data: notification, style}) => {
          return (
            <NotificationPanelRow
              item={notification}
              filter={this.props.filter}
              clearSingleNotification={this.props.clearSingleNotification}
              key={key}
              style={style}
            />
          );
        });
    }
    return (
      <ul className="notification-list">
        {notifications}
      </ul>
    );
  };

  getStyles = (prevItems = []) => {
    const styles = this.props.notifications
      .map(notification => {
        let item = prevItems.find(style => style.key === (notification.toastId.toString()));
        let style = !item ? {opacity: 0, height: 0} : false;

        if (!style && (notification.type === this.props.filter || this.props.filter === 'all')) {
          style = {
            opacity: spring(1, presets.stiff),
            height: spring(61, presets.stiff)
          };
        } else if (notification.type !== this.props.filter) {
          style = {
            opacity: spring(0, presets.stiff),
            height: spring(0, presets.stiff)
          };
        }

        return {
          key: notification.toastId.toString(),
          style,
          data: notification
        };
      });
    return styles;
  };

  render() {
    if (!this.props.isVisible && this.props.style.x === 0) {
      // panelClasses += ' visible';
      return null;
    }

    const filterClasses = {
      all: 'flex-body',
      success: 'flex-body',
      error: 'flex-body',
      info: 'flex-body'
    };
    filterClasses[this.props.filter] += ' selected';

    const maskClasses = `notification-page-mask ${((this.props.isVisible) ? ' visible' : '')}`;
    const panelClasses = 'notification-center-panel flex-layout flex-col visible';
    return (
      <div id="notification-center">
        <div className={panelClasses} style={{transform: `translate(${this.props.style.x}px)`}}>

          <header className="flex-layout flex-row">
            <span className="fonticon fonticon-bell" />
            <h1 className="flex-body">Notifications</h1>
            <button aria-label="Hide Notifications Center" type="button" onClick={this.props.hideNotificationCenter}>×</button>
          </header>

          <ul aria-label="Filters" className="notification-filter flex-layout flex-row">
            <li className={filterClasses.all} title="All notifications" data-filter="all"
              onClick={() => this.props.selectNotificationFilter('all')}>All</li>
            <li className={filterClasses.success} title="Success notifications" data-filter="success"
              onClick={() => this.props.selectNotificationFilter('success')}>
              <span className="fonticon fonticon-ok-circled" />
            </li>
            <li className={filterClasses.error} title="Error notifications" data-filter="error"
              onClick={() => this.props.selectNotificationFilter('error')}>
              <span className="fonticon fonticon-attention-circled" />
            </li>
            <li className={filterClasses.info} title="Info notifications" data-filter="info"
              onClick={() => this.props.selectNotificationFilter('info')}>
              <span className="fonticon fonticon-info-circled" />
            </li>
          </ul>

          <div className="flex-body">
            <TransitionMotion styles={this.getStyles}>
              {this.getNotifications}
            </TransitionMotion>
          </div>

          <footer>
            <input
              type="button"
              value="Clear All"
              className="btn btn-small btn-secondary"
              onClick={this.props.clearAllNotifications} />
          </footer>
        </div>

        <div className={maskClasses} onClick={this.props.hideNotificationCenter}></div>
      </div>
    );
  }
}
