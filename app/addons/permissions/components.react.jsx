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
  'app',
  'api',
  'react',
  'addons/components/react-components.react',
  'addons/permissions/stores',
  'addons/permissions/actions'
],

function (app, FauxtonAPI, React, Components, Stores, Actions) {
  var LoadLines = Components.LoadLines;
  var permissionsStore = Stores.permissionsStore;
  var getDocUrl = app.helpers.getDocUrl;

  var PermissionsItem = React.createClass({

    removeItem: function (e) {
      this.props.removeItem({
        value: this.props.item,
        type: this.props.type,
        section: this.props.section
      });
    },

    render: function () {
      return (
        <li>
          <span>{this.props.item}</span>
          <button onClick={this.removeItem} type="button" className="pull-right close">×</button>
        </li>
      );
    }

  });

  var PermissionsSection = React.createClass({
    getInitialState: function () {
      return {
        newRole: '',
        newName: ''
      };
    },

    getHelp: function () {
      if (this.props.section === 'admins') {
        return 'Database members can access the database. If no members are defined, the database is public. ';
      }

      return 'Database members can access the database. If no members are defined, the database is public. ';
    },

    isEmptyValue: function (value, type) {
      if (!_.isEmpty(value)) {
        return false;
      }
      FauxtonAPI.addNotification({
        msg: 'Cannot add an empty value for ' + type + '.',
        type: 'warning'
      });

      return true;
    },

    addNames: function (e) {
      e.preventDefault();
      if (this.isEmptyValue(this.state.newName, 'names')) {
        return;
      }
      this.props.addItem({
        type: 'names',
        section: this.props.section,
        value: this.state.newName
      });

      this.setState({newName: ''});
    },

    addRoles: function (e) {
      e.preventDefault();
      if (this.isEmptyValue(this.state.newRole, 'roles')) {
        return;
      }
      this.props.addItem({
        type: 'roles',
        section: this.props.section,
        value: this.state.newRole
      });

      this.setState({newRole: ''});
    },

    getItems: function (items, type) {
      return _.map(items, function (item, i) {
        return <PermissionsItem key={i} item={item} section={this.props.section} type={type} removeItem={this.props.removeItem} />;
      }, this);
    },

    getNames: function () {
      return this.getItems(this.props.names, 'names');
    },

    getRoles: function () {
      return this.getItems(this.props.roles, 'roles');
    },

    nameChange: function (e) {
      this.setState({newName: e.target.value});
    },

    roleChange: function (e) {
      this.setState({newRole: e.target.value});
    },

    render: function () {
      return (
      <div>
        <header className="page-header">
          <h3>{this.props.section}</h3>
          <p className="help">
            {this.getHelp()}
            <a className="help-link" data-bypass="true" href={getDocUrl('DB_PERMISSION')} target="_blank">
              <i className="icon-question-sign"></i>
            </a>
          </p>
        </header>
        <div className="row-fluid">
          <div className="span6">
            <header>
              <h4>Users</h4>
              <p>Specify users who will have {this.props.section} access to this database.</p>
            </header>
            <form onSubmit={this.addNames} className="permission-item-form form-inline">
              <input onChange={this.nameChange} value={this.state.newName} type="text" className="item input-small" placeholder="Add Name" />
              <button type="submit" className="btn btn-success"><i className="icon fonticon-plus-circled" /> Add Name</button>
            </form>
            <ul className="clearfix unstyled permission-items span10">
              {this.getNames()}
            </ul>
          </div>
          <div className="span6">
            <header>
              <h4>Roles</h4>
              <p>Users with any of the following role(s) will have {this.props.section} access.</p>
            </header>
            <form onSubmit={this.addRoles} className="permission-item-form form-inline">
              <input onChange={this.roleChange} value={this.state.newRole} type="text" className="item input-small" placeholder="Add Role" />
              <button type="submit" className="btn btn-success"><i className="icon fonticon-plus-circled" /> Add Role</button>
            </form>
            <ul className="unstyled permission-items span10">
              {this.getRoles()}
            </ul>
          </div>
        </div>
      </div>
      );
    }

  });

  var PermissionsController = React.createClass({

    getStoreState: function () {
      return {
        isLoading: permissionsStore.isLoading(),
        adminRoles: permissionsStore.getAdminRoles(),
        adminNames: permissionsStore.getAdminNames(),
        memberRoles: permissionsStore.getMemberRoles(),
        memberNames: permissionsStore.getMemberNames(),
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      permissionsStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      permissionsStore.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    addItem: function (options) {
      Actions.addItem(options);
    },

    removeItem: function (options) {
      Actions.removeItem(options);
    },

    render: function () {
      if (this.state.isLoading) {
        return <LoadLines />;
      }

      return (
        <div className="scrollable permissions-page">
          <div id="sections">
            <PermissionsSection roles={this.state.adminRoles}
              names={this.state.adminNames}
              addItem={this.addItem}
              removeItem={this.removeItem}
              section={'admins'} />
            <PermissionsSection
              roles={this.state.memberRoles}
              names={this.state.memberNames}
              addItem={this.addItem}
              removeItem={this.removeItem}
              section={'members'} />
          </div>
        </div>
      );
    }

  });

  return {
    PermissionsController: PermissionsController,
    PermissionsSection: PermissionsSection,
    PermissionsItem: PermissionsItem
  };
});
