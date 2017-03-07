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
import app from '../../app';
import FauxtonAPI from '../../core/api';
import ActionTypes from './actiontypes';
import Helpers from './helpers';
import Constants from './constants';
import {
  supportNewApi,
  createReplicationDoc,
  fetchReplicateInfo,
  fetchReplicationDocs,
  decodeFullUrl,
  deleteReplicatesApi,
  createReplicatorDB
} from './api';
import $ from 'jquery';


function initReplicator (localSource) {
  if (localSource) {
    FauxtonAPI.dispatch({
      type: ActionTypes.INIT_REPLICATION,
      options: {
        localSource: localSource
      }
    });
  }
  $.ajax({
    url: app.host + '/_all_dbs',
    contentType: 'application/json',
    dataType: 'json'
  }).then((databases) => {
    FauxtonAPI.dispatch({
      type: ActionTypes.REPLICATION_DATABASES_LOADED,
      options: {
        databases: databases
      }
    });
  });
}

function replicate (params) {
  const replicationDoc = createReplicationDoc(params);

  const promise = $.ajax({
    url: window.location.origin + '/_replicator',
    contentType: 'application/json',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(replicationDoc)
  });

  const source = Helpers.getDatabaseLabel(replicationDoc.source);
  const target = Helpers.getDatabaseLabel(replicationDoc.target);

  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_STARTING,
  });

  promise.then(() => {
    FauxtonAPI.addNotification({
      msg: `Replication from <code>${decodeURIComponent(source)}</code> to <code>${decodeURIComponent(target)}</code> has been scheduled.`,
      type: 'success',
      escape: false,
      clear: true
    });
  }, (xhr) => {
    const errorMessage = JSON.parse(xhr.responseText);

    if (errorMessage.error && errorMessage.error === "not_found") {
      return createReplicatorDB().then(() => {
        return replicate(params);
      });
    }

    FauxtonAPI.addNotification({
      msg: errorMessage.reason,
      type: 'error',
      clear: true
    });
  });
}

function updateFormField (fieldName, value) {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_UPDATE_FORM_FIELD,
    options: {
      fieldName: fieldName,
      value: value
    }
  });
}

function clearReplicationForm () {
  FauxtonAPI.dispatch({ type: ActionTypes.REPLICATION_CLEAR_FORM });
}

const getReplicationActivity = (supportNewApi) => {
  FauxtonAPI.dispatch({
      type: ActionTypes.REPLICATION_FETCHING_STATUS,
  });

  fetchReplicationDocs(supportNewApi).then(docs => {
    FauxtonAPI.dispatch({
      type: ActionTypes.REPLICATION_STATUS,
      options: docs
    });
  });
};

const getReplicateActivity = () => {
  FauxtonAPI.dispatch({
      type: ActionTypes.REPLICATION_FETCHING_REPLICATE_STATUS,
  });

  fetchReplicateInfo().then(replicateInfo => {
    FauxtonAPI.dispatch({
      type: ActionTypes.REPLICATION_REPLICATE_STATUS,
      options: replicateInfo
    });
  });
};

const filterDocs = (filter) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_FILTER_DOCS,
    options: filter
  });
};

const filterReplicate = (filter) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_FILTER_REPLICATE,
    options: filter
  });
};

const selectAllDocs = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_TOGGLE_ALL_DOCS
  });
};

const selectDoc = (id) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_TOGGLE_DOC,
    options: id
  });
};

const selectAllReplicates = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_TOGGLE_ALL_REPLICATE
  });
};

const selectReplicate = (id) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_TOGGLE_REPLICATE,
    options: id
  });
};

const clearSelectedDocs = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_CLEAR_SELECTED_DOCS
  });
};

const clearSelectedReplicates = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_CLEAR_SELECTED_REPLICATES
  });
};

const deleteDocs = (docs) => {
  const bulkDocs = docs.map(({raw: doc}) => {
    doc._deleted = true;
    return doc;
  });

  FauxtonAPI.addNotification({
    msg: `Deleting doc${bulkDocs.length > 1 ? 's' : ''}.`,
    type: 'success',
    escape: false,
    clear: true
  });

  $.ajax({
    url: app.host + '/_replicator/_bulk_docs',
    contentType: 'application/json',
    dataType: 'json',
    method: 'POST',
    data: JSON.stringify({docs: bulkDocs})
  }).then(() => {
    let msg = 'The selected documents have been deleted.';
    if (docs.length === 1) {
      msg = `Document <code>${docs[0]._id}</code> has been deleted`;
    }

    FauxtonAPI.addNotification({
      msg: msg,
      type: 'success',
      escape: false,
      clear: true
    });
    clearSelectedDocs();
    getReplicationActivity();
  }, (xhr) => {
    const errorMessage = JSON.parse(xhr.responseText);
    FauxtonAPI.addNotification({
      msg: errorMessage.reason,
      type: 'error',
      clear: true
    });
  });
};

