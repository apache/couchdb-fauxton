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

import PropTypes from 'prop-types';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import Components from '../../../components/react-components';
const {Copy} = Components;

export default class NotificationPanelRow extends React.Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    filter: PropTypes.string.isRequired,
    clearSingleNotification: PropTypes.func.isRequired
  };

  clearNotification = () => {
    const {toastId} = this.props.item;
    this.props.clearSingleNotification(toastId);
  };

  render() {
    const iconMap = {
      success: 'fonticon-ok-circled',
      error: 'fonticon-attention-circled',
      info: 'fonticon-info-circled'
    };

    const timeElapsed = this.props.item.time.fromNow();

    // we can safely do this because the store ensures all notifications are of known types
    const rowIconClasses = 'fonticon ' + iconMap[this.props.item.type];
    const hidden = (this.props.filter === 'all' || this.props.filter === this.props.item.type) ? false : true;
    const {style} = this.props;
    const {opacity, height} = style;
    if (opacity === 0 && height === 0) {
      return null;
    }
    // N.B. wrapper <div> needed to ensure smooth hide/show transitions
    return (
      <li style={{opactiy: opacity, height: height + 'px', borderBottomColor: `rgba(34, 34, 34, ${opacity})`}} aria-hidden={hidden}>
        <div className="flex-layout flex-row">
          <span className={rowIconClasses}></span>
          <div className="flex-body">
            <p>{this.props.item.cleanMsg}</p>
            <div className="notification-actions">
              <span className="time-elapsed">{timeElapsed}</span>
              <span className="divider">|</span>
              <Copy uniqueKey={uuidv4()} text={this.props.item.cleanMsg} displayType="text" />
            </div>
          </div>
          <button type="button" onClick={this.clearNotification}>×</button>
        </div>
      </li>
    );
  }
}
