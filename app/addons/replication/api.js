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

import '@webcomponents/url';
import Constants from './constants';
import FauxtonAPI from '../../core/api';
import Helpers from '../../helpers';
import {get, post, put} from '../../core/ajax';
import base64 from 'base-64';
import _ from 'lodash';

let newApiPromise = null;
export const supportNewApi = (forceCheck) => {
  if (!newApiPromise || forceCheck) {
    newApiPromise = new FauxtonAPI.Promise((resolve) => {
      const url = Helpers.getServerUrl('/_scheduler/jobs');
      get(url, {raw: true})
        .then(resp => {
          if (resp.status > 202) {
            return resolve(false);
          }
          resolve(true);
        });
    });
  }

  return newApiPromise;
};

export const encodeFullUrl = (fullUrl) => {
  if (!fullUrl) {return '';}
  const url = new URL(fullUrl);
  return `${url.origin}/${encodeURIComponent(url.pathname.slice(1))}`;
};

export const decodeFullUrl = (fullUrl) => {
  if (!fullUrl) {return '';}
  const url = new URL(fullUrl);
  return `${url.origin}/${decodeURIComponent(url.pathname.slice(1))}`;
};

export const getUsername = () => {
  return FauxtonAPI.session.user().name;
};

export const getAuthHeaders = (username, password) => {
  if (!username || !password) {
    return {};
  }
  return {
    'Authorization': 'Basic ' + base64.encode(username + ':' + password)
  };
};

export const getCredentialsFromUrl = (url) => {
  const index = url.lastIndexOf('@');
  if (index === -1) {
    return {
      username: '',
      password: ''
    };
  }

  const startIndex = url.startsWith("https") ? 8 : 7;
  const rawCreds = url.slice(startIndex, index);
  const colonIndex = rawCreds.indexOf(':');
  const username = rawCreds.slice(0, colonIndex);
  const password = rawCreds.slice(colonIndex + 1, rawCreds.length);

  return {
    username,
    password
  };
};

export const removeCredentialsFromUrl = (url) => {
  const index = url.lastIndexOf('@');
  if (index === -1) {
    return url;
  }

  const protocol = url.startsWith("https") ? "https://" : 'http://';
  const cleanUrl = url.slice(index + 1);
  return protocol + cleanUrl;
};

export const getSource = ({
  replicationSource,
  localSource,
  remoteSource,
  sourceAuthType,
  sourceAuth
},
{origin, pathname} = window.location) => {

  const source = {};
  if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
    const encodedLocalTarget = encodeURIComponent(localSource);

    const root = Helpers.getRootUrl({origin, pathname});
    source.url = `${root}${encodedLocalTarget}`;
  } else {
    source.url = encodeFullUrl(removeCredentialsFromUrl(remoteSource));
  }

  setCredentials(source, sourceAuthType, sourceAuth);
  return source;
};

export const getTarget = ({
  replicationTarget,
  localTarget,
  remoteTarget,
  targetAuthType,
  targetAuth
},
//this allows us to mock out window.location for our tests
{origin, pathname} = window.location) => {

  const target = {};
  if (replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
        replicationTarget === Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE) {
    target.url = encodeFullUrl(removeCredentialsFromUrl(remoteTarget));
  } else {
    const encodedLocalTarget = encodeURIComponent(localTarget);
    const root = Helpers.getRootUrl({origin, pathname});
    target.url = `${root}${encodedLocalTarget}`;
  }

  setCredentials(target, targetAuthType, targetAuth);
  return target;
};

const setCredentials = (target, authType, auth) => {
  if (!authType || authType === Constants.REPLICATION_AUTH_METHOD.NO_AUTH) {
    target.headers = {};
  } else if (authType === Constants.REPLICATION_AUTH_METHOD.BASIC) {
    target.headers = getAuthHeaders(auth.username, auth.password);
  } else {
    // Tries to set creds using one of the custom auth methods
    // The extension should provide:
    //   - 'setCredentials(target, auth)' method which sets the 'auth' credentials into 'target' which is the 'target'/'source' field of the replication doc.
    const authExtensions = FauxtonAPI.getExtensions('Replication:Auth');
    if (authExtensions) {
      authExtensions.filter(ext => ext.typeValue === authType).map(ext => {
        if (ext.setCredentials) {
          ext.setCredentials(target, auth);
        }
      });
    }
  }
};

export const createTarget = (replicationTarget) => {
  if (_.includes([
    Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE,
    Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE],
  replicationTarget)) {
    return true;
  }

  return false;
};

export const continuous = (replicationType) => {
  if (replicationType === Constants.REPLICATION_TYPE.CONTINUOUS) {
    return true;
  }

  return false;
};

export const addDocIdAndRev = (docId, _rev, doc) => {
  if (docId) {
    doc._id = docId;
  }

  if (_rev) {
    doc._rev = _rev;
  }

  return doc;
};

