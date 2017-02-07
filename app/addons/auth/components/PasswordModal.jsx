import React from "react";
import { Modal } from "react-bootstrap";
import { hidePasswordModal, authenticate } from "./../actions";
import Components from "../../components/react-components.react";
import app from "../../../app";

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
    const username = app.session.user.name; // yuck. But simplest for now until logging in publishes the user data
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
  visible: React.PropTypes.bool.isRequired,
  modalMessage: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.element
  ]),
  onSubmit: React.PropTypes.func.isRequired,
  onClose: React.PropTypes.func.isRequired,
  submitBtnLabel: React.PropTypes.string
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
