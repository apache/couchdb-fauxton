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
import Constants from '../constants';
import { Table } from 'react-bootstrap';

export default class VerifyInstallResults extends React.Component {
  static propTypes = {
    testResults: PropTypes.object.isRequired,
    isVerifying: PropTypes.bool.isRequired,
  };

  showTestResult = (test) => {
    const {testResults, isVerifying} = this.props;
    if (!testResults[test].complete) {
      if (isVerifying) {
        return 'In-progress...';
      }
      return '';
    }
    if (this.props.testResults[test].success) {
      return <span className="install-result-success">&#10003; success</span>;
    }
    return <span className="install-result-failure">&#x2717; failure</span>;
  };

  render() {
    return (
      <Table striped>
        <thead>
          <tr>
            <th className='verify-test-col'>Test</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Create Database</td>
            <td id="js-test-create-db">{this.showTestResult(Constants.TESTS.CREATE_DATABASE)}</td>
          </tr>
          <tr>
            <td>Create Document</td>
            <td id="js-test-create-doc">{this.showTestResult(Constants.TESTS.CREATE_DOCUMENT)}</td>
          </tr>
          <tr>
            <td>Update Document</td>
            <td id="js-test-update-doc">{this.showTestResult(Constants.TESTS.UPDATE_DOCUMENT)}</td>
          </tr>
          <tr>
            <td>Delete Document</td>
            <td id="js-test-delete-doc">{this.showTestResult(Constants.TESTS.DELETE_DOCUMENT)}</td>
          </tr>
          <tr>
            <td>Create View</td>
            <td id="js-test-create-view">{this.showTestResult(Constants.TESTS.CREATE_VIEW)}</td>
          </tr>
          <tr>
            <td>Replication</td>
            <td id="js-test-replication">{this.showTestResult(Constants.TESTS.REPLICATION)}</td>
          </tr>
        </tbody>
      </Table>
    );
  }
}
