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

import Constants from './constants';
import app from '../../app';
import FauxtonAPI from '../../core/api';
import base64 from 'base-64';
import _ from 'lodash';

export const encodeFullUrl = (fullUrl) => {
  if (!fullUrl) {return '';}
  const url = new URL(fullUrl);
  if (url.username && url.password) {
    return `${url.protocol}//${url.username}:${url.password}@${url.hostname}/${encodeURIComponent(url.pathname.slice(1))}`;
  }
  return `${url.origin}/${encodeURIComponent(url.pathname.slice(1))}`;
};

export const decodeFullUrl = (fullUrl) => {
  if (!fullUrl) {return '';}
  const url = new URL(fullUrl);
  if (url.username && url.password) {
    return `${url.protocol}//${url.username}:${url.password}@${url.hostname}/${decodeURIComponent(url.pathname.slice(1))}`;
  }

  return `${url.origin}/${decodeURIComponent(url.pathname.slice(1))}`;
};

export const getUsername = () => {
  return app.session.get('userCtx').name;
};

export const getAuthHeaders = (username, password) => {
  return {
    'Authorization': 'Basic ' + base64.encode(username + ':' + password)
  };
};

export const getSource = ({replicationSource, localSource, remoteSource, username, password}) => {
  if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
    return {
      headers: getAuthHeaders(username, password),
      url: `${window.location.origin}/${encodeURIComponent(localSource)}`
    };
  } else {
    return encodeFullUrl(remoteSource);
  }
};

export const getTarget = ({replicationTarget, localTarget, remoteTarget, replicationSource, username, password}) => {
  let target = encodeFullUrl(remoteTarget);
  const encodedLocalTarget = encodeURIComponent(localTarget);
  const headers = getAuthHeaders(username, password);

  if (replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE) {
    target = {
      headers: headers,
      url: `${window.location.origin}/${encodedLocalTarget}`
    };
  } else if (replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE) {

    // check to see if we really need to send headers here or can just do the ELSE clause in all scenarioe
    if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL) {
      target = {
        headers: headers,
        url: `${window.location.origin}/${encodedLocalTarget}`
      };
    } else {
      const port = window.location.port === '' ? '' : ':' + window.location.port;
      target = `${window.location.protocol}//${username}:${password}@${window.location.hostname}${port}/${encodedLocalTarget}`;
    }
  }

  return target;
};

export const createTarget = (replicationTarget) => {
  if (_.contains([
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

const removeSensitiveUrlInfo = (url) => {
  const urlObj = new URL(url);
  return `${urlObj.origin}/${decodeURIComponent(urlObj.pathname.slice(1))}`;
};

export const getDocUrl = (doc) => {
  let url = doc;

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
      url: `#/database/_replicator/${app.utils.getSafeIdForDoc(doc._id)}`,
      raw: doc
    };
  });
};

export const fetchReplicationDocs = () => {
  return $.ajax({
    type: 'GET',
    url: '/_replicator/_all_docs?include_docs=true&limit=100',
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
  }).then((res) => {
    return parseReplicationDocs(res.rows.filter(row => row.id.indexOf("_design/_replicator") === -1));
  });
};

export const checkReplicationDocID = (docId) => {
  const promise = FauxtonAPI.Deferred();
  $.ajax({
    type: 'GET',
    url: `/_replicator/${docId}`,
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
  }).then(() => {
    promise.resolve(true);
  }, function (xhr) {
    if (xhr.statusText === "Object Not Found") {
      promise.resolve(false);
      return;
    }
    promise.resolve(true);
  });
  return promise;
};
