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

import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";
import Stores from "./stores";
import Components from "../../components/react-components";
import {TransitionMotion, spring, presets} from 'react-motion';
import uuid from 'uuid';

var store = Stores.notificationStore;
const {Copy} = Components;

// The one-stop-shop for Fauxton notifications. This controller handler the header notifications and the rightmost
// notification center panel
export class NotificationController extends React.Component {
  getStoreState = () => {
    return {
      notificationCenterVisible: store.isNotificationCenterVisible(),
      notificationCenterFilter: store.getNotificationFilter(),
      notifications: store.getNotifications()
    };
  };

  componentDidMount() {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    store.off('change', this.onChange);
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  getStyles = () => {
    const isVisible = this.state.notificationCenterVisible;
    let item = {
      key: '1',
      style: {
        x: 320
      }
    };

    if (isVisible) {
      item.style = {
        x: spring(0)
      };
    }

    if (!isVisible) {
      item.style = {
        x: spring(320)
      };
    }
    return [item];
  };

  getNotificationCenterPanel = (items) => {
    const panel = items.map(({style}) => {
      return <NotificationCenterPanel
        key={'1'}
        style={style}
        visible={this.state.notificationCenterVisible}
        filter={this.state.notificationCenterFilter}
        notifications={this.state.notifications} />;
    });
    return (
      <span>
        {panel}
      </span>
    );
  };

  state = this.getStoreState();

  render() {
    return (
      <div>
        <GlobalNotifications
          notifications={this.state.notifications} />
        <TransitionMotion
          styles={this.getStyles}>
          {this.getNotificationCenterPanel}
        </TransitionMotion>
      </div>
    );
  }
}


class GlobalNotifications extends React.Component {
  static propTypes = {
    notifications: PropTypes.array.isRequired
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
      Actions.hideAllVisibleNotifications();
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
          onStartHide={Actions.startHidingNotification}
          onHideComplete={Actions.hideNotification} />
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
          onStartHide={Actions.startHidingNotification}
          onHideComplete={Actions.hideNotification} />
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

class Notification extends React.Component {
  static propTypes = {
    msg: PropTypes.string.isRequired,
    onStartHide: PropTypes.func.isRequired,
    onHideComplete: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['error', 'info', 'success']),
    escape: PropTypes.bool,
    isHiding: PropTypes.bool.isRequired,
    visibleTime: PropTypes.number
  };

  static defaultProps = {
    type: 'info',
    visibleTime: 8000,
    escape: true
  };

  componentWillUnmount() {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
  }

  componentDidMount() {
    this.timeout = setTimeout(this.hide, this.props.visibleTime);
  }

  hide = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onStartHide(this.props.notificationId);
  };

  // many messages contain HTML, hence the need for dangerouslySetInnerHTML
  getMsg = () => {
    var msg = (this.props.escape) ? _.escape(this.props.msg) : this.props.msg;
    return {
      __html: msg
    };
  };

  onAnimationComplete = () => {
    if (this.props.isHiding) {
      window.setTimeout(() => this.props.onHideComplete(this.props.notificationId));
    }
  };

  render() {
    const {style, notificationId} = this.props;
    const iconMap = {
      error: 'fonticon-attention-circled',
      info: 'fonticon-info-circled',
      success: 'fonticon-ok-circled'
    };

    if (style.opacity === 0 && this.props.isHiding) {
      this.onAnimationComplete();
    }

    return (
      <div
        key={notificationId.toString()} className="notification-wrapper" style={{opacity: style.opacity, minHeight: style.minHeight + 'px'}}>
        <div
          style={{opacity: style.opacity, minHeight: style.minHeight + 'px'}}
          className={'global-notification alert alert-' + this.props.type}
          ref={node => this.notification = node}>
          <a data-bypass href="#" onClick={this.hide}><i className="pull-right fonticon-cancel" /></a>
          <i className={'notification-icon ' + iconMap[this.props.type]} />
          <span dangerouslySetInnerHTML={this.getMsg()}></span>
        </div>
      </div>
    );
  }
}


export class NotificationCenterButton extends React.Component {
  state = {
    visible: true
  };

  hide = () => {
    this.setState({ visible: false });
  };

  show = () => {
    this.setState({ visible: true });
  };

