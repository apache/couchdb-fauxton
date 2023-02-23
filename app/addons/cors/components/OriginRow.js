import PropTypes from 'prop-types';
import React, { Component } from "react";
import { Button, Form, InputGroup } from 'react-bootstrap';
import { validateDomain } from "../helpers";
import ReactComponents from '../../components/react-components';

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
        <InputGroup>
          <Form.Control
            name="update_origin_domain"
            onChange={ this.onInputChange.bind(this) }
            onKeyUp={ this.onKeyUp.bind(this) }
            value={this.state.updatedOrigin}
            aria-label="Edit domain name"
          />
          <Button variant="cf-primary" onClick={ this.updateOrigin.bind(this) }>Update</Button>
        </InputGroup>

      );
    }
    return <div>{this.props.origin}</div>;
  }

  render () {
    const display = this.createOriginDisplay();
    return (
      <tr>
        <td>
          {display}
        </td>
        <td className="action-btn-col">
          <ReactComponents.ToolbarButton icon="fonticon-pencil" onClick={ this.editOrigin.bind(this) } aria-label="Edit domain"/>
        </td>
        <td className="action-btn-col">
          <ReactComponents.ToolbarButton icon="fonticon-trash" onClick={ this.deleteOrigin.bind(this) } aria-label="Delete domain"/>
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
