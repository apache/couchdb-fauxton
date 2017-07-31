import React, { Component } from "react";

export default class OriginInput extends Component {

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
        <label className="radio">
          <input type="radio" checked={this.props.isAllOrigins} value="all" onChange={this.onOriginChange} name="all-domains"/> All domains ( * )
        </label>
        <label className="radio">
          <input type="radio" checked={!this.props.isAllOrigins} value="selected" onChange={this.onOriginChange} name="selected-domains"/> Restrict to specific domains
        </label>
      </div>
    );
  }
};
