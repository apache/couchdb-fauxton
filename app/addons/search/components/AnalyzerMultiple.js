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

import FauxtonAPI from '../../../core/api';
import PropTypes from 'prop-types';
import React from 'react';
import AnalyzerRow from './AnalyzerRow';
import AnalyzerDropdown from './AnalyzerDropdown';

export default class AnalyzerMultiple extends React.Component {
  static propTypes = {
    addAnalyzerRow: PropTypes.func.isRequired,
    defaultAnalyzer: PropTypes.string.isRequired,
    selectDefaultMultipleAnalyzer: PropTypes.func.isRequired,
    fields: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      showErrors: false
    };
  }

  addRow = (e) => {
    e.preventDefault();
    this.props.addAnalyzerRow(this.props.defaultAnalyzer);
  };

  getRows = () => {
    return this.props.fields.map((row, i) => {
      return (
        <AnalyzerRow
          row={row}
          key={row.key}
          rowIndex={i}
          showErrors={this.state.showErrors}
          setAnalyzer={this.props.setAnalyzer}
          setAnalyzerRowFieldName={this.props.setAnalyzerRowFieldName}
          removeAnalyzerRow={this.props.removeAnalyzerRow}
        />
      );
    });
  };

  validate = () => {
    this.setState({ showErrors: true });

    let hasDuplicate = false;
    const fieldNames = [];
    const allValid = this.props.fields.every((row) => {
      if (fieldNames.includes(row.fieldName)) {
        hasDuplicate = true;
      }
      fieldNames.push(row.fieldName);
      return row.valid;
    });

    if (!allValid || hasDuplicate) {
      FauxtonAPI.addNotification({
        msg: 'Fieldnames cannot be empty and must be unique.',
        type: 'error',
        clear: true
      });
    }
    return allValid;
  };

  render() {
    return (
      <div>
        <AnalyzerDropdown
          label="Default"
          id="defaultAnalyzer"
          defaultSelected={this.props.defaultAnalyzer}
          onChange={this.props.selectDefaultMultipleAnalyzer}
          isValidating={this.validate} />
        <ul id="analyzer-fields" className="unstyled">{this.getRows()}</ul>
        <button className="addfield btn btn-small btn-primary" onClick={this.addRow}>
          Add Field
        </button>
      </div>
    );
  }
}
