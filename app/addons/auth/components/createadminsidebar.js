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
import { selectPage } from './../actions';
import { createAdminSidebarStore } from './../stores';
import FauxtonAPI from "../../../core/api";

export default class CreateAdminSidebar extends React.Component {
  constructor() {
    super();
    this.state = this.getStoreState();
  }
  getStoreState() {
    return {
      selectedPage: createAdminSidebarStore.getSelectedPage()
    };
  }
  onChange() {
    this.setState(this.getStoreState());
  }
  componentDidMount() {
    createAdminSidebarStore.on('change', this.onChange, this);
  }
  componentWillUnmount() {
    createAdminSidebarStore.off('change', this.onChange);
  }
  selectPage(e) {
    var newPage = e.target.href.split('#')[1];
    selectPage(newPage);
  }
  render() {
    var user = FauxtonAPI.session.user;
    var userName = _.isNull(user) ? '' : FauxtonAPI.session.user.name;

    return (
      <div className="sidenav">
        <header className="row-fluid">
          <h3>{userName}</h3>
        </header>
        <ul className="nav nav-list" onClick={this.selectPage}>
          <li className={this.state.selectedPage === 'changePassword' ? 'active' : ''} data-page="changePassword">
            <a href="#changePassword">Change Password</a>
          </li>
          <li className={this.state.selectedPage === 'addAdmin' ? 'active' : ''} data-page="addAdmin">
            <a href="#addAdmin">Create Admins</a>
          </li>
        </ul>
      </div>
    );
  }
}
