import PropTypes from 'prop-types';
import React, { Component } from "react";
import { Form } from 'react-bootstrap';

export default class Origins extends Component {

  constructor (props) {
    super(props);
  }

  onOriginChange (event) {
    if (event.target.value === 'all' && this.props.isAllOrigins) {
      return;   // do nothing if all origins is already selected
    }
    if (event.target.value === 'selected' && !this.props.isAllOrigins) {
      return;   // do nothing if specific origins is already selected
    }

    this.props.originChange(event.target.value === 'all');
  }

  render () {

    if (!this.props.corsEnabled) {
      return null;
    }

    return (
      <div>
        <p><strong> Origin Domains </strong> </p>
        <p>Databases will accept requests from these domains: </p>
        <Form.Check
          type="radio"
          value="all"
          label="All domains ( * )"
          checked={this.props.isAllOrigins}
          onChange={ this.onOriginChange.bind(this) }
        />
        <Form.Check
          type="radio"
          value="selected"
          label="Restrict to specific domains"
          checked={!this.props.isAllOrigins}
          onChange={ this.onOriginChange.bind(this) }
        />
      </div>
    );
  }
}

Origins.propTypes = {
  corsEnabled: PropTypes.bool,
  isAllOrigins: PropTypes.bool,
  originChange: PropTypes.func.isRequired
};
