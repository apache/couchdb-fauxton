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

import FauxtonAPI from "../../../core/api";
import ActionTypes from "./actiontypes";
import Stores from "./stores";
var store = Stores.designDocInfoStore;

export default {
  fetchDesignDocInfo ({ddocName, designDocInfo}) {
    FauxtonAPI.dispatch({
      type: ActionTypes.DESIGN_FETCHING
    });

    return designDocInfo.fetch().then(() => {
      this.monitorDesignDoc({
        ddocName,
        designDocInfo
      });
    });
  },

  monitorDesignDoc (options) {
    options.intervalId = window.setInterval(_.bind(this.refresh, this), 5000);
    FauxtonAPI.dispatch({
      type: ActionTypes.DESIGN_DOC_MONITOR,
      options: options
    });
  },

  refresh () {
    store.getDesignDocInfo().fetch().then(() => {
      FauxtonAPI.dispatch({
        type: ActionTypes.DESIGN_REFRESH
      });
    });
  },

  stopRefresh () {
    window.clearInterval(store.getIntervalId());
  }
};
