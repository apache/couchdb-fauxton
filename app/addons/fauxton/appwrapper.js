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

import React from 'react';
import { connect } from 'react-redux';
import GlobalNotificationsContainer from './notifications/components/GlobalNotificationsContainer';
import NotificationPanelContainer from './notifications/components/NotificationPanelContainer';
import PermanentNotificationContainer from './notifications/components/PermanentNotificationContainer';
import NavBar from './navigation/container/NavBar';
import * as NavbarActions from './navigation/actions';
import classNames from 'classnames';

class ContentWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      routerOptions: props.router.currentRouteOptions
    };

    if (props.router.currentRouteOptions && props.router.currentRouteOptions.selectedHeader) {
      this.props.setNavbarActiveLink(this.state.routerOptions.selectedHeader);
    }
  }

  componentDidMount () {
    this.props.router.on('new-component', (routerOptions) => {
      this.setState({routerOptions});
      this.props.setNavbarActiveLink(this.state.routerOptions.selectedHeader);
    });

    this.props.router.on('trigger-update', () => {
      this.forceUpdate();
    });
  }

  render () {
    if (!this.state.routerOptions) {
      return null;
    }

    const {component} = this.state.routerOptions;
    if (!component) {return null;}
    return component;
  }
}

class App extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const mainClass = classNames(
      {'closeMenu': this.props.isPrimaryNavMinimized}
    );
    return (
      <div>
        <PermanentNotificationContainer />
        <div id="notifications">
          <GlobalNotificationsContainer />
          <NotificationPanelContainer />
        </div>
        <div id="main"  className={mainClass}>
          <div id="app-container">
            <div className="wrapper">
              <div role="main" className="pusher">
                <ContentWrapper router={this.props.router} setNavbarActiveLink={this.props.setNavbarActiveLink}/>
              </div>
              <div id="primary-navbar">
                <NavBar/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  ({ navigation }) => {
    return {
      isPrimaryNavMinimized: navigation.isMinimized};
  },
  (dispatch) => {
    return {
      setNavbarActiveLink: (link) => { dispatch(NavbarActions.setNavbarActiveLink(link)); }
    };
  }
)(App);
