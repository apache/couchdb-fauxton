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


function initReplicator (sourceDatabase) {
  if (sourceDatabase) {
    FauxtonAPI.dispatch({
      type: ActionTypes.INIT_REPLICATION,
      options: {
        sourceDatabase: sourceDatabase
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
  const promise = $.ajax({
    url: window.location.origin + '/_replicator',
    contentType: 'application/json',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify(params)
  });

  const source = Helpers.getDatabaseLabel(params.source);
  const target = Helpers.getDatabaseLabel(params.target);

  promise.then(() => {
    FauxtonAPI.addNotification({
      msg: 'Replication from <code>' + source + '</code> to <code>' + target + '</code> has begun.',
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


export default {
  initReplicator,
  replicate,
  updateFormField,
  clearReplicationForm
};
