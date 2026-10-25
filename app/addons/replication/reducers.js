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
import FauxtonAPI from '../../core/api';
import ActionTypes from './actiontypes';
import Constants from './constants';
import app from "../../app";

const setActivitySort = (sort) => {
  app.utils.localStorageSet('replication-activity-sort', sort);
};

const loadActivitySort = () => {
  const defaultSort = {
    descending: false,
    column: 'statusTime'

  };
  let sort = app.utils.localStorageGet('replication-activity-sort');

  if (!sort) {
    sort = defaultSort;
  }

  setActivitySort(sort);
  return sort;
};

const validFieldMap = {
  remoteSource: 'remoteSource',
  remoteTarget: 'remoteTarget',
  localTarget: 'localTarget',
  replicationType: 'replicationType',
  replicationDocName: 'replicationDocName',
  replicationSource: 'replicationSource',
  replicationTarget: 'replicationTarget',
  localSource: 'localSource',
  sourceAuthType: 'sourceAuthType',
  sourceAuth: 'sourceAuth',
  targetAuthType: 'targetAuthType',
  targetAuth: 'targetAuth',
  targetDatabasePartitioned: 'targetDatabasePartitioned'
};

const initialState = {
  loading: false,
  databases: [],

  // source fields
  replicationSource: '',
  localSource: '',
  remoteSource: '',
  sourceAuthType: Constants.REPLICATION_AUTH_METHOD.NO_AUTH,
  sourceAuth: {},

  // target fields
  replicationTarget: '',
  localTarget: '',
  remoteTarget: '',
  targetAuthType: Constants.REPLICATION_AUTH_METHOD.NO_AUTH,
  targetAuth: {},
  targetDatabasePartitioned: false,

  // other
  isConflictModalVisible: false,
  replicationType: Constants.REPLICATION_TYPE.ONE_TIME,
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
  supportNewApi: false,
  fetchingReplicateInfo: false,
  replicateInfo: [],

  checkingAPI: true,
  activitySort: loadActivitySort(),
  pageLimit: 100,
};

const clearForm = (state) => {
  const newState = {
    ...state
  };
  Object.values(validFieldMap).forEach(field => {
    if (field === 'sourceAuth' || field === 'targetAuth') {
      newState[field] = {};
    } else if (field === 'targetDatabasePartitioned') {
      newState[field] = false;
    } else {
      newState[field] = '';
    }
  });
  newState.sourceAuthType = Constants.REPLICATION_AUTH_METHOD.NO_AUTH;
  newState.targetAuthType = Constants.REPLICATION_AUTH_METHOD.NO_AUTH;
  return newState;
};

const updateFormField = (state, fieldName, value) => {
  const updateState = {
    ...state,
    submittedNoChange: false,
  };
  updateState[validFieldMap[fieldName]] = value;

  const replicationSource = updateState[validFieldMap.replicationSource];
  const sourceAuthType    = updateState[validFieldMap.sourceAuthType];
  const sourceAuth        = updateState[validFieldMap.sourceAuth];

  const replicationTarget = updateState[validFieldMap.replicationTarget];
  const targetAuthType    = updateState[validFieldMap.targetAuthType];
  const targetAuth        = updateState[validFieldMap.targetAuth];

  // Set default username when source auth is set to BASIC
  if (fieldName === validFieldMap.sourceAuthType &&
      sourceAuthType === Constants.REPLICATION_AUTH_METHOD.BASIC &&
      replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
    if (!sourceAuth || !sourceAuth.username) {
      updateState[validFieldMap.sourceAuth] = {
        username: FauxtonAPI.session.user().name,
        password: ''
      };
    }
  }

  // Set default username when target auth is set to BASIC
  if (fieldName === validFieldMap.targetAuthType &&
      targetAuthType === Constants.REPLICATION_AUTH_METHOD.BASIC &&
      (replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE ||
       replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE)) {
    if (!targetAuth || !targetAuth.username) {
      updateState[validFieldMap.targetAuth] = {
        username: FauxtonAPI.session.user().name,
        password: ''
      };
    }
  }

  // Normalize source: keep localSource in sync with replicationSource
  if (fieldName === validFieldMap.replicationSource) {
    if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
      if (!updateState.localSource && updateState.databases.length > 0) {
        updateState.localSource = updateState.databases[0];
      }
    } else {
      updateState.localSource = '';
    }
  }

  // Normalize target: keep localTarget in sync with replicationTarget
  if (fieldName === validFieldMap.replicationTarget) {
    if (replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE) {
      if (!updateState.localTarget && updateState.databases.length > 0) {
        updateState.localTarget = updateState.databases[0];
      }
    } else if (replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {
      updateState.localTarget = '';
    } else {
      updateState.localTarget = '';
    }
  }

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
    allDocsSelected: !state.allDocsSelected
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
    allReplicateSelected: !state.allReplicateSelected
  };

  getReplicateInfo(newState).forEach(doc => doc.selected = newState.allReplicateSelected);
  return newState;
};

