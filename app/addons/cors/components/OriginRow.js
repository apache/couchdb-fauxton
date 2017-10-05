import PropTypes from 'prop-types';
import React, { Component } from "react";
import { validateDomain } from "../helpers";


export default class OriginRow extends Component {

  constructor (props) {
    super(props);
    this.state = {
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
    if (!validateDomain(this.state.updatedOrigin)) {
      return;
    }

    if (this.state.updatedOrigin && this.props.origin !== this.state.updatedOrigin) {
      this.props.updateOrigin(this.state.updatedOrigin, this.props.origin);
    }
    this.setState({ edit: false });
  }

  deleteOrigin (e) {
    e.preventDefault();
    this.props.deleteOrigin(this.props.origin);
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
          <input type="text" name="update_origin_domain" onChange={ this.onInputChange.bind(this) } onKeyUp={ this.onKeyUp.bind(this) } value={this.state.updatedOrigin} />
          <button onClick={ this.updateOrigin.bind(this) } className="btn btn-primary update-origin"> Update </button>
        </div>
      );
    }
    return <div className="js-url url-display">{this.props.origin}</div>;
  }

  render () {
    const display = this.createOriginDisplay();
    return (
      <tr>
        <td>
          {display}
        </td>
        <td width="30">
          <span>
            <a className="fonticon-pencil" onClick={ this.editOrigin.bind(this) } title="Edit domain." />
          </span>
        </td>
        <td width="30">
          <span>
            <a href="#" data-bypass="true" className="fonticon-trash" onClick={ this.deleteOrigin.bind(this) } title="Delete domain." />
          </span>
        </td>
      </tr>
    );
  }

}

OriginRow.propTypes = {
  origin: PropTypes.string.isRequired,
  updateOrigin: PropTypes.func.isRequired,
  deleteOrigin: PropTypes.func.isRequired
};
