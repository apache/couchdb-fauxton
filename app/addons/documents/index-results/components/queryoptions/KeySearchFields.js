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

import React from 'react';
import ReactDOM from 'react-dom';
import {Form, ButtonGroup, ToggleButton} from 'react-bootstrap';

export default class KeySearchFields extends React.Component {
  constructor (props) {
    super(props);
  }

  toggleByKeys () {
    this.props.toggleByKeys();
  }

  toggleBetweenKeys () {
    this.props.toggleBetweenKeys();
  }

  updateBetweenKeys () {
    this.props.updateBetweenKeys({
      startkey: this.startkey.value,
      endkey: this.endkey.value,
      include: this.props.betweenKeys.include
    });
  }

  updateInclusiveEnd () {
    this.props.updateBetweenKeys({
      include: !this.props.betweenKeys.include,
      startkey: this.props.betweenKeys.startkey,
      endkey: this.props.betweenKeys.endkey
    });
  }

  updateByKeys (e) {
    this.props.updateByKeys(e.target.value);
  }

  render () {
    let betweenKeysClass = 'row-fluid js-keys-section ';
    let byKeysClass = betweenKeysClass;
    let betweenKeysButtonClass = 'drop-down btn ';
    let byKeysButtonClass = betweenKeysButtonClass;

    if (!this.props.showByKeys) {
      byKeysClass += 'hide';
    } else {
      byKeysButtonClass += 'active';
    }

    if (!this.props.showBetweenKeys) {
      betweenKeysClass += 'hide';
    } else {
      betweenKeysButtonClass += 'active';
    }

    return (
      <div className="row m-2 mt-0">
        <div className="col-12 mb-3">
          <h5>Keys</h5>
        </div>
        <div className="col-12 mb-3">
          <ButtonGroup>
            <ToggleButton
              id="byKeys"
              type="checkbox"
              variant="cf-secondary"
              onClick={this.toggleByKeys.bind(this)}
              className={byKeysButtonClass}
            >
              By Key(s)
            </ToggleButton>

            <ToggleButton
              id="betweenKeys"
              type="checkbox"
              variant="cf-secondary"
              onClick={this.toggleBetweenKeys.bind(this)}
              className={betweenKeysButtonClass}
            >
              Between Keys
            </ToggleButton>
          </ButtonGroup>
        </div>
        <div className="col-12">
          <div className={byKeysClass} id="js-showKeys">
            <label htmlFor="keys-input" className="form-label">A key, or an array of keys</label>
            <Form.Control
              value={this.props.byKeys}
              onChange={this.updateByKeys.bind(this)}
              id="keys-input"
              className="form-control"
              rows="5"
              as="textarea"
              placeholder='Enter either a single key ["123"] or an array of keys ["123", "456"]. A key value is the first parameter emitted in a map function. For example emit("123", 1) the key is "123".'
            />
          </div>

          <div className={betweenKeysClass} id="js-showStartEnd">
            <div className="row">
              <div className="col-12">
                <label htmlFor="startkey" className="form-label">Start key</label>
                <Form.Control
                  id="startkey"
                  ref={node => this.startkey = node}
                  type="text"
                  onChange={this.updateBetweenKeys.bind(this)}
                  value={this.props.betweenKeys.startkey}
                  placeholder='e.g., "1234"'
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <label htmlFor="endkey" className="form-label">End key</label>
                <Form.Control
                  id="endkey"
                  ref={node => this.endkey = node}
                  type="text"
                  onChange={this.updateBetweenKeys.bind(this)}
                  value={this.props.betweenKeys.endkey}
                  placeholder='e.g., "1234"'
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <Form.Check
                  id="qoIncludeEndKeyInResults"
                  label="Include end key in results"
                  onChange={this.updateInclusiveEnd.bind(this)}
                  checked={this.props.betweenKeys.include}
                  type="checkbox"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
