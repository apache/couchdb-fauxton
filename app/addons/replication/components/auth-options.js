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
import FauxtonAPI from '../../../core/api';
import app from '../../../app';
import React from 'react';
import Constants from '../constants';
import Components from '../../components/react-components';

const { StyledSelect } = Components;

export class ReplicationAuth extends React.Component {

  constructor (props) {
    super(props);
    this.onChangeType = this.onChangeType.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);

    // init auth extensions
    // The extension should provide:
    //   - 'inputComponent' a React component that will be displayed when the user selects the auth method.
    //   - 'typeValue' field with an arbitrary ID representing the auth type the extension supports.
    //   - 'typeLabel' field containing the display label for the authentication method.
    this.customAuths = FauxtonAPI.getExtensions('Replication:Auth');
    if (!this.customAuths) {
      this.customAuths = [];
    }
    this.customAuthTypes = this.customAuths.map(auth => auth.typeValue);

    // The extension should provide:
    //   - 'authType' is a string representing the auth type.
    //   - 'helpText' string with the text to be displayed when the auth type is selected.
    this.customAuthHelp = FauxtonAPI.getExtensions('Replication:Auth-help');
    if (!this.customAuthHelp) {
      this.customAuthHelp = [];
    }
  }

  getAuthOptions = () => {
    const userPasswordLabel = app.i18n.en_US['replication-user-password-auth-label'];
    const authOptions = [
      { value: Constants.REPLICATION_AUTH_METHOD.NO_AUTH, label: 'None' },
      { value: Constants.REPLICATION_AUTH_METHOD.BASIC, label: userPasswordLabel }
    ];
    this.customAuths.map(auth => {
      authOptions.push({ value: auth.typeValue, label: auth.typeLabel });
    });

    return authOptions.map(option => <option value={option.value} key={option.value}>{option.label}</option>);
  };

  onChangeType(newType) {
    this.props.onChangeAuthType(newType);
  }

  onChangeValue(newValue) {
    this.props.onChangeAuth(newValue);
  }

  getAuthInputFields(authValue, authType) {
    const {authId} = this.props;
    if (authType == Constants.REPLICATION_AUTH_METHOD.BASIC) {
      return <UserPasswordAuthInput onChange={this.onChangeValue} auth={authValue} authId={authId}/>;
    }
    const matchedAuths = this.customAuths.filter(el => el.typeValue === authType);
    if (matchedAuths && matchedAuths.length > 0) {
      const InputComp = matchedAuths[0].inputComponent;
      return <InputComp onChange={this.onChangeValue} auth={authValue} />;
    }

    return null;
  }

  getHelpText(authType) {
    const helpText = this.customAuthHelp.filter(el => authType === el.authType).map(el => el.helpText);
    if (helpText.length == 0) {
      return null;
    }

    return (
      <div className="replication__section">
        <div className="replication__input-label"></div>
        <div className="replication__help-tile">{helpText[0]}</div>
      </div>);
  }

  render () {
    const {credentials, authType, authId} = this.props;
    return (<React.Fragment>
      <div className="replication__section">
        <div className="replication__input-label">
          Authentication:
        </div>
        <div className="replication__input-select">
          <StyledSelect
            selectContent={this.getAuthOptions()}
            selectChange={(e) => this.onChangeType(e.target.value)}
            selectId={'select-' + authId}
            selectValue={authType} />
        </div>
      </div>
      {this.getAuthInputFields(credentials, authType)}
      {this.getHelpText(authType)}
    </React.Fragment>);
  }
}

ReplicationAuth.propTypes = {
  authId: PropTypes.string.isRequired,
  authType: PropTypes.string.isRequired,
  credentials: PropTypes.object,
  onChangeAuth: PropTypes.func.isRequired,
  onChangeAuthType: PropTypes.func.isRequired
};

ReplicationAuth.defaultProps = {
  authType: Constants.REPLICATION_AUTH_METHOD.NO_AUTH,
  onChangeAuthType: () => {},
  onChangeAuth: () => {}
};

export class UserPasswordAuthInput extends React.Component {

  constructor (props) {
    super(props);
    this.updatePassword = this.updatePassword.bind(this);
    this.updateUsername = this.updateUsername.bind(this);
    this.state = {
      username: props.auth && props.auth.username ? props.auth.username : '',
      password: props.auth && props.auth.password ? props.auth.password : ''
    };
  }

  updatePassword(newValue) {
    this.setState({password: newValue});
    this.props.onChange({
      username: this.state.username,
      password: newValue
    });
  }

  updateUsername(newValue) {
    this.setState({username: newValue});
    this.props.onChange({
      username: newValue,
      password: this.state.password
    });
  }

  render () {
    const usernamePlaceholder = app.i18n.en_US['replication-username-input-placeholder'];
    const passwordPlaceholder = app.i18n.en_US['replication-password-input-placeholder'];
    const { authId } = this.props;
    return (
      <React.Fragment>
        <div className="replication__section">
          <div className="replication__input-label"></div>
          <div>
            <input
              id={authId + '-username'}
              type="text"
              placeholder={usernamePlaceholder}
              value={this.state.username}
              onChange={(e) => this.updateUsername(e.target.value)}
              readOnly={this.props.usernameReadOnly}
            />
          </div>
        </div>
        <div className="replication__section">
          <div className="replication__input-label"></div>
          <div>
            <input
              id={authId + '-password'}
              type="password"
              placeholder={passwordPlaceholder}
              value={this.state.password}
              onChange={(e) => this.updatePassword(e.target.value)}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

UserPasswordAuthInput.propTypes = {
  auth: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};
