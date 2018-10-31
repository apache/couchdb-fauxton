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

import React, { Component } from "react";
import ReactDOM from "react-dom";
import app from "../../../../app";
import ReactComponents from "../../../components/react-components";
import Stores from "../stores";
import Actions from "../actions";

const getDocUrl = app.helpers.getDocUrl;
const store = Stores.indexEditorStore;
const {CodeEditorPanel, StyledSelect} = ReactComponents;

export default class ReduceEditor extends Component {

  constructor(props) {
    super(props);
    this.state = this.getStoreState();
  }

  onChange() {
    this.setState(this.getStoreState());
  }

  componentDidMount() {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    store.off('change', this.onChange);
  }

  getStoreState() {
    return {
      reduce: store.getReduce(),
      reduceOptions: store.reduceOptions(),
      reduceSelectedOption: store.reduceSelectedOption(),
      hasCustomReduce: store.hasCustomReduce(),
      hasReduce: store.hasReduce()
    };
  }

  getOptionsList() {
    return _.map(this.state.reduceOptions, (reduce, i) => {
      return <option key={i} value={reduce}>{reduce}</option>;
    });
  }

  getReduceValue() {
    if (!this.state.hasReduce) {
      return null;
    }

    if (!this.state.hasCustomReduce) {
      return this.state.reduce;
    }

    return this.reduceEditor.getValue();
  }

  getEditor() {
    return this.reduceEditor.getEditor();
  }

  updateReduceCode(code) {
    Actions.updateReduceCode(code);
  }

  selectChange(event) {
    Actions.selectReduceChanged(event.target.value);
  }

  render() {
    const reduceOptions = this.getOptionsList();
    let customReduceSection;

    if (this.state.hasCustomReduce) {
      customReduceSection = <CodeEditorPanel
        ref={node => this.reduceEditor = node}
        id='reduce-function'
        title={'Custom Reduce function'}
        defaultCode={this.state.reduce}
        allowZenMode={false}
        blur={this.updateReduceCode.bind(this)}
      />;
    }

    return (
      <div>
        <div className="control-group">
          <label htmlFor="reduce-function-selector">
            <span>Reduce (optional)</span>
            <a
              className="help-link"
              data-bypass="true"
              href={getDocUrl('REDUCE_FUNCS')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="icon-question-sign"></i>
            </a>
          </label>
          <StyledSelect
            selectContent={reduceOptions}
            selectChange={this.selectChange.bind(this)}
            selectId="reduce-function-selector"
            selectValue={this.state.reduceSelectedOption} />
        </div>
        {customReduceSection}
      </div>
    );
  }
}
