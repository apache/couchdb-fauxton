import React, { Component } from "react";
import OriginRow from "./OriginRow";

export default class OriginTable extends Component {

  constructor (props) {
    super(props);
  }

  createRows () {
    return this.props.origins.map((origin, i) => {
      return <OriginRow
        updateOrigin={this.props.updateOrigin}
        deleteOrigin={this.props.deleteOrigin}
        key={i} origin={origin} />;
    });
  }

  render () {
    const {origins, isVisible} = this.props;

    if (!origins) {
      return null;
    }

    if (!isVisible || origins.length === 0) {
      return null;
    }

    const originRows = this.createRows();

    return (
      <table id="origin-domain-table" className="table table-striped">
        <tbody>
          {originRows}
        </tbody>
      </table>
    );
  }

};

OriginTable.propTypes = {
  isVisible: React.PropTypes.bool.isRequired,
  origins: React.PropTypes.arrayOf(React.PropTypes.string),
  updateOrigin: React.PropTypes.func.isRequired,
  deleteOrigin: React.PropTypes.func.isRequired
};
