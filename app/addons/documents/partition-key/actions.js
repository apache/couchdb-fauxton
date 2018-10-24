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

import * as DatabasesAPI from '../../databases/api';
import ActionTypes from './actiontypes';

export const checkDbPartitioned = (databaseName) => (dispatch) => {
  //Reset visibility to false
  dispatch({
    type: ActionTypes.PARTITON_KEY_HIDE_SELECTOR
  });

  DatabasesAPI.fetchDatabaseInfo(databaseName).then(dbInfo => {
    if (dbInfo.props && dbInfo.props.partitioned === true) {
      dispatch({
        type: ActionTypes.PARTITON_KEY_SHOW_SELECTOR
      });
    }
  });
};
