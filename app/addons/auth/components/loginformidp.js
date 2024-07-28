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

import FauxtonAPI from '../../../core/base';
import React from 'react';
import { loginidp } from './../actions';
import { Button, Form } from 'react-bootstrap';

class LoginFormIdp extends React.Component {
  constructor() {
    super();
    this.state = {
      idpurl: localStorage.getItem('FauxtonIdpurl') || '',
      idpcallback: localStorage.getItem('FauxtonIdpcallback') || '',
      idpappid: localStorage.getItem('FauxtonIdpappid') || ''
    };
  }

  onIdpurlChange(e) {
    this.setState({ idpurl: e.target.value });
  }
  onIdpcallbackChange(e) {
    this.setState({ idpcallback: e.target.value });
  }

  onIdpappidChange(e) {
    this.setState({ idpappid: e.target.value });
  }

  submit(e) {
    e.preventDefault();
    if (!this.checkUnrecognizedAutoFill()) {
      this.login(this.state.idpurl, this.state.idpcallback, this.state.idpappid);
    }
  }

  // Safari has a bug where autofill doesn't trigger a change event. This checks for the condition where the state
  // and form fields have a mismatch. See: https://issues.apache.org/jira/browse/COUCHDB-2829
  checkUnrecognizedAutoFill() {
    if (this.state.idpurl !== '' || this.state.idpcallback !== '' || this.state.idpappid !== '') {
      return false;
    }
    let idpurl = this.props.testBlankIdpurl ? this.props.testBlankIdpurl : this.idpurlField.value;
    let idpcallback = this.props.testBlankIdpcallback ? this.props.testBlankIdpcallback : this.idpcallbackField.value;
    let idpappid = this.props.testBlankIdpappid ? this.props.testBlankIdpappid : this.idpappidField.value;

    this.setState({ idpurl: idpurl, idpcallback: idpcallback, idpappid: idpappid }); // doesn't set immediately, hence separate login() call
    this.login(idpurl, idpcallback, idpappid);

    return true;
  }

  login(idpurl, idpcallback, idpappid) {
    localStorage.setItem('FauxtonIdpurl', idpurl);
    localStorage.setItem('FauxtonIdpcallback', idpcallback);
    localStorage.setItem('FauxtonIdpappid', idpappid);
    loginidp(idpurl, idpcallback, idpappid);
  }

  navigateToLogin(e) {
    e.preventDefault();
    FauxtonAPI.navigate('/login');
  }

  render() {
    return (
      <div className="couch-login-wrapper">
        <form id="login" onSubmit={this.submit.bind(this)}>
          <div className="row">
            <div className="col12 col-md-5 col-xl-4 mb-3">
              <label htmlFor="idpurl">Enter your IdP information</label>
              <Form.Control
                type="text"
                id="idpurl"
                name="idpurl"
                ref={(node) => (this.idpurlField = node)}
                placeholder="IdP URL"
                onChange={this.onIdpurlChange.bind(this)}
                value={this.state.idpurl}
              />
            </div>
          </div>
          <div className="row">
            <div className="col12 col-md-5 col-xl-4 mb-3">
              <Form.Control
                type="text"
                id="idpcallback"
                name="idpcallback"
                ref={(node) => (this.idpcallbackField = node)}
                placeholder="Callback URL"
                onChange={this.onIdpcallbackChange.bind(this)}
                value={this.state.idpcallback}
              />
            </div>
          </div>
          <div className="row">
            <div className="col12 col-md-5 col-xl-4 mb-3">
              <Form.Control
                type="text"
                id="idpappid"
                name="idpappid"
                ref={(node) => (this.idpappidField = node)}
                placeholder="Applicaiton ID"
                onChange={this.onIdpappidChange.bind(this)}
                value={this.state.idpappid}
              />
            </div>
          </div>
          <div className="row">
            <div className="col12 col-md-5 col-xl-4 mb-3">
              <Button id="login-btn" variant="cf-primary" type="submit">
                Log In
              </Button>
            </div>
          </div>
        </form>
        <div className="row">
          <div className="col12 col-md-5 col-xl-4 mb-3">
            <Button id="login-creds-btn" variant="cf-secondary" onClick={this.navigateToLogin}>
              Log In with CouchDB Credentials
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginFormIdp;
