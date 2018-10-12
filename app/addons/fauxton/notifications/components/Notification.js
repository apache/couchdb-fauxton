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

export default class Notification extends React.Component {
  static propTypes = {
    notificationId: PropTypes.string.isRequired,
    msg: PropTypes.string.isRequired,
    onStartHide: PropTypes.func.isRequired,
    onHideComplete: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['error', 'info', 'success']),
    escape: PropTypes.bool,
    isHiding: PropTypes.bool.isRequired,
    visibleTime: PropTypes.number
  };

  static defaultProps = {
    type: 'info',
    visibleTime: 8000,
    escape: true
  };

  componentWillUnmount() {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
  }

  componentDidMount() {
    this.timeout = setTimeout(this.hide, this.props.visibleTime);
  }

  hide = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onStartHide(this.props.notificationId);
  };

  // many messages contain HTML, hence the need for dangerouslySetInnerHTML
  getMsg = () => {
    var msg = (this.props.escape) ? _.escape(this.props.msg) : this.props.msg;
    return {
      __html: msg
    };
  };

  onAnimationComplete = () => {
    if (this.props.isHiding) {
      window.setTimeout(() => this.props.onHideComplete(this.props.notificationId));
    }
  };

  render() {
    const {style, notificationId} = this.props;
    const iconMap = {
      error: 'fonticon-attention-circled',
      info: 'fonticon-info-circled',
      success: 'fonticon-ok-circled'
    };

    if (style.opacity === 0 && this.props.isHiding) {
      this.onAnimationComplete();
    }

    return (
      <div
        key={notificationId.toString()} className="notification-wrapper" style={{opacity: style.opacity, minHeight: style.minHeight + 'px'}}>
        <div
          style={{opacity: style.opacity, minHeight: style.minHeight + 'px'}}
          className={'global-notification alert alert-' + this.props.type}
          ref={node => this.notification = node}>
          <a data-bypass href="#" onClick={this.hide}><i className="pull-right fonticon-cancel" /></a>
          <i className={'notification-icon ' + iconMap[this.props.type]} />
          <span dangerouslySetInnerHTML={this.getMsg()}></span>
        </div>
      </div>
    );
  }
}
