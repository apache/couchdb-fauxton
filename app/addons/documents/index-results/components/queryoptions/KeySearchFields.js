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
              <label htmlFor="keys-input" className="drop-down">A key, or an array of keys.</label>
              <textarea value={this.props.byKeys} onChange={this.updateByKeys.bind(this)} id="keys-input" className="input-xxlarge" rows="5" type="text"
                placeholder='Enter either a single key ["123"] or an array of keys ["123", "456"]. A key value is the first parameter emitted in a map function. For example emit("123", 1) the key is "123".'></textarea>
              <div id="keys-error" className="inline-block js-keys-error"></div>
            </div>
          </div>

          <div className={betweenKeysClass} id="js-showStartEnd">
            <div className="controls controls-row">
              <div>
                <label htmlFor="startkey" className="drop-down">Start key</label>
                <input
                  id="startkey"
                  ref={node => this.startkey = node}
                  type="text"
                  onChange={this.updateBetweenKeys.bind(this)}
                  value={this.props.betweenKeys.startkey}
                  placeholder='e.g., "1234"' />
              </div>
              <div>
                <label htmlFor="endkey" className="drop-down">End key</label>
                <input
                  id="endkey"
                  ref={node => this.endkey = node}
                  onChange={this.updateBetweenKeys.bind(this)}
                  value={this.props.betweenKeys.endkey}
                  type="text"
                  placeholder='e.g., "1234"'/>
                <div className="controls include-end-key-row checkbox controls-row inline">
                  <input
                    id="qoIncludeEndKeyInResults"
                    type="checkbox"
                    onChange={this.updateInclusiveEnd.bind(this)}
                    checked={this.props.betweenKeys.include}/>
                  <label htmlFor="qoIncludeEndKeyInResults">Include End Key in results</label>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
