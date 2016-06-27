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

import FauxtonAPI from "../../core/api";
import ActionTypes from "./actiontypes";

function showAPIBarButton () {
  FauxtonAPI.dispatch({ type: ActionTypes.CMPNTS_SHOW_API_BAR_BUTTON });
}

function hideAPIBarButton () {
  FauxtonAPI.dispatch({ type: ActionTypes.CMPNTS_HIDE_API_BAR_BUTTON });
}

function toggleApiBarVisibility (visible) {
  FauxtonAPI.dispatch({
    type: ActionTypes.CMPNTS_SET_API_BAR_CONTENT_VISIBLE_STATE,
    options: visible
  });
}

function updateAPIBar (params) {
  FauxtonAPI.dispatch({
    type: ActionTypes.CMPNTS_UPDATE_API_BAR,
    options: params
  });
}

function showDeleteDatabaseModal (options) {
  FauxtonAPI.dispatch({
    type: ActionTypes.CMPNTS_DATABASES_SHOWDELETE_MODAL,
    options: options
  });
}

function deleteDatabase (dbId) {
  var url = FauxtonAPI.urls('databaseBaseURL', 'server', dbId, '');

  $.ajax({
    url: url,
    dataType: 'json',
    type: 'DELETE'
  }).then(function () {
    this.showDeleteDatabaseModal({ showModal: true });

    FauxtonAPI.addNotification({
      msg: 'The database <code>' + _.escape(dbId) + '</code> has been deleted.',
      clear: true,
      escape: false // beware of possible XSS when the message changes
    });

    Backbone.history.loadUrl(FauxtonAPI.urls('allDBs', 'app'));

  }.bind(this)).fail(function (rsp, error, msg) {
    FauxtonAPI.addNotification({
      msg: 'Could not delete the database, reason ' + msg + '.',
      type: 'error',
      clear: true
    });
  });
}


export default {
  deleteDatabase: deleteDatabase,
  showDeleteDatabaseModal: showDeleteDatabaseModal,
  showAPIBarButton: showAPIBarButton,
  hideAPIBarButton: hideAPIBarButton,
  toggleApiBarVisibility: toggleApiBarVisibility,
  updateAPIBar: updateAPIBar,
};
