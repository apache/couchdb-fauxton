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
import { connect } from 'react-redux';
import { showNotificationCenter } from '../actions';

class ShowPanelButton extends React.Component {

  static propTypes = {
    onClick: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired
  };

  render() {
    const classes = 'fonticon fonticon-bell' + ((!this.props.visible) ? ' hide' : '');
    return (
      <div className={classes} onClick={this.props.onClick}></div>
    );
  }
}

const mapStateToProps = ({ notifications }) => {
  return {
    visible: !notifications.notificationCenterVisible
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onClick: () => {
      dispatch(showNotificationCenter());
    }
  };
};

const NotificationCenterButton = connect(
  mapStateToProps,
  mapDispatchToProps
)(ShowPanelButton);

export default NotificationCenterButton;



