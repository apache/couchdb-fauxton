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
import app from "../../app";
import FauxtonAPI from '../../core/api';
import ActionTypes from './actiontypes';
import Constants from './constants';
import AccountActionTypes from '../auth/actiontypes';


const ReplicationStore = FauxtonAPI.Store.extend({
  initialize: function () {
    this.reset();
  },

  reset: function () {
    this._loading = false;
    this._databases = [];
    this._authenticated = false;
    this._password = '';

    // source fields
    this._replicationSource = '';
    this._sourceDatabase = '';
    this._remoteSource = '';

    // target fields
    this._replicationTarget = '';
    this._targetDatabase = '';
    this._remoteTarget = '';

    // other
    this._isPasswordModalVisible = false;
    this._replicationType = Constants.REPLICATION_TYPE.ONE_TIME;
    this._replicationDocName = '';
  },

  isLoading: function () {
    return this._loading;
  },

  isAuthenticated: function () {
    return this._authenticated;
  },

  getReplicationSource: function () {
    return this._replicationSource;
  },

  getSourceDatabase: function () {
    return this._sourceDatabase;
  },

  isLocalSourceDatabaseKnown: function () {
    return _.contains(this._databases, this._sourceDatabase);
  },

  isLocalTargetDatabaseKnown: function () {
    return _.contains(this._databases, this._targetDatabase);
  },

  getReplicationTarget: function () {
    return this._replicationTarget;
  },

  getDatabases: function () {
    return this._databases;
  },

  setDatabases: function (databases) {
    this._databases = databases;
  },

  getReplicationType: function () {
    return this._replicationType;
  },

  getTargetDatabase: function () {
    return this._targetDatabase;
  },

  getReplicationDocName: function () {
    return this._replicationDocName;
  },

  // to cut down on boilerplate
  updateFormField: function (fieldName, value) {

    // I know this could be done by just adding the _ prefix to the passed field name, I just don't much like relying
    // on the var names like that...
    var validFieldMap = {
      remoteSource: '_remoteSource',
      remoteTarget: '_remoteTarget',
      targetDatabase: '_targetDatabase',
      replicationType: '_replicationType',
      replicationDocName: '_replicationDocName',
      replicationSource: '_replicationSource',
      replicationTarget: '_replicationTarget',
      sourceDatabase: '_sourceDatabase'
    };

    this[validFieldMap[fieldName]] = value;
  },

  getRemoteSource: function () {
    return this._remoteSource;
  },

  getRemoteTarget: function () {
    return this._remoteTarget;
  },

  isPasswordModalVisible: function () {
    return this._isPasswordModalVisible;
  },

  getPassword: function () {
    return this._password;
  },

  dispatch: function (action) {
    switch (action.type) {

      case ActionTypes.INIT_REPLICATION:
        this._loading = true;
        this._sourceDatabase = action.options.sourceDatabase;

        if (this._sourceDatabase) {
          this._replicationSource = Constants.REPLICATION_SOURCE.LOCAL;
          this._remoteSource = '';
          this._replicationTarget = '';
          this._targetDatabase = '';
          this._remoteTarget = '';
        }
      break;

      case ActionTypes.REPLICATION_DATABASES_LOADED:
        this.setDatabases(action.options.databases);
        this._loading = false;
      break;

      case ActionTypes.REPLICATION_UPDATE_FORM_FIELD:
        this.updateFormField(action.options.fieldName, action.options.value);
      break;

      case ActionTypes.REPLICATION_CLEAR_FORM:
        this.reset();
      break;

      case AccountActionTypes.AUTH_SHOW_PASSWORD_MODAL:
        this._isPasswordModalVisible = true;
      break;

      case AccountActionTypes.AUTH_HIDE_PASSWORD_MODAL:
        this._isPasswordModalVisible = false;
      break;

      case AccountActionTypes.AUTH_CREDS_VALID:
        this._authenticated = true;
        this._password = action.options.password;
      break;

      case AccountActionTypes.AUTH_CREDS_INVALID:
        this._authenticated = false;
      break;

      default:
      return;
    }

    this.triggerChange();
  }
});

const replicationStore = new ReplicationStore();
replicationStore.dispatchToken = FauxtonAPI.dispatcher.register(replicationStore.dispatch);

export default {
  replicationStore
};
