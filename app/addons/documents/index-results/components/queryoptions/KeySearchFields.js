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
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

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
      startkey: ReactDOM.findDOMNode(this.refs.startkey).value,
      endkey: ReactDOM.findDOMNode(this.refs.endkey).value,
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

  warningBetweenKeysValue(keyValue) {
    if (!keyValue) {
      return null;
    }
    keyValue = keyValue.trim();
    // No warning if it's enclosed in double quotes, square brackets or curly brackets
    if (/^".*"$/.test(keyValue) || /^\[.*\]$/.test(keyValue) || /^{.*}$/.test(keyValue)) {
      return null;
    }
    // No warning if user specified a boolean or numeric value
    if (keyValue === 'true' || keyValue === 'false' ||
      $.isNumeric(keyValue)) {
      return null;
    }

    const tooltip = <Tooltip id="queryoptions-key-tooltip">String values must be enclosed in double quotes. E.g.: "abc"</Tooltip>;
    return (
      <OverlayTrigger placement="top" overlay={tooltip}>
        <i className="icon-exclamation-sign" style={{marginLeft: '0.5rem'}}></i>
      </OverlayTrigger>
    );
  }

  warningByKeysValue(keyValue) {
    if (!keyValue) {
      return null;
    }
    keyValue = keyValue.trim();
    // No warning if it's enclosed in square brackets
    if (/^\[.*\]$/.test(keyValue)) {
      return null;
    }

    const tooltip = <Tooltip id="queryoptions-key-tooltip">Value must be an array. E.g.: ["abc"] or ["abc", "def"]</Tooltip>;
    return (
      <OverlayTrigger placement="top" overlay={tooltip}>
        <i className="icon-exclamation-sign" style={{marginLeft: '0.5rem'}}></i>
      </OverlayTrigger>
    );
  }

  render () {
    let keysGroupClass = 'controls-group well js-query-keys-wrapper ';
    let byKeysClass = 'row-fluid js-keys-section ';
    let betweenKeysClass = byKeysClass;
    let byKeysButtonClass = 'drop-down btn ';
    let betweenKeysButtonClass = byKeysButtonClass;

    if (!this.props.showByKeys && !this.props.showBetweenKeys) {
      keysGroupClass += 'hide';
    }

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
      <div className="query-group" id="query-options-key-search">
        <div className="add-on">Keys</div>
        <div className="btn-group toggle-btns row-fluid">
          <label style={{width: '101px'}} id="byKeys" onClick={this.toggleByKeys.bind(this)} className={byKeysButtonClass}>By Key(s)</label>
          <label style={{width: '101px'}} id="betweenKeys" onClick={this.toggleBetweenKeys.bind(this)} className={betweenKeysButtonClass}>Between Keys</label>
        </div>

        <div className={keysGroupClass}>
          <div className={byKeysClass} id="js-showKeys">
            <div className="controls controls-row">
              <label htmlFor="keys-input" className="drop-down">
                An array of one or more keys
                {this.warningByKeysValue(this.props.byKeys)}
              </label>
              <textarea value={this.props.byKeys} onChange={this.updateByKeys.bind(this)} id="keys-input" className="input-xxlarge" rows="5" type="text"
                placeholder='Enter either a single key ["123"] or an array of keys ["123", "456"]. A key value is the first parameter emitted in a map function. For example emit("123", 1) the key is "123".'></textarea>
              <div id="keys-error" className="inline-block js-keys-error"></div>
            </div>
          </div>

          <div className={betweenKeysClass} id="js-showStartEnd">
            <div className="controls controls-row">
              <div>
                <label htmlFor="startkey" className="drop-down">
                  Start key
                  {this.warningBetweenKeysValue(this.props.betweenKeys.startkey)}
                </label>
                <input id="startkey" ref="startkey" type="text" onChange={this.updateBetweenKeys.bind(this)} value={this.props.betweenKeys.startkey} placeholder='e.g., "1234"' />
              </div>
              <div>
                <label htmlFor="endkey" className="drop-down">
                  End key
                  {this.warningBetweenKeysValue(this.props.betweenKeys.endkey)}
                </label>
                <input id="endkey" ref="endkey" onChange={this.updateBetweenKeys.bind(this)} value={this.props.betweenKeys.endkey} type="text" placeholder='e.g., "1234"'/>
                <div className="controls include-end-key-row checkbox controls-row inline">
                  <input id="qoIncludeEndKeyInResults" ref="inclusive_end" type="checkbox" onChange={this.updateInclusiveEnd.bind(this)} checked={this.props.betweenKeys.include}/>
                  <label htmlFor="qoIncludeEndKeyInResults">Include End Key in results</label>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
};
