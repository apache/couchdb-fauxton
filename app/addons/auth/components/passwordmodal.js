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

import React from "react";
import { Modal } from "react-bootstrap";
import { hidePasswordModal, authenticate } from "./../actions";
import Components from "../../components/react-components";
import FauxtonAPI from "../../../core/api";

class PasswordModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: ""
    };
    this.authenticate = this.authenticate.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  // clicking <Enter> should submit the form
  onKeyPress(e) {
    if (e.key === "Enter") {
      this.authenticate();
    }
  }
  // default authentication function. This can be overridden via props if you want to do something different
  authenticate() {
    const username = FauxtonAPI.session.user().name;
    this.props.onSubmit(username, this.state.password, this.props.onSuccess);
  }
  render() {
    const {
      visible,
      onClose,
      submitBtnLabel,
      headerTitle,
      modalMessage
    } = this.props;
    if (!this.props.visible) {
      return null;
    }

    return (
      <Modal
        dialogClassName="enter-password-modal"
        show={visible}
        onHide={() => onClose()}
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>{headerTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMessage}
          <input
            style={{ width: "385px" }}
            type="password"
            className="password-modal-input"
            placeholder="Enter your password"
            autoFocus={true}
            value={this.state.password}
            onChange={e => this.setState({ password: e.target.value })}
            onKeyPress={this.onKeyPress}
          />
        </Modal.Body>
        <Modal.Footer>
          <a className="cancel-link" onClick={() => onClose()}>Cancel</a>
          <Components.ConfirmButton
            text={submitBtnLabel}
            onClick={this.authenticate}
          />
        </Modal.Footer>
      </Modal>
    );
  }
}

PasswordModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  modalMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  submitBtnLabel: PropTypes.string
};

PasswordModal.defaultProps = {
  headerTitle: "Enter Password",
  visible: false,
  modalMessage: "",
  onClose: hidePasswordModal,
  onSubmit: authenticate,
  onSuccess: () => {},
  submitBtnLabel: "Continue"
};

export default PasswordModal;
