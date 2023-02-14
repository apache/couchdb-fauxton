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
import {Button} from 'react-bootstrap';

export default class VerifyInstallButton extends React.Component {
  static propTypes = {
    verify: PropTypes.func.isRequired,
    isVerifying: PropTypes.bool.isRequired
  };

  render() {
    return (
      <Button id="start" onClick={this.props.verify} disabled={this.props.isVerifying}>
        {this.props.isVerifying ? 'Verifying...' : 'Verify Installation'}
      </Button>
    );
  }
}