const deleteReplicates = (replicates) => {
  console.log('ss', replicates);
  FauxtonAPI.addNotification({
    msg: `Deleting _replicate${replicates.length > 1 ? 's' : ''}.`,
    type: 'success',
    escape: false,
    clear: true
  });

  deleteReplicatesApi(replicates)
  .then(() => {
    let msg = 'The selected replications have been deleted.';
    if (replicates.length === 1) {
      msg = `Replication <code>${replicates[0]._id}</code> has been deleted`;
    }

    clearSelectedReplicates();
    getReplicateActivity();

    FauxtonAPI.addNotification({
      msg: msg,
      type: 'success',
      escape: false,
      clear: true
    });
  }, (xhr) => {
    const errorMessage = JSON.parse(xhr.responseText);
    FauxtonAPI.addNotification({
      msg: errorMessage.reason,
      type: 'error',
      clear: true
    });
  });
};

const getReplicationStateFrom = (id) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_FETCHING_FORM_STATE
  });

  $.ajax({
    url: `${app.host}/_replicator/${encodeURIComponent(id)}`,
    contentType: 'application/json',
    dataType: 'json',
    method: 'GET'
  }).then((doc) => {
    const stateDoc = {
      replicationDocName: doc._id,
      replicationType: doc.continuous ? Constants.REPLICATION_TYPE.CONTINUOUS : Constants.REPLICATION_TYPE.ONE_TIME,
    };

    const sourceUrl = _.isObject(doc.source) ? doc.source.url : doc.source;
    const targetUrl = _.isObject(doc.target) ? doc.target.url : doc.target;

    if (sourceUrl.indexOf(window.location.hostname) > -1) {
      const url = new URL(sourceUrl);
      stateDoc.replicationSource = Constants.REPLICATION_SOURCE.LOCAL;
      stateDoc.localSource = decodeURIComponent(url.pathname.slice(1));
    } else {
      stateDoc.replicationSource = Constants.REPLICATION_SOURCE.REMOTE;
      stateDoc.remoteSource = decodeFullUrl(sourceUrl);
    }

    if (targetUrl.indexOf(window.location.hostname) > -1) {
      const url = new URL(targetUrl);
      stateDoc.replicationTarget = Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE;
      stateDoc.localTarget = decodeURIComponent(url.pathname.slice(1));
    } else {
      stateDoc.replicationTarget = Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE;
      stateDoc.remoteTarget = decodeFullUrl(targetUrl);
    }

    FauxtonAPI.dispatch({
      type: ActionTypes.REPLICATION_SET_STATE_FROM_DOC,
      options: stateDoc
    });

  }, (xhr) => {
    const errorMessage = JSON.parse(xhr.responseText);
    FauxtonAPI.addNotification({
      msg: errorMessage.reason,
      type: 'error',
      clear: true
    });
  });
};

const showConflictModal = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_SHOW_CONFLICT_MODAL
  });
};

const hideConflictModal = () => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_HIDE_CONFLICT_MODAL
  });
};

const changeActivitySort = (sort) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_CHANGE_ACTIVITY_SORT,
    options: sort
  });
};

const changeTabSection = (newSection, url) => {
  FauxtonAPI.dispatch({
    type: ActionTypes.REPLICATION_CHANGE_TAB_SECTION,
    options: newSection
  });

  if (url) {
    FauxtonAPI.navigate(url, {trigger: false});
  }
};

const checkForNewApi = () => {
  supportNewApi().then(newApi => {
    FauxtonAPI.dispatch({
      type: ActionTypes.REPLICATION_SUPPORT_NEW_API,
      options: newApi
    });
  });
};

export default {
  checkForNewApi,
  initReplicator,
  replicate,
  updateFormField,
  clearReplicationForm,
  getReplicationActivity,
  filterDocs,
  selectAllDocs,
  selectDoc,
  deleteDocs,
  getReplicationStateFrom,
  showConflictModal,
  hideConflictModal,
  changeActivitySort,
  clearSelectedDocs,
  changeTabSection,
  getReplicateActivity,
  filterReplicate,
  selectReplicate,
  selectAllReplicates,
  deleteReplicates
};
