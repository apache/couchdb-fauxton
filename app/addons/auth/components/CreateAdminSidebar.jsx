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
