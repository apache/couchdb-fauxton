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
import Constants from '../constants';
import AnalyzerMultiple from './AnalyzerMultiple';
import AnalyzerDropdown from './AnalyzerDropdown';

// handles the entire Analyzer section: Simple and Multiple analyzers
export default class Analyzer extends React.Component {
  static propTypes = {
    analyzerType: PropTypes.string.isRequired,
    analyzerFields: PropTypes.array.isRequired,
    defaultMultipleAnalyzer: PropTypes.string.isRequired,
    singleAnalyzer: PropTypes.string.isRequired,
    setAnalyzerType: PropTypes.func.isRequired,
    setSingleAnalyzer: PropTypes.func.isRequired,
    setDefaultMultipleAnalyzer: PropTypes.func.isRequired,
    addAnalyzerRow: PropTypes.func.isRequired
  };

  selectAnalyzerType = (e) => {
    this.props.setAnalyzerType(e.target.value);
  };

  validate = () => {
    if (this.props.analyzerType === Constants.ANALYZER_SINGLE) {
      return true;
    }
    return this.analyzerMultiple.validate();
  };

  getAnalyzerFieldsAsObject = () => {
    return this.props.analyzerFields.reduce((acc, row) => {
      const fieldName = row.fieldName.replace(/["']/g, '');
      acc[fieldName] = row.analyzer;
      return acc;
    }, {});
  };

  getInfo = () => {
    return this.props.analyzerType === Constants.ANALYZER_SINGLE
      ? this.props.singleAnalyzer
      : {
        name: 'perfield',
        default: this.props.defaultMultipleAnalyzer,
        fields: this.getAnalyzerFieldsAsObject()
      };
  };

  selectSingleAnalyzer = (e) => {
    this.props.setSingleAnalyzer(e.target.value);
  };

  selectDefaultMultipleAnalyzer = (e) => {
    this.props.setDefaultMultipleAnalyzer(e.target.value);
  };

  getAnalyzerType = () => {
    return this.props.analyzerType === Constants.ANALYZER_SINGLE
      ? (<AnalyzerDropdown
        label="Type"
        defaultSelected={this.props.singleAnalyzer}
        onChange={this.selectSingleAnalyzer}
      />)
      : (<AnalyzerMultiple
        ref={node => this.analyzerMultiple = node}
        defaultAnalyzer={this.props.defaultMultipleAnalyzer}
        selectDefaultMultipleAnalyzer={this.selectDefaultMultipleAnalyzer}
        fields={this.props.analyzerFields}
        addAnalyzerRow={this.props.addAnalyzerRow}
        removeAnalyzerRow={this.props.removeAnalyzerRow}
        setAnalyzerRowFieldName={this.props.setAnalyzerRowFieldName}
        setAnalyzer={this.props.setAnalyzer}
      />);
  };

  render() {
    let multipleClasses = 'btn';
    if (this.props.analyzerType === Constants.ANALYZER_MULTIPLE) {
      multipleClasses += ' active';
    }
    let singleClasses = 'btn';
    if (this.props.analyzerType === Constants.ANALYZER_SINGLE) {
      singleClasses += ' active';
    }

    return (
      <div className="well">
        <div className="control-group">
          <label htmlFor="search-analyzer">Analyzer</label>
          <div className="btn-group toggle-btns" id="analyzer">
            <label style={{width: '82px'}}  htmlFor="single-analyzer" className={singleClasses}>Single</label>
            <input
              type="radio"
              id="single-analyzer"
              name="search-analyzer"
              value="single"
              checked={this.props.analyzerType === Constants.ANALYZER_SINGLE}
              onChange={this.selectAnalyzerType} />
            <input
              type="radio"
              id="multiple-analyzer"
              name="search-analyzer"
              value="multiple"
              checked={this.props.analyzerType === Constants.ANALYZER_MULTIPLE}
              onChange={this.selectAnalyzerType} />
            <label style={{width: '82px'}} htmlFor="multiple-analyzer" className={multipleClasses}>Multiple</label>
          </div>
        </div>
        {this.getAnalyzerType()}
      </div>
    );
  }
}
