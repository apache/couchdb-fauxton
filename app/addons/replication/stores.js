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
import _ from 'lodash';

const ReplicationStore = FauxtonAPI.Store.extend({
  initialize () {
    this.reset();
  },

  reset () {
    this._loading = false;
    this._databases = [];
    this._authenticated = false;
    this._password = '';

    // source fields
    this._replicationSource = '';
    this._localSource = '';
    this._remoteSource = '';

    // target fields
    this._replicationTarget = '';
    this._localTarget = '';
    this._remoteTarget = '';

    // other
    this._isPasswordModalVisible = false;
    this._isConflictModalVisible = false;
    this._replicationType = Constants.REPLICATION_TYPE.ONE_TIME;
    this._replicationDocName = '';
    this._submittedNoChange = false;
    this._statusDocs = [];
    this._statusFilteredStatusDocs = [];
    this._statusFilter = '';
    this._allDocsSelected = false;
    this._username = '';
    this._password = '';
    this._activityLoading = false;

    this.loadActivitySort();
  },

  getActivitySort () {
    return this._activitySort;
  },

  loadActivitySort () {
    let sort = app.utils.localStorageGet('replication-activity-sort');
    if (!sort) {
      sort = {
        descending: false,
        column: 'statusTime'
      };

      this.setActivitySort(sort);
    }

    this._activitySort = sort;
  },

  setActivitySort (sort) {
    app.utils.localStorageSet('replication-activity-sort', sort);
    this._activitySort = sort;
  },

  setCredentials (username, password) {
    this._username = username;
    this._password = password;
  },

  getUsername () {
    return this._username;
  },

  getPassword () {
    return this._password;
  },

  getSubmittedNoChange () {
    return this._submittedNoChange;
  },

  changeAfterSubmit () {
    this._submittedNoChange = false;
  },

  isLoading () {
    return this._loading;
  },

  isActivityLoading () {
    return this._activityLoading;
  },

  isAuthenticated () {
    return this._authenticated;
  },

  getReplicationSource () {
    return this._replicationSource;
  },

  getlocalSource () {
    return this._localSource;
  },

  isLocalSourceKnown () {
    return _.contains(this._databases, this._localSource);
  },

  isLocalTargetKnown () {
    return _.contains(this._databases, this._localTarget);
  },

  getReplicationTarget () {
    return this._replicationTarget;
  },

  getDatabases () {
    return this._databases;
  },

  setDatabases (databases) {
    this._databases = databases;
  },

  getReplicationType () {
    return this._replicationType;
  },

  getlocalTarget () {
    return this._localTarget;
  },

  getReplicationDocName () {
    return this._replicationDocName;
  },

  setReplicationStatus (docs) {
    this._statusDocs = docs;
  },

  getReplicationStatus () {
    return this._statusDocs;
  },

  getFilteredReplicationStatus () {
    return this._statusDocs.filter(doc => {
      return _.values(doc).filter(item => {
        if (!item) {return null;}
        return item.toString().toLowerCase().match(this._statusFilter);
      }).length > 0;
    });
  },

  selectDoc (id) {
    const doc = this._statusDocs.find(doc => doc._id === id);
    if (!doc) {
      return;
    }

    doc.selected = !doc.selected;
    this._allDocsSelected = false;
  },

  selectAllDocs () {
    this._allDocsSelected = !this._allDocsSelected;
    this.getFilteredReplicationStatus().forEach(doc => doc.selected = this._allDocsSelected);
  },

  someDocsSelected () {
    return this.getFilteredReplicationStatus().some(doc => doc.selected);
  },

  getAllDocsSelected () {
    return this._allDocsSelected;
  },

  setStatusFilter (filter) {
    this._statusFilter = filter;
  },

  getStatusFilter () {
    return this._statusFilter;
  },
  // to cut down on boilerplate
  updateFormField (fieldName, value) {

    // I know this could be done by just adding the _ prefix to the passed field name, I just don't much like relying
    // on the var names like that...
    var validFieldMap = {
      remoteSource: '_remoteSource',
      remoteTarget: '_remoteTarget',
      localTarget: '_localTarget',
      replicationType: '_replicationType',
      replicationDocName: '_replicationDocName',
      replicationSource: '_replicationSource',
      replicationTarget: '_replicationTarget',
      localSource: '_localSource'
    };

    this[validFieldMap[fieldName]] = value;
  },

  getRemoteSource () {
    return this._remoteSource;
  },

  getRemoteTarget () {
    return this._remoteTarget;
  },

  isPasswordModalVisible () {
    return this._isPasswordModalVisible;
  },

  isConflictModalVisible () {
    return this._isConflictModalVisible;
  },

  getPassword () {
    return this._password;
  },

  setStateFromDoc (doc) {
    Object.keys(doc).forEach(key => {
      this.updateFormField(key, doc[key]);
    });
  },

  dispatch ({type, options}) {
    switch (type) {

      case ActionTypes.INIT_REPLICATION:
        this._loading = true;
        this._localSource = options.localSource;

        if (this._localSource) {
          this._replicationSource = Constants.REPLICATION_SOURCE.LOCAL;
          this._remoteSource = '';
          this._replicationTarget = '';
          this._localTarget = '';
          this._remoteTarget = '';
        }
      break;

      case ActionTypes.REPLICATION_DATABASES_LOADED:
        this.setDatabases(options.databases);
        this._loading = false;
      break;

      case ActionTypes.REPLICATION_UPDATE_FORM_FIELD:
        this.changeAfterSubmit();
        this.updateFormField(options.fieldName, options.value);
      break;

      case ActionTypes.REPLICATION_CLEAR_FORM:
        this.reset();
      break;

      case ActionTypes.REPLICATION_STARTING:
        this._submittedNoChange = true;
      break;

      case ActionTypes.REPLICATION_FETCHING_STATUS:
        this._activityLoading = true;
      break;

      case ActionTypes.REPLICATION_STATUS:
        this._activityLoading = false;
        this.setReplicationStatus(options);
      break;

      case ActionTypes.REPLICATION_FILTER_DOCS:
        this.setStatusFilter(options);
      break;

      case ActionTypes.REPLICATION_TOGGLE_DOC:
        this.selectDoc(options);
      break;

      case ActionTypes.REPLICATION_TOGGLE_ALL_DOCS:
        this.selectAllDocs();
      break;

      case ActionTypes.REPLICATION_SET_STATE_FROM_DOC:
        this.setStateFromDoc(options);
      break;

      case ActionTypes.REPLICATION_SHOW_CONFLICT_MODAL:
        this._isConflictModalVisible = true;
      break;

      case ActionTypes.REPLICATION_HIDE_CONFLICT_MODAL:
        this._isConflictModalVisible = false;
      break;

      case ActionTypes.REPLICATION_CHANGE_ACTIVITY_SORT:
        this.setActivitySort(options);
      break;

      case AccountActionTypes.AUTH_SHOW_PASSWORD_MODAL:
        this._isPasswordModalVisible = true;
      break;

      case AccountActionTypes.AUTH_HIDE_PASSWORD_MODAL:
        this._isPasswordModalVisible = false;
      break;

      case AccountActionTypes.AUTH_CREDS_VALID:
        this._authenticated = true;
        this.setCredentials(options.username, options.password);
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
