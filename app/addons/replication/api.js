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

import 'url-polyfill';
import Constants from './constants';
import FauxtonAPI from '../../core/api';
import base64 from 'base-64';
import _ from 'lodash';
import 'whatwg-fetch';

let newApiPromise = null;
export const supportNewApi = (forceCheck) => {
  if (!newApiPromise || forceCheck) {
    newApiPromise = new FauxtonAPI.Promise((resolve) => {
      fetch('/_scheduler/jobs', {
        credentials: 'include',
        headers: {
            'Accept': 'application/json; charset=utf-8',
          }
        })
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
  username,
  password
},
{origin} = window.location) => {
  let url;
  let headers;
  if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
    url = `${origin}/${localSource}`;
    headers = getAuthHeaders(username, password);
  } else {
    const credentials = getCredentialsFromUrl(remoteSource);
    headers = getAuthHeaders(credentials.username, credentials.password);
    url = removeCredentialsFromUrl(remoteSource);
  }

  return {
    headers,
    url: encodeFullUrl(url)
  };
};

export const getTarget = ({
  replicationTarget,
  localTarget,
  remoteTarget,
  replicationSource,
  username,
  password
},
{origin} = window.location //this allows us to mock out window.location for our tests
) => {

  const encodedLocalTarget = encodeURIComponent(localTarget);
  let headers = getAuthHeaders(username, password);
  let target = `${origin}/${encodedLocalTarget}`;

  if (replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
        replicationTarget === Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE) {

    const credentials = getCredentialsFromUrl(remoteTarget);
    target = encodeFullUrl(removeCredentialsFromUrl(remoteTarget));
    headers = getAuthHeaders(credentials.username, credentials.password);
  }

  return {
    headers: headers,
    url: target
  };
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
  password,
  localTarget,
  localSource,
  remoteTarget,
  remoteSource,
  _rev
}) => {
  const username = getUsername();
  return addDocIdAndRev(replicationDocName, _rev, {
    user_ctx: {
      name: username,
      roles: ['_admin', '_reader', '_writer']
    },
    source: getSource({
      replicationSource,
      localSource,
      remoteSource,
      username,
      password
    }),
    target: getTarget({
      replicationTarget,
      replicationSource,
      remoteTarget,
      localTarget,
      username,
      password
    }),
    create_target: createTarget(replicationTarget),
    continuous: continuous(replicationType),
  });
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
    const docsPromise = fetch('/_replicator/_all_docs?include_docs=true&limit=100', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json; charset=utf-8',
      }
    })
    .then(res => res.json())
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
  return fetch('/_scheduler/docs?include_docs=true', {
    credentials: 'include',
    headers: {
      'Accept': 'application/json; charset=utf-8',
    }
  })
  .then(res => res.json())
  .then((res) => {
    if (res.error) {
      return [];
    }

    return res.docs;
  });
};

export const checkReplicationDocID = (docId) => {
  const promise = FauxtonAPI.Deferred();
  fetch(`/_replicator/${docId}`, {
    credentials: 'include',
    headers: {
      'Accept': 'application/json; charset=utf-8'
    },
  }).then(resp => {
    if (resp.statusText === "Object Not Found") {
      promise.resolve(false);
      return;
    }
    promise.resolve(true);
  });
  return promise;
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

    return fetch('/_scheduler/jobs', {
      credentials: 'include',
      headers: {
        'Accept': 'application/json; charset=utf-8'
      },
    })
    .then(resp => resp.json())
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

    return fetch('/_replicate', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json; charset=utf-8',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(resp => resp.json());
  });

  return FauxtonAPI.Promise.all(promises);
};

export const createReplicatorDB = () => {
  return fetch('/_replicator', {
    method: 'PUT',
    credentials: 'include',
    headers: {
        'Accept': 'application/json; charset=utf-8',
      }
    })
    .then(res => {
      if (!res.ok) {
        throw {reason: 'Failed to create the _replicator database.'};
      }

      return res.json();
    })
    .then(() => {
      return true;
    });
};
