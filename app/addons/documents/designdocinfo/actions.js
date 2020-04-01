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

import FauxtonAPI from '../../../core/api';
import ActionTypes from "./actiontypes";

const fetchDesignDocInfo = ({designDocName, designDocInfo}) => (dispatch) => {
  dispatch({
    type: ActionTypes.DESIGN_FETCHING
  });

  return designDocInfo.fetch().then(() => {
    monitorDesignDoc({
      designDocName,
      designDocInfo
    }, dispatch);
  }).catch(() => {
    dispatch({
      type: ActionTypes.DESIGN_FETCHING_FAILED
    });
    FauxtonAPI.addNotification({
      msg: 'Error loading design document metadata.',
      type: 'error',
      clear: true
    });
  });
};

let intervalId;
const monitorDesignDoc = (options, dispatch) => {
  const refreshDDoc = () => {
    refresh(options.designDocInfo, dispatch);
  };
  stopRefresh();
  intervalId = window.setInterval(refreshDDoc, 5000);
  dispatch({
    type: ActionTypes.DESIGN_DOC_MONITOR,
    options: options
  });
};

const refresh = (designDocInfo, dispatch) => {
  designDocInfo.fetch().then(() => {
    dispatch({
      type: ActionTypes.DESIGN_REFRESH,
      designDocInfo
    });
  });
};

const stopRefresh = () => {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = undefined;
  }
};

export default {
  fetchDesignDocInfo,
  stopRefresh
};
