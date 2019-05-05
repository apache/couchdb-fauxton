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
import {TransitionMotion, spring} from 'react-motion';
// import GlobalNotifications from './GlobalNotifications';
import NotificationCenterPanel from './NotificationCenterPanel';

// The one-stop-shop for Fauxton notifications. This controller handler the header notifications and the rightmost
// notification center panel
export default class NotificationPanelWithTransition extends React.Component {

  getStyles = () => {
    let item = {
      key: '1',
      style: {
        x: 320
      }
    };

    if (this.props.isVisible) {
      item.style = {
        x: spring(0)
      };
    } else {
      item.style = {
        x: spring(320)
      };
    }
    return [item];
  };

  getNotificationCenterPanel = (items) => {
    const panel = items.map(({style}) => {
      return <NotificationCenterPanel
        key={'1'}
        style={style}
        {...this.props} />;
    });
    return (
      <aside aria-label="Notifications">
        {panel}
      </aside>
    );
  };

  render() {
    return (
      <TransitionMotion
        styles={this.getStyles}>
        {this.getNotificationCenterPanel}
      </TransitionMotion>
    );
  }
}
