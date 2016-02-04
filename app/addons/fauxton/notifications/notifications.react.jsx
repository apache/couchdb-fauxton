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

define([
  '../../../app',
  '../../../core/api',
  'react',
  'react-dom',
  './actions',
  './stores',
  '../components.react',

  // needed to run the test individually. Don't remove
  "velocity-animate/velocity",
  "velocity-animate/velocity.ui"
],

function (app, FauxtonAPI, React, ReactDOM, Actions, Stores, Components) {

  var notificationStore = Stores.notificationStore;
  var Clipboard = Components.Clipboard;


  var NotificationCenterButton = React.createClass({
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

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        isVisible: notificationStore.isNotificationCenterVisible(),
        filter: notificationStore.getNotificationFilter(),
        notifications: notificationStore.getNotifications()
      };
    },

    componentDidMount: function () {
      notificationStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      notificationStore.off('change', this.onChange);
    },

    onChange: function () {
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    getNotifications: function () {
      if (!this.state.notifications.length) {
        return (
          <li className="no-notifications">No notifications.</li>
        );
      }

      return _.map(this.state.notifications, function (notification, i) {
        return (
          <NotificationRow
            isVisible={this.state.isVisible}
            item={notification}
            filter={this.state.filter}
            key={notification.notificationId}
          />
        );
      }, this);
    },

    render: function () {
      var panelClasses = 'notification-center-panel flex-layout flex-col';
      if (this.state.isVisible) {
        panelClasses += ' visible';
      }

      var filterClasses = {
        all: 'flex-body',
        success: 'flex-body',
        error: 'flex-body',
        info: 'flex-body'
      };
      filterClasses[this.state.filter] += ' selected';

      var maskClasses = 'notification-page-mask' + ((this.state.isVisible) ? ' visible' : '');
      return (
        <div>
          <div className={panelClasses}>

            <header className="flex-layout flex-row">
              <span className="fonticon fonticon-bell"></span>
              <h1 className="flex-body">Notifications</h1>
              <button type="button" onClick={Actions.hideNotificationCenter}>×</button>
            </header>

            <ul className="notification-filter flex-layout flex-row">
              <li className={filterClasses.all} title="All notifications" data-filter="all"
                onClick={Actions.selectNotificationFilter.bind(this, 'all')}>All</li>
              <li className={filterClasses.success} title="Success notifications" data-filter="success"
                onClick={Actions.selectNotificationFilter.bind(this, 'success')}>
                <span className="fonticon fonticon-ok-circled"></span>
              </li>
              <li className={filterClasses.error} title="Error notifications" data-filter="error"
                onClick={Actions.selectNotificationFilter.bind(this, 'error')}>
                <span className="fonticon fonticon-attention-circled"></span>
              </li>
              <li className={filterClasses.info} title="Info notifications" data-filter="info"
                onClick={Actions.selectNotificationFilter.bind(this, 'info')}>
                <span className="fonticon fonticon-info-circled"></span>
              </li>
            </ul>

            <div className="flex-body">
              <ul className="notification-list">
              {this.getNotifications()}
              </ul>
            </div>

            <footer>
              <input type="button" value="Clear All" className="btn btn-small btn-info" onClick={Actions.clearAllNotifications} />
            </footer>
          </div>

          <div className={maskClasses} onClick={Actions.hideNotificationCenter}></div>
        </div>
      );
    }
  });

  var NotificationRow = React.createClass({
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
                <Clipboard text={this.props.item.cleanMsg} displayType="text" />
              </div>
            </div>
            <button type="button" onClick={this.clearNotification}>×</button>
          </div>
        </li>
      );
    }
  });


  return {
    NotificationCenterButton: NotificationCenterButton,
    NotificationCenterPanel: NotificationCenterPanel,
    NotificationRow: NotificationRow,

    renderNotificationCenter: function (el) {
      return ReactDOM.render(<NotificationCenterPanel />, el);
    }
  };

});
