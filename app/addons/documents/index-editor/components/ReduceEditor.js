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
import React, { Component } from 'react';
import app from '../../../../app';
import ReactComponents from '../../../components/react-components';
import Form from 'react-bootstrap/Form';

const getDocUrl = app.helpers.getDocUrl;
const {CodeEditorPanel} = ReactComponents;

export default class ReduceEditor extends Component {

  constructor(props) {
    super(props);
  }

  getOptionsList() {
    return this.props.reduceOptions.map((reduce, i) => {
      return <option key={i} value={reduce}>{reduce}</option>;
    });
  }

  getReduceValue() {
    if (!this.props.hasReduce) {
      return null;
    }

    if (!this.props.hasCustomReduce) {
      return this.props.reduce;
    }

    return this.reduceEditor.getValue();
  }

  getEditor() {
    return this.reduceEditor.getEditor();
  }

  updateReduceCode(code) {
    this.props.updateReduceCode(code);
  }

  selectChange(event) {
    this.props.selectReduceChanged(event.target.value);
  }

  render() {
    const reduceOptions = this.getOptionsList();
    let customReduceSection;

    if (this.props.hasCustomReduce && this.props.customReducerSupported) {
      customReduceSection = <CodeEditorPanel
        ref={node => this.reduceEditor = node}
        id='reduce-function'
        title={'Custom Reduce function'}
        defaultCode={this.props.reduce}
        allowZenMode={false}
        blur={this.updateReduceCode.bind(this)}
      />;
    } else if (!this.props.customReducerSupported) {
      customReduceSection = (
        <div className="reduce-editor-warning">
          <label>Partitioned views do not support custom reduce functions.</label>
        </div>
      );
    }

    return (
      <div className="row">
        <div className="mb-3 col-12 col-lg-6 col-xxl-4">
          <label htmlFor="reduce-function-selector">
            <span>Reduce (optional)</span>
            <a
              className="help-link"
              data-bypass="true"
              href={getDocUrl('REDUCE_FUNCS')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fonticon-help-circled"></i>
            </a>
          </label>
          <Form.Select
            onChange={this.selectChange.bind(this)}
            id="reduce-function-selector"
            value={this.props.reduceSelectedOption}
          >
            {reduceOptions}
          </Form.Select>
        </div>
        {customReduceSection}
      </div>
    );
  }
}

ReduceEditor.defaultProps = {
  customReducerSupported: true
};

ReduceEditor.propTypes = {
  reduceOptions: PropTypes.array.isRequired,
  hasReduce: PropTypes.bool.isRequired,
  hasCustomReduce: PropTypes.bool.isRequired,
  customReducerSupported: PropTypes.bool,
  reduce: PropTypes.string,
  reduceSelectedOption: PropTypes.string.isRequired,
  updateReduceCode: PropTypes.func.isRequired,
  selectReduceChanged: PropTypes.func.isRequired
};
