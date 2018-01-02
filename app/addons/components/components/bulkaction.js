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
import ReactDOM from "react-dom";
import {OverlayTrigger, Popover} from "react-bootstrap";

export class BulkActionComponent extends React.Component {
  static propTypes = {
    hasSelectedItem: PropTypes.bool.isRequired,
    removeItem: PropTypes.func.isRequired,
    selectAll: PropTypes.func,
    toggleSelect: PropTypes.func.isRequired,
    isChecked: PropTypes.bool.isRequired,
    disabled: PropTypes.bool
  };

  static defaultProps = {
    disabled: false,
    title: 'Select rows that can be...',
    bulkIcon: 'fonticon-trash',
    buttonTitle: 'Delete all selected',
    dropdownContentText: 'Deleted',
    enableOverlay: false
  };

  render() {
    return (
      <div className="bulk-action-component">
        <div className="bulk-action-component-selector-group">
          {this.getMasterSelector()}
          {this.getMultiSelectOptions()}
        </div>
      </div>
    );
  }

  getMultiSelectOptions = () => {
    if (!this.props.hasSelectedItem) {
      return null;
    }

    return (
      <button
        onClick={this.props.removeItem}
        className={'fonticon ' + this.props.bulkIcon}
        title={this.props.buttonTitle} />
    );
  };

  getPopupContent = () => {
    return (
      <ul className="bulk-action-component-popover-actions">
        <li onClick={this.selectAll} >
          <i className="icon fonticon-cancel"></i> {this.props.dropdownContentText}
        </li>
      </ul>
    );
  };

  selectAll = () => {
    this.bulkActionPopover.hide();
    this.props.selectAll();
  };

  getOverlay = () => {
    return (
      <OverlayTrigger
        ref={node => this.bulkActionPopover = node}
        trigger="click"
        placement="bottom"
        rootClose={true}
        overlay={
          <Popover id="bulk-action-component-popover" title={this.props.title}>
            {this.getPopupContent()}
          </Popover>
        }>
        <div className="arrow-button">
          <i className="fonticon fonticon-play"></i>
        </div>
      </OverlayTrigger>
    );
  };

  getMasterSelector = () => {
    return (
      <div className="bulk-action-component-panel">
        <input type="checkbox"
          checked={this.props.isChecked}
          onChange={this.props.toggleSelect}
          disabled={this.props.disabled} />
        {this.props.enableOverlay ? <div className="separator"></div> : null}
        {this.props.enableOverlay ? this.getOverlay() : null}
      </div>
    );
  };
}
