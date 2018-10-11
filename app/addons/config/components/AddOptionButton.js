//  Licensed under the Apache License, Version 2.0 (the "License"); you may not
//  use this file except in compliance with the License. You may obtain a copy of
//  the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
//  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
//  License for the specific language governing permissions and limitations under
//  the License.

import PropTypes from 'prop-types';
import React from 'react';
import {Button, Overlay, Popover} from 'react-bootstrap';

export default class AddOptionButton extends React.Component {
  static propTypes = {
    onAdd: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = this.getInitialState();
  }

  getInitialState () {
    return {
      sectionName: '',
      optionName: '',
      value: '',
      show: false
    };
  }

  isInputValid () {
    if (this.state.sectionName !== ''
      && this.state.optionName !== ''
      && this.state.value !== '') {
      return true;
    }

    return false;
  }

  updateSectionName (event) {
    this.setState({ sectionName: event.target.value });
  }

  updateOptionName (event) {
    this.setState({ optionName: event.target.value });
  }

  updateValue (event) {
    this.setState({ value: event.target.value });
  }

  reset () {
    this.setState(this.getInitialState());
  }

  onAdd () {
    if (this.isInputValid()) {
      var option = {
        sectionName: this.state.sectionName,
        optionName: this.state.optionName,
        value: this.state.value
      };

      this.setState({ show: false });
      this.props.onAdd(option);
    }
  }

  togglePopover () {
    this.setState({ show: !this.state.show });
  }

  hidePopover () {
    this.setState({ show: false });
  }

  getPopover () {
    return (
      <Popover className="tray" id="add-option-popover" title="Add Option">
        <input
          className="input-section-name"
          onChange={this.updateSectionName.bind(this)}
          type="text" name="section" placeholder="Section" autoComplete="off" autoFocus/>
        <input
          className="input-option-name"
          onChange={this.updateOptionName.bind(this)}
          type="text" name="name" placeholder="Name"/>
        <input
          className="input-value"
          onChange={this.updateValue.bind(this)}
          type="text" name="value" placeholder="Value"/>
        <a
          className="btn btn-create"
          onClick={this.onAdd.bind(this)}>
          Create
        </a>
      </Popover>
    );
  }

  render () {
    return (
      <div id="add-option-panel">
        <Button
          id="add-option-button"
          onClick={this.togglePopover.bind(this)}
          ref={node => this.target = node}>
          <i className="icon icon-plus header-icon"></i>
          Add Option
        </Button>

        <Overlay
          show={this.state.show}
          onHide={this.hidePopover.bind(this)}
          placement="bottom"
          rootClose={true}
          target={() => this.target}>
          {this.getPopover()}
        </Overlay>
      </div>
    );
  }
}
