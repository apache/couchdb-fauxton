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

define([
  'app',
  'api',
  'addons/compaction/actiontypes',
  'addons/compaction/resources'
],
function (app, FauxtonAPI, ActionTypes, Compaction) {

  return {

    cleaningViewsStarted: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.COMPACTION_CLEANUP_STARTED
      });
    },

    cleaningViewsFinished: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.COMPACTION_CLEANUP_FINISHED
      });
    },

    cleanupViews: function (database) {
      this.cleaningViewsStarted();
      Compaction.cleanupViews(database).then(function () {
        FauxtonAPI.addNotification({
          type: 'success',
          msg: 'View cleanup has started. Visit <a href="#activetasks">Active Tasks</a> to view progress.',
          escape: false // beware of possible XSS when the message changes
        });
      }, function (xhr, error, reason) {
        FauxtonAPI.addNotification({
          type: 'error',
          msg: 'Error: ' + JSON.parse(xhr.responseText).reason
        });
      }).always(function () {
        this.cleaningViewsFinished();
        this.closeCleanupViewsModal();
      }.bind(this));
    },

    openCleanupViewsModal: function (dbName) {
      FauxtonAPI.dispatch({
        type: ActionTypes.COMPACTION_OPEN_CLEANUP_VIEWS_MODAL,
        options: {
          databaseName: dbName
        }
      });
    },

    closeCleanupViewsModal: function () {
      FauxtonAPI.dispatch({ type: ActionTypes.COMPACTION_CLOSE_CLEANUP_VIEWS_MODAL });
    }

  };

});
