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

import { deleteRequest } from '../../core/ajax';
import FauxtonAPI from '../../core/api';
import ActionTypes from './actiontypes';

function showDeleteDatabaseModal (options) {
  FauxtonAPI.dispatch({
    type: ActionTypes.CMPNTS_DATABASES_SHOWDELETE_MODAL,
    options: options
  });
}

function deleteDatabase (dbId, onDeleteSuccess) {
  const url = FauxtonAPI.urls('databaseBaseURL', 'server', dbId, '');

  deleteRequest(url).then(resp => {
    if (!resp.ok) {
      const msg = resp.reason || '';
      throw new Error(msg);
    }
    this.showDeleteDatabaseModal({ showModal: true });

    FauxtonAPI.addNotification({
      msg: 'The database <code>' + _.escape(dbId) + '</code> has been deleted.',
      clear: true,
      escape: false // beware of possible XSS when the message changes
    });

    Backbone.history.loadUrl(FauxtonAPI.urls('allDBs', 'app'));
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  }).catch(err => {
    FauxtonAPI.addNotification({
      msg: 'Could not delete the database. ' + err.message,
      type: 'error',
      clear: true
    });
  });
}


export default {
  deleteDatabase: deleteDatabase,
  showDeleteDatabaseModal: showDeleteDatabaseModal
};