  render() {
    var classes = 'fonticon fonticon-bell' + ((!this.state.visible) ? ' hide' : '');
    return (
      <div className={classes} onClick={Actions.showNotificationCenter}></div>
    );
  }
}


class NotificationCenterPanel extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    filter: PropTypes.string.isRequired,
    notifications: PropTypes.array.isRequired
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
              isVisible={this.props.visible}
              item={notification}
              filter={this.props.filter}
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
    return this.props.notifications
      .map(notification => {
        let item = prevItems.find(style => style.key === (notification.notificationId.toString()));
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
          key: notification.notificationId.toString(),
          style,
          data: notification
        };
      });
  };

  render() {
    if (!this.props.visible && this.props.style.x === 0) {
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

    const maskClasses = `notification-page-mask ${((this.props.visible) ? ' visible' : '')}`;
    const panelClasses = 'notification-center-panel flex-layout flex-col visible';
    return (
      <div id="notification-center">
        <div className={panelClasses} style={{transform: `translate(${this.props.style.x}px)`}}>

          <header className="flex-layout flex-row">
            <span className="fonticon fonticon-bell" />
            <h1 className="flex-body">Notifications</h1>
            <button type="button" onClick={Actions.hideNotificationCenter}>×</button>
          </header>

          <ul className="notification-filter flex-layout flex-row">
            <li className={filterClasses.all} title="All notifications" data-filter="all"
              onClick={Actions.selectNotificationFilter.bind(this, 'all')}>All</li>
            <li className={filterClasses.success} title="Success notifications" data-filter="success"
              onClick={Actions.selectNotificationFilter.bind(this, 'success')}>
              <span className="fonticon fonticon-ok-circled" />
            </li>
            <li className={filterClasses.error} title="Error notifications" data-filter="error"
              onClick={Actions.selectNotificationFilter.bind(this, 'error')}>
              <span className="fonticon fonticon-attention-circled" />
            </li>
            <li className={filterClasses.info} title="Info notifications" data-filter="info"
              onClick={Actions.selectNotificationFilter.bind(this, 'info')}>
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
              onClick={Actions.clearAllNotifications} />
          </footer>
        </div>

        <div className={maskClasses} onClick={Actions.hideNotificationCenter}></div>
      </div>
    );
  }
}

class NotificationPanelRow extends React.Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  };

  clearNotification = () => {
    const {notificationId} = this.props.item;
    Actions.clearSingleNotification(notificationId);
  };

  render() {
    const iconMap = {
      success: 'fonticon-ok-circled',
      error: 'fonticon-attention-circled',
      info: 'fonticon-info-circled'
    };

    const timeElapsed = this.props.item.time.fromNow();

    // we can safely do this because the store ensures all notifications are of known types
    const rowIconClasses = 'fonticon ' + iconMap[this.props.item.type];
    const hidden = (this.props.filter === 'all' || this.props.filter === this.props.item.type) ? false : true;
    const {style} = this.props;
    const {opacity, height} = style;
    if (opacity === 0 && height === 0) {
      return null;
    }

    // N.B. wrapper <div> needed to ensure smooth hide/show transitions
    return (
      <li style={{opactiy: opacity, height: height + 'px', borderBottomColor: `rgba(34, 34, 34, ${opacity})`}} aria-hidden={hidden}>
        <div className="flex-layout flex-row">
          <span className={rowIconClasses}></span>
          <div className="flex-body">
            <p>{this.props.item.cleanMsg}</p>
            <div className="notification-actions">
              <span className="time-elapsed">{timeElapsed}</span>
              <span className="divider">|</span>
              <Copy uniqueKey={uuid.v4()} text={this.props.item.cleanMsg} displayType="text" />
            </div>
          </div>
          <button type="button" onClick={this.clearNotification}>×</button>
        </div>
      </li>
    );
  }
}

export class PermanentNotification extends React.Component {
  constructor (props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      display: store.isPermanentNotificationVisible(),
      msg: store.getPermanentNotificationMessage()
    };
  }

  onChange () {
    this.setState(this.getStoreState);
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
  }

  // many messages contain HTML, hence the need for dangerouslySetInnerHTML
  getMsg () {
    return {__html: this.state.msg};
  }

  getContent () {
    if (!this.state.display || !this.state.msg) {
      return;
    }
    return (
      <p className="perma-warning__content" dangerouslySetInnerHTML={this.getMsg()}></p>
    );
  }

  render () {
    return (
      <div id="perma-warning">
        {this.getContent()}
      </div>
    );
  }
}

export default {
  NotificationController,
  NotificationCenterButton,
  NotificationCenterPanel,
  NotificationPanelRow,
  Notification
};
