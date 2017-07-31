import React, { Component } from "react";

export default class OriginRow extends Component {

  constructor (props) {
    super(props);
  }

  createRows () {
    return _.map(this.props.origins, function (origin, i) {
      return <OriginRow
        updateOrigin={this.props.updateOrigin}
        key={i} origin={origin} />;
    }, this);
  }

  render () {
    if (!this.props.origins) {
      return null;
    }

    if (!this.props.isVisible || this.props.origins.length === 0) {
      return null;
    }

    var origins = this.createRows();

    return (
      <table id="origin-domain-table" className="table table-striped">
        <tbody>
          {origins}
        </tbody>
      </table>
    );
  }

};
