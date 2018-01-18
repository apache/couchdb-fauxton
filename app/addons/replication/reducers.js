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
import ActionTypes from './actiontypes';
import AccountActionTypes from '../auth/actiontypes';
import Constants from './constants';
import app from "../../app";

const validFieldMap = {
  remoteSource: 'remoteSource',
  remoteTarget: 'remoteTarget',
  localTarget: 'localTarget',
  replicationType: 'replicationType',
  replicationDocName: 'replicationDocName',
  replicationSource: 'replicationSource',
  replicationTarget: 'replicationTarget',
  localSource: 'localSource'
};

const initialState = {
  loading: false,
  databases: [],
  authenticated: false,

  // source fields
  replicationSource: '',
  localSource: '',
  remoteSource: '',

  // target fields
  replicationTarget: '',
  localTarget: '',
  remoteTarget: '',

  // other
  isPasswordModalVisible: false,
  isConflictModalVisible: false,
  replicationType: Constants.REPLICATIONTYPE.ONETIME,
  replicationDocName: '',
  submittedNoChange: false,
  statusDocs: [],
  statusFilteredStatusDocs: [],
  statusFilter: '',
  replicateFilter: '',
  allDocsSelected: false,
  allReplicateSelected: false,
  username: '',
  password: '',
  activityLoading: false,
  tabSection: 'new replication',
  supportNewApi: true,
  fetchingReplicateInfo: false,
  replicateInfo: [],

  checkingAPI: true,
};

const clearForm = (state) => {
  const newState = {
    ...state
  };
  Object.values(validFieldMap).forEach(field => newState[field] = '');
  return newState;
};

const updateFormField = (state, fieldName, value) => {
  const updateState = {
    ...state,
    submittedNoChange: false,
  };

  updateState[validFieldMap[fieldName]] = value;

  return updateState;
};

const toggleDoc = (state, id) => {
  const doc = state.statusDocs.find(doc => doc._id === id);
  if (!doc) {
    return state;
  }

  doc.selected = !doc.selected;

  return {
    ...state,
    allDocsSelected: false
  };
};

const selectAllDocs = (state) => {
  const newState = {
    ...state,
    allDocsSelected: state.allDocsSelected
  };

  getFilteredReplicationStatus(newState)
    .forEach(doc => doc.selected = newState.allDocsSelected);

  return newState;
};

const selectReplicate = (state, id) => {
  const newState = {
    ...state
  };

  const doc = newState._replicateInfo.find(doc => doc._id === id);

  if (!doc) {
    return newState;
  }

  doc.selected = !doc.selected;
  newState._allReplicateSelected = false;
};

const selectAllReplicate = (state) => {
  const newState = {
    ...state,
    allReplicateSelected: state.allReplicateSelected
  };

  getReplicateInfo(newState).forEach(doc => doc.selected = newState.allReplicateSelected);
  return newState;
};

const setStateFromDoc = (state, doc) => {
  const newState = {
    ...state,
    loading: false
  };

  Object.keys(doc).forEach(key => {
    updateFormField(newState, key, doc[key]);
  });
};

const setActivitySort = (state, sort) => {
  app.utils.localStorageSet('replication-activity-sort', sort);

  return {
    ...state,
    activitySort: sort
  };
};

const loadActivitySort = (state) => {
  const defaultSort = {
    descending: false,
    column: 'statusTime'

  };
  let sort = app.utils.localStorageGet('replication-activity-sort');

  if (!sort) {
    sort = defaultSort;
  }

  return  setActivitySort(state, sort);
};

