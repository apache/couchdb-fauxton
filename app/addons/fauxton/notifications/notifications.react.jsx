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

import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import Actions from "./actions";
import Stores from "./stores";
import Components from "../../components/react-components.react";
import VelocityReact from "velocity-react";
import "velocity-animate/velocity";
import "velocity-animate/velocity.ui";
import uuid from 'uuid';

var store = Stores.notificationStore;
var VelocityComponent = VelocityReact.VelocityComponent;
const {Copy} = Components;

// The one-stop-shop for Fauxton notifications. This controller handler the header notifications and the rightmost
// notification center panel
export const NotificationController = React.createClass({

  getInitialState: function () {
    return this.getStoreState();
  },

  getStoreState: function () {
    return {
      notificationCenterVisible: store.isNotificationCenterVisible(),
      notificationCenterFilter: store.getNotificationFilter(),
      notifications: store.getNotifications()
    };
  },

  componentDidMount: function () {
    store.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    store.off('change', this.onChange);
  },

  onChange: function () {
    if (this.isMounted()) {
      this.setState(this.getStoreState());
    }
  },

  render: function () {
    return (
      <div>
        <GlobalNotifications
          notifications={this.state.notifications} />
        <NotificationCenterPanel
          visible={this.state.notificationCenterVisible}
          filter={this.state.notificationCenterFilter}
          notifications={this.state.notifications} />
      </div>
    );
  }
});


var GlobalNotifications = React.createClass({
  propTypes: {
    notifications: React.PropTypes.array.isRequired
  },

  componentDidMount: function () {
    $(document).on('keydown.notificationClose', this.onKeyDown);
  },

  componentWillUnmount: function () {
    $(document).off('keydown.notificationClose', this.onKeyDown);
  },

  onKeyDown: function (e) {
    var code = e.keyCode || e.which;
    if (code === 27) {
      Actions.hideAllVisibleNotifications();
    }
  },

  getNotifications: function () {
    if (!this.props.notifications.length) {
      return null;
    }

    return _.map(this.props.notifications, function (notification, index) {

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
          onStartHide={Actions.startHidingNotification}
          onHideComplete={Actions.hideNotification} />
      );
    }, this);
  },

  render: function () {
    return (
      <div id="global-notifications">
        {this.getNotifications()}
      </div>
    );
  }
});


var Notification = React.createClass({
  propTypes: {
    msg: React.PropTypes.string.isRequired,
    onStartHide: React.PropTypes.func.isRequired,
    onHideComplete: React.PropTypes.func.isRequired,
    type: React.PropTypes.oneOf(['error', 'info', 'success']),
    escape: React.PropTypes.bool,
    isHiding: React.PropTypes.bool.isRequired,
    visibleTime: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      type: 'info',
      visibleTime: 8000,
      escape: true,
      slideInTime: 200,
      slideOutTime: 200
    };
  },

  componentWillUnmount: function () {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
  },

  getInitialState: function () {
    return {
      animation: { opacity: 0, minHeight: 0 }
    };
  },

  componentDidMount: function () {
    this.setState({
      animation: {
        opacity: (this.props.isHiding) ? 0 : 1,
        minHeight: (this.props.isHiding) ? 0 : ReactDOM.findDOMNode(this.refs.notification).offsetHeight
      }
    });

    this.timeout = setTimeout(function () {
      this.hide();
    }.bind(this), this.props.visibleTime);
  },

  componentDidUpdate: function (prevProps) {
    if (!prevProps.isHiding && this.props.isHiding) {
      this.setState({
        animation: {
          opacity: 0,
          minHeight: 0
        }
      });
    }
  },

  getHeight: function () {
    return $(ReactDOM.findDOMNode(this)).outerHeight(true);
  },

  hide: function (e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onStartHide(this.props.notificationId);
  },

  // many messages contain HTML, hence the need for dangerouslySetInnerHTML
  getMsg: function () {
    var msg = (this.props.escape) ? _.escape(this.props.msg) : this.props.msg;
    return {
      __html: msg
    };
  },

  onAnimationComplete: function () {
    if (this.props.isHiding) {
      this.props.onHideComplete(this.props.notificationId);
    }
  },

  render: function () {
    var iconMap = {
      error: 'fonticon-attention-circled',
      info: 'fonticon-info-circled',
      success: 'fonticon-ok-circled'
    };

    return (
      <VelocityComponent animation={this.state.animation}
        runOnMount={true} duration={this.props.slideInTime} complete={this.onAnimationComplete}>
          <div className="notification-wrapper">
            <div className={'global-notification alert alert-' + this.props.type} ref="notification">
              <a data-bypass href="#" onClick={this.hide}><i className="pull-right fonticon-cancel" /></a>
              <i className={'notification-icon ' + iconMap[this.props.type]} />
              <span dangerouslySetInnerHTML={this.getMsg()}></span>
            </div>
          </div>
      </VelocityComponent>
    );
  }
});


