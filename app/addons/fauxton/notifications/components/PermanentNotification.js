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

export default class PermanentNotification extends React.Component {

  static defaultProps = {
    visible: false
  };

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    message: PropTypes.string
  };

  constructor (props) {
    super(props);
  }

  // many messages contain HTML, hence the need for dangerouslySetInnerHTML
  getMsg () {
    return {__html: this.props.message};
  }

  getContent () {
    return (
      <p className="perma-warning__content" dangerouslySetInnerHTML={this.getMsg()}></p>
    );
  }

  render () {
    if (!this.props.visible || !this.props.message) {
      return null;
    }
    return (
      <div id="perma-warning">
        {this.getContent()}
      </div>
    );
  }
}
