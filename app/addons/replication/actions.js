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
import base64 from 'base-64';
import FauxtonAPI from '../../core/api';
import {get, post} from '../../core/ajax';
import ActionTypes from './actiontypes';
import Helpers from './helpers';
import MainHelper from '../../helpers';
import Constants from './constants';
import utils from '../../core/utils';
import {
  supportNewApi,
  createReplicationDoc,
  fetchReplicateInfo,
  fetchReplicationDocs,
  decodeFullUrl,
  deleteReplicatesApi,
  createReplicatorDB
} from './api';


export const initReplicator = (routeLocalSource, localSource) => dispatch => {
  if (routeLocalSource && routeLocalSource !== localSource) {
    dispatch({
      type: ActionTypes.INIT_REPLICATION,
      options: {
        localSource: routeLocalSource
      }
    });
  }
};

export const getDatabasesList = () => dispatch => {
  const url = MainHelper.prependRelativeCouchDbPath("/_all_dbs");
  get(url)
    .then((databases) => {
      dispatch({
        type: ActionTypes.REPLICATION_DATABASES_LOADED,
        options: {
          databases
        }
      });
    });
};

export const replicate = (params, pageLimit) => dispatch => {
  const replicationDoc = createReplicationDoc(params);
  const url = MainHelper.prependRelativeCouchDbPath("/_replicator");
  const promise = post(url, replicationDoc);

  const source = Helpers.getDatabaseLabel(replicationDoc.source);
  const target = Helpers.getDatabaseLabel(replicationDoc.target);

  dispatch({
    type: ActionTypes.REPLICATION_STARTING,
  });

  const handleError = (json) => {
    FauxtonAPI.addNotification({
      msg: json.reason,
      type: 'error',
      clear: true
    });
  };

  // Return promise for testing
  return promise
    .then(json => {
      if (!json.ok) {
        throw json;
      }

      FauxtonAPI.addNotification({
        msg: `Replication from "${decodeURIComponent(source)}" to "${decodeURIComponent(target)}" has been scheduled.`,
        type: 'success',
        escape: false,
        clear: true
      });

      dispatch(getReplicationActivity(pageLimit));
      FauxtonAPI.navigate('#/replication');
    }).catch(json => {
      if (json.error && json.error === "not_found") {
        return createReplicatorDB().then(() => {
          return replicate(params, pageLimit)(dispatch);
        }).catch(handleError);
      }
      handleError(json);
    });
};

export const updateFormField = (fieldName, value) => {
  return {
    type: ActionTypes.REPLICATION_UPDATE_FORM_FIELD,
    options: {
      fieldName: fieldName,
      value: value
    }
  };
};

export const clearReplicationForm = () => {
  return { type: ActionTypes.REPLICATION_CLEAR_FORM };
};

export const getReplicationActivity = (pageLimit) => (dispatch) => {
  dispatch({
    type: ActionTypes.REPLICATION_FETCHING_STATUS,
  });

  fetchReplicationDocs(pageLimit)
    .then(docs => {
      dispatch({
        type: ActionTypes.REPLICATION_STATUS,
        options: docs
      });
    });
};

export const getReplicateActivity = () => dispatch => {
  supportNewApi()
    .then(newApi => {
      if (!newApi) {
        return;
      }

      dispatch({
        type: ActionTypes.REPLICATION_FETCHING_REPLICATE_STATUS,
      });

      fetchReplicateInfo()
        .then(replicateInfo => {
          dispatch({
            type: ActionTypes.REPLICATION_REPLICATE_STATUS,
            options: replicateInfo
          });
        });
    });
};

export const filterDocs = (filter) => {
  return {
    type: ActionTypes.REPLICATION_FILTER_DOCS,
    options: filter
  };
};

export const filterReplicate = (filter) => {
  return {
    type: ActionTypes.REPLICATION_FILTER_REPLICATE,
    options: filter
  };
};

export const selectAllDocs = () => {
  return {
    type: ActionTypes.REPLICATION_TOGGLE_ALL_DOCS
  };
};

export const selectDoc = (id) => {
  return {
    type: ActionTypes.REPLICATION_TOGGLE_DOC,
    options: id
  };
};

export const selectAllReplicates = () => {
  return {
    type: ActionTypes.REPLICATION_TOGGLE_ALL_REPLICATE
  };
};

export const selectReplicate = (id) => {
  return {
    type: ActionTypes.REPLICATION_TOGGLE_REPLICATE,
    options: id
  };
};

export const clearSelectedDocs = () => {
  return {
    type: ActionTypes.REPLICATION_CLEAR_SELECTED_DOCS
  };
};

export const clearSelectedReplicates = () => {
  return {
    type: ActionTypes.REPLICATION_CLEAR_SELECTED_REPLICATES
  };
};

export const deleteDocs = (docs, pageLimit) => dispatch => {
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

  const url = MainHelper.prependRelativeCouchDbPath('/_replicator/_bulk_docs');
  post(url, {docs: bulkDocs}, {raw: true})
    .then(resp => {
      if (!resp.ok) {
        throw resp;
      }
      return resp;
    })
    .then(() => {

      let msg = 'The selected documents have been deleted.';
      if (docs.length === 1) {
        msg = `Document "${docs[0]._id}" has been deleted`;
      }

      FauxtonAPI.addNotification({
        msg: msg,
        type: 'success',
        escape: false,
        clear: true
      });

      dispatch(clearSelectedDocs());
      dispatch(getReplicationActivity(pageLimit));
    })
    .catch(resp => {
      resp.json()
        .then(error => {
          FauxtonAPI.addNotification({
            msg: error.reason,
            type: 'error',
            clear: true
          });
        });

    });
};

