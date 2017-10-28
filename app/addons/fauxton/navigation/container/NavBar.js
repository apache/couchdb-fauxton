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

import FauxtonAPI from "../../../../core/api";
import React from "react";

import ReactDOM from "react-dom";
import Stores from "../stores";

import NavBar from '../components/NavBar';

const navBarStore = Stores.navBarStore;

class NavBarContainer extends React.Component {
  getStoreState = () => {
    return {
      navLinks: navBarStore.getNavLinks(),
      bottomNavLinks: navBarStore.getBottomNavLinks(),
      footerNavLinks: navBarStore.getFooterNavLinks(),
      activeLink: navBarStore.getActiveLink(),
      version: navBarStore.getVersion(),
      isMinimized: navBarStore.isMinimized(),
      isNavBarVisible: navBarStore.isNavBarVisible(),

      isLoginSectionVisible: navBarStore.getIsLoginSectionVisible(),
      isLoginVisibleInsteadOfLogout: navBarStore.getIsLoginVisibleInsteadOfLogout()
    };
  };

  onChange = () => {
    this.setState(this.getStoreState());
  };

  state = this.getStoreState();

  componentDidMount() {
    navBarStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    navBarStore.off('change', this.onChange);
  }

  render() {
    const user = FauxtonAPI.session.user();

    const username =  (user && user.name) ? user.name : '';
    return (
      <NavBar {...this.state} username={username} />
    );
  }
}


export default NavBarContainer;
