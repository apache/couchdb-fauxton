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

import { connect } from 'react-redux';
import FauxtonAPI from '../../../../core/api';
import NavBar from '../components/NavBar';
import * as Actions from '../actions';

const mapStateToProps = ({ navigation }) => {
  const user = FauxtonAPI.session.user();
  return {
    navLinks: navigation.navLinks,
    bottomNavLinks: navigation.bottomNavLinks,
    footerNavLinks: navigation.footerNavLinks,
    activeLink: navigation.activeLink,
    version: navigation.version,
    isMinimized: navigation.isMinimized,
    isNavBarVisible: navigation.navBarVisible,
    isLoginSectionVisible: navigation.loginSectionVisible,
    isLoginVisibleInsteadOfLogout: navigation.loginVisibleInsteadOfLogout,
    username: (user && user.name) ? user.name : ''
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleNavbarMenu: () => {
      dispatch(Actions.toggleNavbarMenu());
    }
  };
};

const NavBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBar);

export default NavBarContainer;
