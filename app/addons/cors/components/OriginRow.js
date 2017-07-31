import React, { Component } from "react";
import Actions from "../actions";
import { validateOrigin } from "../helpers";


export default class OriginRow extends Component {

  constructor (props) {
    super(props);
  }

  getInitialState() {
    return {
      edit: false,
      updatedOrigin: this.props.origin
    };
  }

  editOrigin(e) {
    e.preventDefault();
    this.setState({ edit: !this.state.edit });
  }

  updateOrigin (e) {
    e.preventDefault();
    if (!validateOrigin(this.state.updatedOrigin)) {
      return;
    }
    this.props.updateOrigin(this.state.updatedOrigin, this.props.origin);
    this.setState({ edit: false });
  }

  deleteOrigin (e) {
    e.preventDefault();
    Actions.showDeleteDomainModal(this.props.origin);
  }

  onInputChange (event) {
    this.setState({ updatedOrigin: event.target.value });
  }

  onKeyUp (e) {
    if (e.keyCode === 13) {   //enter key
      return this.updateOrigin(e);
    }
  }

  createOriginDisplay () {
    if (this.state.edit) {
      return (
        <div className="input-append edit-domain-section">
          <input type="text" name="update_origin_domain" onChange={this.onInputChange} onKeyUp={this.onKeyUp} value={this.state.updatedOrigin} />
          <button onClick={this.updateOrigin} className="btn btn-primary update-origin"> Update </button>
        </div>
      );
    }
    return <div className="js-url url-display">{this.props.origin}</div>;
  }

  render () {
    var display = this.createOriginDisplay();
    return (
      <tr>
        <td>
          {display}
        </td>
        <td width="30">
          <span>
            <a className="fonticon-pencil" onClick={this.editOrigin} title="Edit domain." />
          </span>
        </td>
        <td width="30">
          <span>
            <a href="#" data-bypass="true" className="fonticon-trash" onClick={this.deleteOrigin} title="Delete domain." />
          </span>
        </td>
      </tr>
    );
  }

};
