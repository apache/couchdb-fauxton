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
import Form from 'react-bootstrap/Form';

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
      <div className="col-6 mb-2">
        <div className="row">
          <div className="col-auto">
            <label id="qoGroupLevelGroup" htmlFor="qoLimit" className="col-form-label">Group Level</label>
          </div>
          <div className="col-auto">
            <Form.Select
              id="qoGroupLevel"
              onChange={this.groupLevelChange.bind(this)}
              value={this.props.groupLevel}
            >
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
            </Form.Select>
          </div>
        </div>
      </div>
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
      <div className="col-12">
        <Form.Check
          id="qoIncludeDocs"
          disabled={reduce}
          label="Include Docs"
          onChange={this.toggleIncludeDocs}
          checked={includeDocs}
          type="checkbox"
        />
      </div>
    );
  }

  reduceOption() {
    const {showReduce, reduce} = this.props;
    if (!showReduce) {
      return null;
    }

    return (
      <React.Fragment>
        <div className="col-6">
          <Form.Check
            id="qoReduce"
            label="Reduce"
            onChange={this.toggleReduce.bind(this)}
            checked={reduce}
            type="checkbox"
          />
        </div>
        {this.groupLevel()}
      </React.Fragment>
    );
  }

  stableOption() {
    let {enableStable, stable} = this.props;

    if (!enableStable) {
      // makes sure Stable option always appears unchecked when disabled
      stable = false;
    }

    return (
      <React.Fragment>
        <div className="col-6">
          <Form.Check
            id="qoStable"
            label="Stable"
            onChange={this.toggleStable}
            checked={stable}
            type="checkbox"
            disabled={!enableStable}
          />
        </div>
      </React.Fragment>
    );
  }

  updateOption() {
    const { update } = this.props;
    const selectOptions = this.updateOptions.map(option => {
      return <option key={option.value} value={option.value}>{option.label}</option>;
    });
    return (
      <React.Fragment>
        <div className="col-6">
          <div className="row">
            <div className="col-auto">
              <label htmlFor="qoUpdate" className="col-form-label">Update</label>
            </div>
            <div className="col-auto">
              <Form.Select
                id="qoUpdate"
                onChange={this.onUpdateChange}
                value={update}
              >
                {selectOptions}
              </Form.Select>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className="row m-2">
        <div className="col-12">
          <h5>
            Query Options
            <a className="help-link ms-1" href={this.props.docURL} target="_blank" rel="noopener noreferrer" data-bypass="true">
              <i className="fonticon-help-circled"/>
            </a>
          </h5>
        </div>
        <div className="col-12">
          <div className="row align-items-center">
            {this.includeDocsOption()}
            {this.reduceOption()}
          </div>
        </div>
        <div className="col-12">
          <div className="row align-items-center">
            {this.stableOption()}
            {this.updateOption()}
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
  update: PropTypes.string.isRequired,
  changeUpdateField: PropTypes.func.isRequired,
  showReduce: PropTypes.bool.isRequired,
  enableStable: PropTypes.bool.isRequired
};
