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
import AnalyzerDropdown from './AnalyzerDropdown';

export default class AnalyzerRow extends React.Component {
  static propTypes = {
    rowIndex: PropTypes.number.isRequired,
    row: PropTypes.object.isRequired,
    showErrors: PropTypes.bool.isRequired,
    removeAnalyzerRow: PropTypes.func.isRequired,
    setAnalyzerRowFieldName: PropTypes.func.isRequired,
    setAnalyzer: PropTypes.func.isRequired
  };

  deleteRow = (e) => {
    e.preventDefault();
    this.props.removeAnalyzerRow(this.props.rowIndex);
  };

  getFieldNameHeading = (analyzerId) => {
    return (this.props.rowIndex === 0) && <label htmlFor={analyzerId}>Fieldname</label>;
  };

  changeFieldName = (e) => {
    this.props.setAnalyzerRowFieldName({
      rowIndex: this.props.rowIndex,
      fieldName: e.target.value
    });
  };

  selectAnalyzer = (e) => {
    this.props.setAnalyzer({
      rowIndex: this.props.rowIndex,
      analyzer: e.target.value
    });
  };

  render() {
    const analyzerId = "analyzer-row-" + this.props.rowIndex;
    const analyzerHeading = (this.props.rowIndex === 0) ? 'Analyzer' : '';

    let fieldNameClasses = 'span12';
    if (this.props.showErrors && !this.props.row.valid) {
      fieldNameClasses += ' unhappy';
    }

    return (
      <li>
        <div className="row-fluid">
          <div className="span4">
            {this.getFieldNameHeading(analyzerId)}
            <input type="text" value={this.props.row.fieldName} className={fieldNameClasses} onChange={this.changeFieldName} />
          </div>

          <AnalyzerDropdown
            id={analyzerId}
            label={analyzerHeading}
            defaultSelected={this.props.row.analyzer}
            classes="span4"
            onChange={this.selectAnalyzer} />

          <div className="span4">
            <button className="btn btn-danger delete-analyzer" onClick={this.deleteRow}>delete</button>
          </div>
        </div>
      </li>
    );
  }
}
