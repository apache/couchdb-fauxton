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
import Helpers from '../../../helpers';
import Components from "../../components/react-components";
const { Polling } = Components;

export default class ActiveTasksPollingWidgetController extends React.Component {

  runPollingUpdate = () => {
    this.props.runPollingUpdate();
  };

  getPluralForLabel = () => {
    return this.state.pollingInterval === "1" ? '' : 's';
  };


  render() {
    let activePollingClass = "active-tasks__polling-wrapper";
    if (Helpers.isIE1X()) {
      activePollingClass += " " + activePollingClass + "--ie1X";
    }
    return (
      <div className={activePollingClass}>
        <Polling
          min={1}
          max={30}
          stepSize={1}
          startValue={15}
          valueUnits={"second"}
          onPoll={this.runPollingUpdate}
        />
      </div>
    );
  }
}

