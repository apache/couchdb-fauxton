import PropTypes from 'prop-types';
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

}

OriginTable.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  origins: PropTypes.arrayOf(PropTypes.string),
  updateOrigin: PropTypes.func.isRequired,
  deleteOrigin: PropTypes.func.isRequired
};
