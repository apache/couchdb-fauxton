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
import {NotificationController, PermanentNotification} from "./notifications/notifications";
import NavBar from './navigation/container/NavBar';
import NavbarActions from './navigation/actions';
import Stores from './navigation/stores';
import classNames from 'classnames';

const navBarStore = Stores.navBarStore;

class ContentWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      routerOptions: props.router.currentRouteOptions
    };

    if (props.router.currentRouteOptions && props.router.currentRouteOptions.selectedHeader) {
      NavbarActions.setNavbarActiveLink(this.state.routerOptions.selectedHeader);
    }
  }

  componentDidMount () {
    this.props.router.on('new-component', (routerOptions) => {
      this.setState({routerOptions});
      NavbarActions.setNavbarActiveLink(this.state.routerOptions.selectedHeader);
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

export default class App extends React.Component {
  constructor (props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      isPrimaryNavMinimized: navBarStore.isMinimized()
    };
  }

  componentDidMount () {
    navBarStore.on('change', this.onChange, this);
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  render () {
    const mainClass = classNames(
      {'closeMenu': this.state.isPrimaryNavMinimized}
    );

    return (
      <div>
        <PermanentNotification />
        <div id="notifications">
          <NotificationController />
        </div>
        <div role="main" id="main"  className={mainClass}>
          <div id="app-container">
            <div className="wrapper">
              <div className="pusher">
                <ContentWrapper router={this.props.router} />
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
};
