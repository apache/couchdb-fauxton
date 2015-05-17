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
    setCompactionFor: function (database) {
      FauxtonAPI.dispatch({
        type: ActionTypes.COMPACTION_SET_UP,
        database: database
      });

    },

    compactionStarted: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.COMPACTION_COMPACTION_STARTING
      });
    },

    compactionFinished: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.COMPACTION_COMPACTION_FINISHED
      });
    },

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

    compactViewStarted: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.COMPACTION_VIEW_STARTED
      });
    },

    compactViewFinished: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.COMPACTION_VIEW_FINISHED
      });
    },

    compactDatabase: function (database) {
      this.compactionStarted();
      Compaction.compactDB(database).then(function () {
        FauxtonAPI.addNotification({
          type: 'success',
          msg: 'Database compaction has started. Visit <a href="#activetasks">Active Tasks</a> to view the compaction progress.',
          escape: false // beware of possible XSS when the message changes
        });
      }, function (xhr, error, reason) {
        FauxtonAPI.addNotification({
          type: 'error',
          msg: 'Error: ' + JSON.parse(xhr.responseText).reason
        });
      }).always(function () {
        this.compactionFinished();
      }.bind(this));
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
      }.bind(this));
    },

    compactView: function (database, designDoc) {
      this.compactViewStarted();

      Compaction.compactView(database, designDoc).then(function () {
        FauxtonAPI.addNotification({
          type: 'success',
          msg: 'View compaction has started. Visit <a href="#activetasks">Active Tasks</a> to view progress.',
          escape: false // beware of possible XSS when the message changes
        });
      }, function (xhr, error, reason) {
        FauxtonAPI.addNotification({
          type: 'error',
          msg: 'Error: ' + JSON.parse(xhr.responseText).reason
        });
      }).always(function () {
        this.compactViewFinished();
      }.bind(this));
    }

  };

});
