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

import {
  COMPACTION_CLEANUP_FINISHED,
  COMPACTION_CLEANUP_STARTED, COMPACTION_COMPACTION_FINISHED,
  COMPACTION_COMPACTION_STARTING, COMPACTION_VIEW_FINISHED, COMPACTION_VIEW_STARTED
} from "./actiontypes";

import {post} from '../../core/ajax';
import app from '../../app';
import FauxtonAPI from "../../core/api";

export const compactionStarted = () => async dispatch => {
  dispatch({
    type: COMPACTION_COMPACTION_STARTING
  });
};

export const compactionFinished = () => async dispatch => {
  dispatch({
    type: COMPACTION_COMPACTION_FINISHED
  });
};

export const cleaningViewsStarted = () => async dispatch => {
  dispatch({
    type: COMPACTION_CLEANUP_STARTED
  });
};

export const cleaningViewsFinished = () => async dispatch => {
  dispatch({
    type: COMPACTION_CLEANUP_FINISHED
  });
};

export const compactViewStarted = () => async dispatch => {
  dispatch({
    type: COMPACTION_VIEW_STARTED
  });
};

export const compactViewFinished = () => async dispatch => {
  dispatch({
    type: COMPACTION_VIEW_FINISHED
  });
};

export const compactDatabase = databaseName => async dispatch => {
  dispatch(compactionStarted());
  const url = app.host + "/" + databaseName + "/_compact";
  try {
    const json = await post(url);
    if (json.ok) {
      FauxtonAPI.addNotification({
        type: 'success',
        msg: 'Database compaction has started. Visit <a href="#activetasks">Active Tasks</a> to view the compaction progress.',
        escape: false // beware of possible XSS when the message changes
      });
    } else {
      throw new Error(json.reason);
    }
  } catch (error) {
    FauxtonAPI.addNotification({
      msg: 'Database compaction failed - reason: ' + error,
      type: 'error'
    });
  } finally {
    dispatch(compactionFinished());
  }
};

export const cleanupViews = databaseName => async dispatch => {
  dispatch(cleaningViewsStarted());
  const url = app.host + "/" + databaseName + "/_view_cleanup";
  try {
    const json = await post(url);
    if (json.ok) {
      FauxtonAPI.addNotification({
        type: 'success',
        msg: 'View cleanup has started. Visit <a href="#activetasks">Active Tasks</a> to view progress.',
        escape: false // beware of possible XSS when the message changes
      });
    } else {
      throw new Error(json.reason);
    }
  } catch (error) {
    FauxtonAPI.addNotification({
      msg: 'View cleanup failed - reason: ' + error,
      type: 'error'
    });
  } finally {
    dispatch(cleaningViewsFinished());
  }
};

export const compactView = (databaseName, designDocName) => async dispatch => {
  dispatch(compactViewStarted());

  const url = app.host + "/" + databaseName + "/_compact/" + designDocName.replace('_design/', '');
  try {
    const json = await post(url);
    if (json.ok) {
      FauxtonAPI.addNotification({
        type: 'success',
        msg: 'View compaction has started. Visit <a href="#activetasks">Active Tasks</a> to view progress.',
        escape: false // beware of possible XSS when the message changes
      });
    } else {
      throw new Error(json.reason);
    }
  } catch (error) {
    FauxtonAPI.addNotification({
      msg: 'View compaction failed - reason: ' + error,
      type: 'error'
    });
  } finally {
    dispatch(compactViewFinished());
  }
};