export const createReplicationDoc = ({
  replicationTarget,
  replicationSource,
  replicationType,
  replicationDocName,
  localTarget,
  localSource,
  remoteTarget,
  remoteSource,
  _rev,
  sourceAuthType,
  sourceAuth,
  targetAuthType,
  targetAuth,
  targetDatabasePartitioned
}) => {
  const username = getUsername();
  const replicationDoc = {
    user_ctx: {
      name: username,
      roles: ['_admin', '_reader', '_writer']
    },
    source: getSource({
      replicationSource,
      localSource,
      remoteSource,
      sourceAuthType,
      sourceAuth
    }),
    target: getTarget({
      replicationTarget,
      replicationSource,
      remoteTarget,
      localTarget,
      targetAuthType,
      targetAuth
    }),
    create_target: createTarget(replicationTarget),
    continuous: continuous(replicationType),
  };
  if (targetDatabasePartitioned) {
    replicationDoc.create_target_params = {
      partitioned: true
    };
  }
  return addDocIdAndRev(replicationDocName, _rev, replicationDoc);
};

export const removeSensitiveUrlInfo = (url) => {
  try {
    const urlObj = new URL(url);
    return `${urlObj.origin}/${decodeURIComponent(urlObj.pathname.slice(1))}`;
  } catch (e) {
    return url;
  }
};

export const getDocUrl = (doc) => {
  let url = doc;
  if (!doc) {
    return '';
  }

  if (typeof doc === "object") {
    url = doc.url;
  }
  return removeSensitiveUrlInfo(url);
};

export const parseReplicationDocs = (rows) => {
  return rows.map(row => row.doc).map(doc => {
    return {
      _id: doc._id,
      _rev: doc._rev,
      selected: false, //use this field for bulk delete in the ui
      source: getDocUrl(doc.source),
      target: getDocUrl(doc.target),
      createTarget: doc.create_target,
      continuous: doc.continuous === true ? true : false,
      status: doc._replication_state,
      errorMsg: doc._replication_state_reason ? doc._replication_state_reason : '',
      statusTime: new Date(doc._replication_state_time),
      startTime: new Date(doc._replication_start_time),
      url: `#/database/_replicator/${encodeURIComponent(doc._id)}`,
      raw: doc
    };
  });
};

export const convertState = (state) => {
  if (state.toLowerCase() === 'error' || state.toLowerCase() === 'crashing') {
    return 'retrying';
  }

  return state;
};

export const combineDocsAndScheduler = (docs, schedulerDocs) => {
  return docs.map(doc => {
    const schedule = schedulerDocs.find(s => s.doc_id === doc._id);
    if (!schedule) {
      return doc;
    }

    doc.status = convertState(schedule.state);
    if (schedule.start_time) {
      doc.startTime = new Date(schedule.start_time);
    }

    if (schedule.last_updated) {
      doc.stateTime = new Date(schedule.last_updated);
    }

    return doc;
  });
};

export const fetchReplicationDocs = () => {
  return supportNewApi()
    .then(newApi => {
      const url = Helpers.getServerUrl('/_replicator/_all_docs?include_docs=true&limit=100');
      const docsPromise = get(url)
        .then((res) => {
          if (res.error) {
            return [];
          }

          return parseReplicationDocs(res.rows.filter(row => row.id.indexOf("_design/") === -1));
        });

      if (!newApi) {
        return docsPromise;
      }
      const schedulerPromise = fetchSchedulerDocs();
      return FauxtonAPI.Promise.join(docsPromise, schedulerPromise, (docs, schedulerDocs) => {
        return combineDocsAndScheduler(docs, schedulerDocs);
      })
        .catch(() => {
          return [];
        });
    });
};

export const fetchSchedulerDocs = () => {
  const url = Helpers.getServerUrl('/_scheduler/docs?include_docs=true');
  return get(url)
    .then((res) => {
      if (res.error) {
        return [];
      }

      return res.docs;
    });
};

export const checkReplicationDocID = (docId) => {
  return new Promise((resolve) => {
    const url = Helpers.getServerUrl(`/_replicator/${docId}`);
    get(url)
      .then(resp => {
        if (resp.error === "not_found") {
          resolve(false);
          return;
        }
        resolve(true);
      });
  });
};

export const parseReplicateInfo = (resp) => {
  return resp.jobs.filter(job => job.database === null).map(job => {
    return {
      _id: job.id,
      source: getDocUrl(job.source.slice(0, job.source.length - 1)),
      target: getDocUrl(job.target.slice(0, job.target.length - 1)),
      startTime: new Date(job.start_time),
      statusTime: new Date(job.last_updated),
      //making an asumption here that the first element is the latest
      status: convertState(job.history[0].type),
      errorMsg: '',
      selected: false,
      continuous: /continuous/.test(job.id),
      raw: job
    };
  });
};

export const fetchReplicateInfo = () => {
  return supportNewApi()
    .then(newApi => {
      if (!newApi) {
        return [];
      }

      const url = Helpers.getServerUrl('/_scheduler/jobs');
      return get(url)
        .then(resp => {
          return parseReplicateInfo(resp);
        });
    });
};

export const deleteReplicatesApi = (replicates) => {
  const promises = replicates.map(replicate => {
    const data = {
      replication_id: replicate._id,
      cancel: true
    };
    const url = Helpers.getServerUrl('/_replicate');
    return post(url, data);
  });

  return FauxtonAPI.Promise.all(promises);
};

export const createReplicatorDB = () => {
  const url = Helpers.getServerUrl('/_replicator');
  return put(url)
    .then(res => {
      if (!res.ok) {
        throw {reason: 'Failed to create the _replicator database.'};
      }
      return true;
    });
};
