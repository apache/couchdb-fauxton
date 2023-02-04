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
import { ButtonGroup, Button, Card } from 'react-bootstrap';
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

  selectAnalyzerType = (val) => {
    this.props.setAnalyzerType(val);
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
    return (
      <Card className='mb-3 col-12 col-xxl-8'>
        <Card.Body>
          <div className="row">
            <div className="mb-3 col-12">
              <label>Analyzer</label>
              <div className="search-analyzer-type-selector">
                <ButtonGroup aria-label='analyzer type selector'>
                  <Button type="button"
                    id="single-analyzer"
                    active={this.props.analyzerType === Constants.ANALYZER_SINGLE}
                    onClick={() => {this.selectAnalyzerType(Constants.ANALYZER_SINGLE);}}
                    variant="cf-secondary">Single</Button>
                  <Button type="button"
                    id="multiple-analyzer"
                    active={this.props.analyzerType === Constants.ANALYZER_MULTIPLE}
                    onClick={() => {this.selectAnalyzerType(Constants.ANALYZER_MULTIPLE);}}
                    variant="cf-secondary">Multiple</Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
          {this.getAnalyzerType()}
        </Card.Body>
      </Card>
    );
  }
}