const replication = (state = initialState, {type, options}) => {
  switch (type) {

    case ActionTypes.INIT_REPLICATION:
      return {
        ...state,
        loading: true
      };
      // this._localSource = options.localSource;
      //
      // if (this._localSource) {
      //   this._replicationSource = Constants.REPLICATION_SOURCE.LOCAL;
      //   this._remoteSource = '';
      //   this._replicationTarget = '';
      //   this._localTarget = '';
      //   this._remoteTarget = '';
      // }

    case ActionTypes.REPLICATION_DATABASES_LOADED:
      return {
        ...state,
        loading: false,
        databases: options.databases
      };

    case ActionTypes.REPLICATION_FETCHING_FORM_STATE:
      return {
        ...state,
        loading: true
      };

    case ActionTypes.REPLICATION_UPDATE_FORM_FIELD:
      return updateFormField(state, options.fieldName, options.value);

    case ActionTypes.REPLICATION_CLEAR_FORM:
      return clearForm(state);

    case ActionTypes.REPLICATION_STARTING:
      return {
        ...state,
        submittedNoChange: true
      };

    case ActionTypes.REPLICATION_FETCHING_STATUS:
      return {
        ...state,
        activityLoading: true
      };

    case ActionTypes.REPLICATION_STATUS:
      return {
        ...state,
        activityLoading: false,
        statusDocs: options
      };

    case ActionTypes.REPLICATION_FILTER_DOCS:
      return {
        ...state,
        statusFilter: options
      };

    case ActionTypes.REPLICATION_FILTER_REPLICATE:
      return {
        ...state,
        replicateFilter: options
      };

    case ActionTypes.REPLICATION_TOGGLE_DOC:
      return toggleDoc(state, options);

    case ActionTypes.REPLICATION_TOGGLE_ALL_DOCS:
      return selectAllDocs(state);

    case ActionTypes.REPLICATION_TOGGLE_REPLICATE:
      return selectReplicate(state, options);

    case ActionTypes.REPLICATION_TOGGLE_ALL_REPLICATE:
      return selectAllReplicate(state);

    case ActionTypes.REPLICATION_SET_STATE_FROM_DOC:
      return setStateFromDoc(state, options);

    case ActionTypes.REPLICATION_SHOW_CONFLICT_MODAL:
      return {
        ...state,
        isConflictModalVisible: true
      };

    case ActionTypes.REPLICATION_HIDE_CONFLICT_MODAL:
      return {
        ...state,
        isConflictModalVisible: false
      };

    case ActionTypes.REPLICATION_CHANGE_ACTIVITY_SORT:
      return setActivitySort(options);

    case ActionTypes.REPLICATION_CLEAR_SELECTED_DOCS:
      return {
        ...state,
        allDocsSelected: false
      };

    case ActionTypes.REPLICATION_CHANGE_TAB_SECTION:
      return {
        ...state,
        tabSection: options
      };

    case ActionTypes.REPLICATION_SUPPORT_NEW_API:
      return {
        ...state,
        checkingApi: false,
        supportNewApi: options
      };

    case ActionTypes.REPLICATION_FETCHING_REPLICATE_STATUS:
      return {
        ...state,
        fetchingReplicateInfo: true,
      };

    case ActionTypes.REPLICATION_REPLICATE_STATUS:
      this._fetchingReplicateInfo = false;
      return setReplicateInfo(state, options);

    case ActionTypes.REPLICATION_CLEAR_SELECTED_REPLICATES:
      this._allReplicateSelected = false;
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


  return state;
};


export const isLoading = (state) => state.isLoading;
export const isActivityLoading = (state) => state.activityLoading;
export const getDatabases = (state) => state.databases;
export const isAuthenticated = (state) => state.authenticated;

export const getReplicationSource = (state) => state.replicationSource;
export const getlocalSource = (state) => state.localSource;
export const isLocalSourceKnown = (state) => _.includes(state.databases, state.localSource);
export const getRemoteSource = (state) => state.remoteSource;


export const getReplicationTarget = (state) => state.replicationTarget;
export const getLocalTarget = (state) => state.replicationTarget;
export const isLocalTargetKnown = (state) => _.includes(state.databases, state.localTarget);
export const getRemoteTarget = (state) => state.remoteTarget;

export const isPasswordModalVisible = (state) => state.isPasswordModalVisible;
export const isConflictModalVisible = (state) => state.isConflictModalVisible;
export const getReplicationType = (state) => state.replicationType;
export const getReplicationDocName = (state) => state.replicationDocName;
export const getSubmittedNoChange = (state) => state.submittedNoChange;

export const getFilteredReplicationStatus = (state) => {
  return state.statusDocs.filter(doc => {
    return Object.values(doc).filter(item => {
      if (!item) {return null;}
      return item.toString().toLowerCase().match(state.statusFilter);
    }).length > 0;
  });
};

export const getStatusFilter = (state) => state.statusFilter;
export const getReplicateFilter = (state) => state.replicateFilter;
export const getAllDocsSelected = (state) => state.allDocsSelected;
export const getSomeDocsSelected = (state) => state.someDocsSelected;
export const getUsername = (state) => state.username;
export const getPassword = (state) => state.password;
export const getActivitySort = (state) => state.activitySort;
export const getTabSection = (state) => state.tabSection;
export const getCheckingApi = (state) => state.checkingAPI;
export const supportNewApi = (state) => state.supportNewApi;
export const isReplicateInfoLoading = (state) => state.fetchingReplicateInfo;
export const getAllReplicateSelected = (state) => state.allReplicateSelected;
export const someReplicateSelected = (state) => state.someReplicateSelected;

export const getReplicateInfo = (state) => {
  return state.replicateInfo.filter(doc => {
    return Object.values(doc).filter(item => {
      if (!item) {return false;}
      return item.toString().toLowerCase().match(state._replicateFilter);
    }).length > 0;
  });
};

export default replication;
