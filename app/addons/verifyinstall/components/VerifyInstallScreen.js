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
import VerifyInstallButton from './VerifyInstallButton';
import VerifyInstallResults from './VerifyInstallResults';

export default class VerifyInstallScreen extends React.Component {

  constructor(props) {
    super(props);
    this.props.resetTests();
  }

  render() {
    return (
      <div>
        <VerifyInstallButton verify={this.props.startVerification} isVerifying={this.props.isVerifying} />
        <VerifyInstallResults testResults={this.props.testResults} />
      </div>
    );
  }
}
