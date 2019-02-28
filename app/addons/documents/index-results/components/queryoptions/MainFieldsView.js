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
    this.onUpdateChange = this.onUpdateChange.bind(this);
    this.toggleIncludeDocs = this.toggleIncludeDocs.bind(this);

    this.updateOptions = [
      {value: 'true', label: 'true'},
      {value: 'lazy', label: 'lazy'},
      {value: 'false', label: 'false'}
    ];
  }

  toggleIncludeDocs() {
    this.props.toggleIncludeDocs(this.props.includeDocs);
  }

  onUpdateChange(e) {
    this.props.changeUpdateField(e.target.value);
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

  includeDocsOption() {
    const {includeDocs, reduce} = this.props;
    return (
      <div className="checkbox inline">
        <input disabled={reduce} onChange={this.toggleIncludeDocs} id="qoIncludeDocs"
          name="include_docs" type="checkbox" checked={includeDocs}/>
        <label className={reduce ? 'disabled' : ''} htmlFor="qoIncludeDocs" id="qoIncludeDocsLabel">Include
            Docs</label>
      </div>
    );
  }

  reduceOption() {
    const {showReduce, reduce} = this.props;
    if (!showReduce) {
      return null;
    }

    return (
      <span>
        <div className="checkbox inline">
          <input id="qoReduce" name="reduce" onChange={this.toggleReduce.bind(this)} type="checkbox"
            checked={reduce}/>
          <label htmlFor="qoReduce">Reduce</label>
        </div>
        {this.groupLevel()}
      </span>
    );
  }

  stableOption() {
    let {enableStable, stable} = this.props;

    if (!enableStable) {
      // makes sure Stable option always appears unchecked when disabled
      stable = false;
    }

    return (
      <div className="checkbox inline">
        <input onChange={this.toggleStable} id="qoStable" name="stable"
          type="checkbox" checked={stable} disabled={!enableStable}/>
        <label className={enableStable ? '' : 'disabled'} htmlFor="qoStable" id="qoStableLabel">Stable</label>
      </div>
    );
  }

  updateOption() {
    const { update } = this.props;
    const selectOptions = this.updateOptions.map(option => {
      return <option key={option.value} value={option.value}>{option.label}</option>;
    });
    return (
      <div className="dropdown inline">
        <label className="drop-down">
          Update
          <select className="input-small" id="qoUpdate" value={update} onChange={this.onUpdateChange}>
            {selectOptions}
          </select>
        </label>
      </div>
    );
  }

  render() {
    return (
      <div className="query-group" id="query-options-main-fields">
        <span className="add-on">
          Query Options
          <a className="help-link" href={this.props.docURL} target="_blank" rel="noopener noreferrer" data-bypass="true">
            <i className="icon-question-sign"/>
          </a>
        </span>
        <div className="row-fluid fieldsets">
          {this.includeDocsOption()}
          {this.reduceOption()}
        </div>
        <div className="row-fluid fieldsets">
          {this.stableOption()}
          {this.updateOption()}
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
  update: PropTypes.string.isRequired,
  changeUpdateField: PropTypes.func.isRequired,
  showReduce: PropTypes.bool.isRequired,
  enableStable: PropTypes.bool.isRequired
};
