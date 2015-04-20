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

define([
  'app',
  'api',
  'react',
  'addons/verifyinstall/constants',
  'addons/verifyinstall/resources',
  'addons/verifyinstall/actions',
  'addons/verifyinstall/stores'
],
function (app, FauxtonAPI, React, Constants, VerifyInstall, Actions, Stores) {

  var store = Stores.verifyInstallStore;


  var VerifyInstallController = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        isVerifying: store.checkIsVerifying(),
        testResults: store.getTestResults()
      };
    },

    startVerification: function () {
      Actions.startVerification();
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      store.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      store.off('change', this.onChange);
    },

    render: function () {
      return (
        <div>
          <VerifyInstallButton verify={this.startVerification} isVerifying={this.state.isVerifying} />
          <VerifyInstallResults testResults={this.state.testResults} />
        </div>
      );
    }
  });


  var VerifyInstallButton = React.createClass({
    propTypes: {
      verify: React.PropTypes.func.isRequired,
      isVerifying: React.PropTypes.bool.isRequired
    },

    render: function () {
      return (
        <button id="start" className="btn btn-large btn-success" onClick={this.props.verify} disabled={this.props.isVerifying}>
          {this.props.isVerifying ? 'Verifying' : 'Verify Installation'}
        </button>
      );
    }
  });


  var VerifyInstallResults = React.createClass({
    propTypes: {
      testResults: React.PropTypes.object.isRequired
    },

    showTestResult: function (test) {
      if (!this.props.testResults[test].complete) {
        return '';
      }
      if (this.props.testResults[test].success) {
        return <span>&#10003;</span>;
      }
      return <span>&#x2717;</span>;
    },

    render: function () {
      return (
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Test</th>
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
        </table>
      );
    }
  });

  return {
    VerifyInstallController: VerifyInstallController,
    VerifyInstallButton: VerifyInstallButton,
    VerifyInstallResults: VerifyInstallResults
  };

});