const setStateFromDoc = (state, doc) => {
  let newState = {
    ...state,
    loading: false
  };

  return Object.keys(doc).reduce((state, key) => {
    return updateFormField(state, key, doc[key]);
  }, newState);
};


const replication = (state = initialState, {type, options}) => {
  switch (type) {

    case ActionTypes.INIT_REPLICATION:
      const newState = {
        ...state,
        loading: true
      };

      if (options.localSource) {
        newState.localSource = options.localSource;
        newState.replicationSource = Constants.REPLICATION_SOURCE.LOCAL;
        newState.remoteSource = '';
        newState.replicationTarget = '';
        newState.localTarget = '';
        newState.remoteTarget = '';
      }
      return newState;

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
      setActivitySort(options);
      return {
        ...state,
        activitySort: loadActivitySort()
      };

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
      return {
        ...state,
        fetchingReplicateInfo: false,
        replicateInfo: options
      };

    case ActionTypes.REPLICATION_CLEAR_SELECTED_REPLICATES:
      return {
        ...state,
        allReplicateSelected: false
      };

    case ActionTypes.REPLICATION_SET_PAGE_LIMIT:
      return {
        ...state,
        pageLimit: options
      };

    default:
      return state;
  }
};


export const isLoading = (state) => state.isLoading;
export const isActivityLoading = (state) => state.activityLoading;
export const getDatabases = (state) => state.databases;

export const getReplicationSource = (state) => state.replicationSource;
export const getLocalSource = (state) => state.localSource;
export const isLocalSourceKnown = (state) => _.includes(state.databases, state.localSource);
export const getRemoteSource = (state) => state.remoteSource;


export const getReplicationTarget = (state) => state.replicationTarget;
export const getLocalTarget = (state) => state.localTarget;
export const isLocalTargetKnown = (state) => _.includes(state.databases, state.localTarget);
export const getRemoteTarget = (state) => state.remoteTarget;

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
export const getSomeDocsSelected = (state) => getFilteredReplicationStatus(state).some(doc => doc.selected);
export const getUsername = (state) => state.username;
export const getPassword = (state) => state.password;
export const getActivitySort = (state) => state.activitySort;
export const getTabSection = (state) => state.tabSection;
export const getCheckingApi = (state) => state.checkingAPI;
export const supportNewApi = (state) => state.supportNewApi;
export const isReplicateInfoLoading = (state) => state.fetchingReplicateInfo;
export const getAllReplicateSelected = (state) => state.allReplicateSelected;
export const someReplicateSelected = (state) => getReplicateInfo(state).some(doc => doc.selected);

export const getReplicateInfo = (state) => {
  return state.replicateInfo.filter(doc => {
    return Object.values(doc).filter(item => {
      if (!item) {return false;}
      return item.toString().toLowerCase().match(state._replicateFilter);
    }).length > 0;
  });
};

export const getPageLimit = (state) => state.pageLimit;

export default replication;
