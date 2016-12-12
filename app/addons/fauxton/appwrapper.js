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
import FauxtonAPI from '../../core/api';
import ComponentActions from '../components/actions';
import {NotificationController} from "./notifications/notifications.react";
import {NavBar} from './navigation/components.react';
import NavbarActions from './navigation/actions';

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

const App = ({router}) => {
  return (
    <div>
      <div id="notifications">
        <NotificationController />
      </div>
      <div role="main" id="main">
        <div id="app-container">
          <div className="wrapper">
            <div className="pusher">
              <ContentWrapper router={router} />
            </div>
            <div id="primary-navbar">
              <NavBar/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
