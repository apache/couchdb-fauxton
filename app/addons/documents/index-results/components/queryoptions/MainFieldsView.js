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
import React from 'react';

export default class MainFieldsView extends React.Component {
  constructor(props) {
    super(props);
    this.toggleStable = this.toggleStable.bind(this);
    this.onStaleChange = this.onStaleChange.bind(this);

    this.staleOptions = [
      {value: null, 'label': 'Default'},
      {value: 'ok', label: 'ok'},
      {value: 'update_after', label: 'update_after'},
      {value: 'false', label: 'false'}
    ];
  }

  toggleIncludeDocs() {
    this.props.toggleIncludeDocs(this.props.includeDocs);
  }

  onStaleChange(e) {
    this.props.updateStale(e.target.value);
  }

  groupLevelChange(e) {
    this.props.updateGroupLevel(e.target.value);
  }

  groupLevel() {
    if (!this.props.reduce) {
      return null;
    }

    return (
        <label className="drop-down inline" id="qoGroupLevelGroup">
          Group Level
          <select onChange={this.groupLevelChange.bind(this)} id="qoGroupLevel" value={this.props.groupLevel}
                  name="group_level" className="input-small">
            <option value="0">None</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="exact">Exact</option>
          </select>
        </label>
    );
  }

  toggleReduce() {
    this.props.toggleReduce(this.props.reduce);
  }

  toggleStable() {
    this.props.toggleStable(this.props.stable);
  }

  reduce() {
    if (!this.props.showReduce) {
      return null;
    }

    return (
        <span>
        <div className="checkbox inline">
          <input id="qoReduce" name="reduce" onChange={this.toggleReduce.bind(this)} type="checkbox"
                 checked={this.props.reduce}/>
          <label htmlFor="qoReduce">Reduce</label>
        </div>
          {this.groupLevel()}
      </span>
    );
  }

  getStaleOptions() {
    return this.staleOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>);
  }

  render() {
    let {includeDocs, stable, stale} = this.props;
    return (
        <div className="query-group" id="query-options-main-fields">
        <span className="add-on">
          Query Options
          <a className="help-link" href={this.props.docURL} target="_blank" data-bypass="true">
            <i className="icon-question-sign"/>
          </a>
        </span>
          <div className="controls-group qo-main-fields-row">
            <div className="row-fluid fieldsets">
              <div className="checkbox inline">
                <input disabled={this.props.reduce} onChange={this.toggleIncludeDocs.bind(this)} id="qoIncludeDocs"
                       name="include_docs" type="checkbox" checked={includeDocs}/>
                <label className={this.props.reduce ? 'disabled' : ''} htmlFor="qoIncludeDocs" id="qoIncludeDocsLabel">Include
                  Docs</label>
              </div>
              {this.reduce()}
            </div>
            <div className="row-fluid fieldsets">
              <div className="checkbox inline">
                <input onChange={this.toggleStable} id="qoStable"
                       name="include_docs" type="checkbox" checked={stable}/>
                <label htmlFor="qoStable" id="qoStableLabel">Stable</label>
              </div>
              <div className="dropdown inline">
                <label className="drop-down">Stale
                  <select className="input-small" value={stale} onChange={this.onStaleChange}>
                    {this.getStaleOptions()}
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>
    );
  }

}

MainFieldsView.propTypes = {
  toggleIncludeDocs: PropTypes.func.isRequired,
  includeDocs: PropTypes.bool.isRequired,
  reduce: PropTypes.bool.isRequired,
  toggleReduce: PropTypes.func,
  updateGroupLevel: PropTypes.func,
  docURL: PropTypes.string.isRequired,
  stable: PropTypes.bool.isRequired,
  toggleStable: PropTypes.func.isRequired,
  stale: PropTypes.string.isRequired,
  updateStale: PropTypes.func.isRequired
};