export const NotificationCenterButton = React.createClass({
  getInitialState: function () {
    return {
      visible: true
    };
  },

  hide: function () {
    this.setState({ visible: false });
  },

  show: function () {
    this.setState({ visible: true });
  },

  render: function () {
    var classes = 'fonticon fonticon-bell' + ((!this.state.visible) ? ' hide' : '');
    return (
      <div className={classes} onClick={Actions.showNotificationCenter}></div>
    );
  }
});


var NotificationCenterPanel = React.createClass({
  propTypes: {
    visible: React.PropTypes.bool.isRequired,
    filter: React.PropTypes.string.isRequired,
    notifications: React.PropTypes.array.isRequired
  },

  getNotifications: function () {
    if (!this.props.notifications.length) {
      return (
        <li className="no-notifications">No notifications.</li>
      );
    }

    return _.map(this.props.notifications, function (notification) {
      return (
        <NotificationPanelRow
          isVisible={this.props.visible}
          item={notification}
          filter={this.props.filter}
          key={notification.notificationId}
        />
      );
    }, this);
  },

  render: function () {
    var panelClasses = 'notification-center-panel flex-layout flex-col';
    if (this.props.visible) {
      panelClasses += ' visible';
    }

    var filterClasses = {
      all: 'flex-body',
      success: 'flex-body',
      error: 'flex-body',
      info: 'flex-body'
    };
    filterClasses[this.props.filter] += ' selected';

    var maskClasses = 'notification-page-mask' + ((this.props.visible) ? ' visible' : '');
    return (
      <div id="notification-center">
        <div className={panelClasses}>

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
            <ul className="notification-list">
              {this.getNotifications()}
            </ul>
          </div>

          <footer>
            <input
              type="button"
              value="Clear All"
              className="btn btn-small btn-info"
              onClick={Actions.clearAllNotifications} />
          </footer>
        </div>

        <div className={maskClasses} onClick={Actions.hideNotificationCenter}></div>
      </div>
    );
  }
});


var NotificationPanelRow = React.createClass({
  propTypes: {
    item: React.PropTypes.object.isRequired,
    filter: React.PropTypes.string.isRequired,
    transitionSpeed: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      transitionSpeed: 300
    };
  },

  clearNotification: function () {
    var notificationId = this.props.item.notificationId;
    this.hide(function () {
      Actions.clearSingleNotification(notificationId);
    });
  },

  componentDidMount: function () {
    this.setState({
      elementHeight: this.getHeight()
    });
  },

  componentDidUpdate: function (prevProps) {
    // in order for the nice slide effects to work we need a concrete element height to slide to and from.
    // $.outerHeight() only works reliably on visible elements, hence this additional setState here
    if (!prevProps.isVisible && this.props.isVisible) {
      this.setState({
        elementHeight: this.getHeight()
      });
    }

    var show = true;
    if (this.props.filter !== 'all') {
      show = this.props.item.type === this.props.filter;
    }
    if (show) {
      $(ReactDOM.findDOMNode(this)).velocity({ opacity: 1, height: this.state.elementHeight }, this.props.transitionSpeed);
      return;
    }
    this.hide();
  },

  getHeight: function () {
    return $(ReactDOM.findDOMNode(this)).outerHeight(true);
  },

  hide: function (onHidden) {
    $(ReactDOM.findDOMNode(this)).velocity({ opacity: 0, height: 0 }, this.props.transitionSpeed, function () {
      if (onHidden) {
        onHidden();
      }
    });
  },

  render: function () {
    var iconMap = {
      success: 'fonticon-ok-circled',
      error: 'fonticon-attention-circled',
      info: 'fonticon-info-circled'
    };

    var timeElapsed = this.props.item.time.fromNow();

    // we can safely do this because the store ensures all notifications are of known types
    var rowIconClasses = 'fonticon ' + iconMap[this.props.item.type];
    var hidden = (this.props.filter === 'all' || this.props.filter === this.props.item.type) ? false : true;

    // N.B. wrapper <div> needed to ensure smooth hide/show transitions
    return (
      <li aria-hidden={hidden}>
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
});


export default {
  NotificationController,
  NotificationCenterButton,
  NotificationCenterPanel,
  NotificationPanelRow,
  Notification
};
