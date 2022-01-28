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
import NotificationPanelContainer from './notifications/components/NotificationPanelContainer';
import PermanentNotificationContainer from './notifications/components/PermanentNotificationContainer';
import NavBar from './navigation/container/NavBar';
import * as NavbarActions from './navigation/actions';
import classNames from 'classnames';
import {toast, ToastContainer} from "react-toastify";


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

  onKeydown = e => {
    const code = e.keyCode || e.which;
    if (code === 27) {
      toast.dismiss();
    }
  };

  componentDidMount () {
    this.props.router.on('new-component', (routerOptions) => {
      this.setState({routerOptions});
      this.props.setNavbarActiveLink(this.state.routerOptions.selectedHeader);
    });

    this.props.router.on('trigger-update', () => {
      this.forceUpdate();
    });

    document.addEventListener('keydown', this.onKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeydown);
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
    const appContainerClass = classNames(
      {'app-container__with-perm-notification': this.props.isPermanentNotificationShowing}
    );
    return (
      <div>
        <ToastContainer
          className='toast-container'
          position="top-right"
          autoClose={5000}
          closeButton={false}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <PermanentNotificationContainer/>
        <div id="notifications">
          <NotificationPanelContainer />
        </div>
        <div id="main"  className={mainClass}>
          <div id="app-container" className={appContainerClass}>
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
  ({ navigation, notifications }) => {
    return {
      isPrimaryNavMinimized: navigation.isMinimized,
      isPermanentNotificationShowing: notifications.permanentNotificationVisible,
    };
  },
  (dispatch) => {
    return {
      setNavbarActiveLink: (link) => { dispatch(NavbarActions.setNavbarActiveLink(link)); }
    };
  }
)(App);
