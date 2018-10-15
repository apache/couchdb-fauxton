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

import React from 'react';
import Helpers from "../../helpers";
import FauxtonAPI from "../../core/api";
import {OnePane, OnePaneHeader, OnePaneContent} from '../components/layouts';
import ActiveTasksController from "./components/controller";
import ActiveTasksPollingWidgetController from './components/polling';

const crumbs = [
  {'name': 'Active Tasks'}
];

export const ActiveTasksLayout = (props) => {
  return (
    <OnePane>
      <OnePaneHeader
        crumbs={crumbs}
        docURL={FauxtonAPI.constants.DOC_URLS.ACTIVE_TASKS}
        endpoint={Helpers.getApiUrl('/_active_tasks')}
      >
        <ActiveTasksPollingWidgetController {...props} />
      </OnePaneHeader>
      <OnePaneContent>
        <ActiveTasksController {...props} />
      </OnePaneContent>
    </OnePane>
  );
};

export default ActiveTasksLayout;