export const deleteReplicates = (replicates) => dispatch => {
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
        msg = `Replication "${replicates[0]._id}" has been deleted`;
      }

      dispatch(clearSelectedReplicates());
      dispatch(getReplicateActivity());

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

const getAuthTypeAndCredentials = (repSourceOrTarget) => {
  const authTypeAndCreds = {
    type: Constants.REPLICATION_AUTH_METHOD.NO_AUTH,
    creds: {}
  };
  if (repSourceOrTarget.headers && repSourceOrTarget.headers.Authorization) {
    // Removes 'Basic ' prefix
    const encodedCreds = repSourceOrTarget.headers.Authorization.substring(6);
    try {
      const decodedCreds = base64.decode(encodedCreds);
      authTypeAndCreds.type = Constants.REPLICATION_AUTH_METHOD.BASIC;
      authTypeAndCreds.creds = {
        username: decodedCreds.split(':')[0],
        password: decodedCreds.split(':')[1]
      };
      return authTypeAndCreds;
    } catch (ex) {
      throw new Error(`Error decoding Authorization header from replication document`);
    }
  }

  // Tries to get creds using one of the custom auth methods
  // The extension should provide:
  //   - 'getCredentials(obj)' method that extracts the credentials from obj which is the 'target'/'source' field of the replication doc.
  //   - 'typeValue' field with an arbitrary ID representing the auth type the extension supports.
  const authExtensions = FauxtonAPI.getExtensions('Replication:Auth');
  let credentials = undefined;
  let customAuthType = undefined;
  if (authExtensions) {
    authExtensions.map(ext => {
      if (!credentials && ext.getCredentials) {
        credentials = ext.getCredentials(repSourceOrTarget);
        customAuthType = ext.typeValue;
      }
    });
  }
  if (credentials) {
    authTypeAndCreds.type = customAuthType;
    authTypeAndCreds.creds = credentials;
  }
  return authTypeAndCreds;
};

const getTargetDatabasePartitioned = (createTargetParams) => {
  if (createTargetParams && createTargetParams.partitioned === true) {
    return true;
  }
  return false;
};

const inferDbDetailsFromEndpoint = (endpoint) => {
  const url = _.isObject(endpoint) ? endpoint.url : endpoint;
  const urlObj = new URL(url);

  const isLocal = utils.isLocalToAppHost(urlObj);
  const auth = getAuthTypeAndCredentials(endpoint);

  return {
    isLocal,
    dbName: decodeURIComponent(urlObj.pathname.slice(1)),
    fullUrl: decodeFullUrl(url),
    authType: auth.type,
    auth: auth.creds,
  };
};

const buildStateFromDoc = (doc) => {
  const source = inferDbDetailsFromEndpoint(doc.source);
  const target = inferDbDetailsFromEndpoint(doc.target);

  return {
    // meta
    replicationDocName: doc._id,
    replicationType: doc.continuous ? Constants.REPLICATION_TYPE.CONTINUOUS : Constants.REPLICATION_TYPE.ONE_TIME,
    // source
    ...(source.isLocal ? {
      replicationSource: Constants.REPLICATION_SOURCE.LOCAL,
      localSource: source.dbName,
    } : {
      replicationSource: Constants.REPLICATION_SOURCE.REMOTE,
      remoteSource: source.fullUrl,
    }),
    sourceAuthType: source.authType,
    sourceAuth: source.auth,
    // target
    ...(target.isLocal ? {
      replicationTarget: Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE,
      localTarget: target.dbName,
    } : {
      replicationTarget: Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE,
      remoteTarget: target.fullUrl,
    }),
    targetAuthType: target.authType,
    targetAuth: target.auth,
    targetDatabasePartitioned: getTargetDatabasePartitioned(doc.create_target_params)
  };
};

export const getReplicationStateFrom = (id) => (dispatch) => {
  dispatch({ type: ActionTypes.REPLICATION_FETCHING_FORM_STATE });

  const url = MainHelper.prependRelativeCouchDbPath(`/_replicator/${encodeURIComponent(id)}`);
  get(url)
    .then((doc) => {
      dispatch({
        type: ActionTypes.REPLICATION_SET_STATE_FROM_DOC,
        options: buildStateFromDoc(doc),
      });
    })
    .catch((error) => {
      FauxtonAPI.addNotification({
        msg: error.reason || error.message,
        type: "error",
        clear: true,
      });
    });
};

export const showConflictModal = () => {
  return {
    type: ActionTypes.REPLICATION_SHOW_CONFLICT_MODAL
  };
};

export const hideConflictModal = () => {
  return {
    type: ActionTypes.REPLICATION_HIDE_CONFLICT_MODAL
  };
};

export const changeActivitySort = (sort) => {
  return {
    type: ActionTypes.REPLICATION_CHANGE_ACTIVITY_SORT,
    options: sort
  };
};

export const checkForNewApi = () => dispatch => {
  supportNewApi().then(newApi => {
    dispatch({
      type: ActionTypes.REPLICATION_SUPPORT_NEW_API,
      options: newApi
    });
  });
};

export const setPageLimit = (limit) => dispatch => {
  dispatch({
    type: ActionTypes.REPLICATION_SET_PAGE_LIMIT,
    options: limit,
  });
  getReplicationActivity(limit)(dispatch);
};
