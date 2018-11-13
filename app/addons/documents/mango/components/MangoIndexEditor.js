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
import ReactSelect from 'react-select';
import '../../../../../assets/js/plugins/prettify';
import app from '../../../../app';
import FauxtonAPI from '../../../../core/api';
import ReactComponents from '../../../components/react-components';

const PaddedBorderedBox = ReactComponents.PaddedBorderedBox;
const CodeEditorPanel = ReactComponents.CodeEditorPanel;
const ConfirmButton = ReactComponents.ConfirmButton;
const LoadLines = ReactComponents.LoadLines;
const getDocUrl = app.helpers.getDocUrl;

export default class MangoIndexEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      partitionedSelected: true
    };
    this.onTemplateSelected = this.onTemplateSelected.bind(this);
    this.onTogglePartitioned = this.onTogglePartitioned.bind(this);
    this.saveIndex = this.saveIndex.bind(this);
  }

  componentDidMount() {
    prettyPrint();
    this.props.loadIndexTemplates();
    this.props.clearResults();
    this.props.loadIndexList({
      fetchParams: { ...this.props.fetchParams, skip: 0 }
    });
  }

  componentDidUpdate(prevProps) {
    prettyPrint();
    if (prevProps.templates != this.props.templates) {
      // Explicitly set value because updating 'CodeEditorPanel.defaultCode' won't change the editor once it's already loaded.
      this.setEditorValue(this.props.templates[0].value);
    }
  }

  setEditorValue(newValue = '') {
    if (this.codeEditor) {
      return this.codeEditor.getEditor().setValue(newValue);
    }
  }

  getEditorValue() {
    return this.codeEditor.getValue();
  }

  editorHasErrors() {
    return this.codeEditor.getEditor().hasErrors();
  }

  onTemplateSelected(selectedItem) {
    this.setEditorValue(selectedItem.value);
  }

  onTogglePartitioned() {
    this.setState({partitionedSelected: !this.state.partitionedSelected});
  }

  partitionedCheckobx() {
    if (!this.props.isDbPartitioned) {
      return null;
    }
    return (
      <label>
        <input
          id="js-partitioned-index"
          type="checkbox"
          checked={this.state.partitionedSelected}
          onChange={this.onTogglePartitioned}
          style={{margin: '0px 10px 0px 0px'}} />
        Partitioned
      </label>
    );
  }

  editor() {
    const encodedPartKey = this.props.partitionKey ? encodeURIComponent(this.props.partitionKey) : '';
    const editQueryURL = '#' + FauxtonAPI.urls('mango', 'query-app', encodeURIComponent(this.props.databaseName), encodedPartKey);
    return (
      <div className="mango-editor-wrapper">
        <form className="form-horizontal" onSubmit={this.saveIndex}>
          <div className="padded-box">
            <ReactSelect
              className="mango-select"
              options={this.props.templates}
              ref={node => this.templates = node}
              placeholder="Examples"
              searchable={false}
              clearable={false}
              autosize={false}
              onChange={this.onTemplateSelected}
            />
          </div>
          <PaddedBorderedBox>
            <CodeEditorPanel
              id="query-field"
              ref={node => this.codeEditor = node}
              title="Index"
              docLink={getDocUrl('MANGO_INDEX')}
              defaultCode={this.props.queryIndexCode} />
            {this.partitionedCheckobx()}
          </PaddedBorderedBox>
          <div className="padded-box">
            <div className="control-group">
              <ConfirmButton text="Create index" id="create-index-btn" showIcon={false} />
              <a className="edit-link" href={editQueryURL}>edit query</a>
            </div>
          </div>
        </form>
      </div>
    );
  }

  render() {
    if (this.props.isLoading) {
      return <LoadLines />;
    }
    return this.editor();
  }

  saveIndex(event) {
    event.preventDefault();

    const showInvalidCodeMsg = () => {
      FauxtonAPI.addNotification({
        msg: 'Please fix the Javascript errors and try again.',
        type: 'error',
        clear: true
      });
    };
    if (this.editorHasErrors()) {
      showInvalidCodeMsg();
      return;
    }

    let indexCode = this.getEditorValue();
    if (this.props.isDbPartitioned) {
      // Set the partitioned property if not yet set
      try {
        const json = JSON.parse(indexCode);
        if (json.partitioned !== true && json.partitioned !== false) {
          json.partitioned = this.state.partitionedSelected;
        }
        indexCode = JSON.stringify(json);
      } catch (err) {
        showInvalidCodeMsg();
      }
    }

    this.props.saveIndex({
      databaseName: this.props.databaseName,
      indexCode: indexCode,
      fetchParams: this.props.fetchParams
    });
  }
}

MangoIndexEditor.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  databaseName: PropTypes.string.isRequired,
  isDbPartitioned: PropTypes.bool.isRequired,
  saveIndex: PropTypes.func.isRequired,
  queryIndexCode: PropTypes.string.isRequired,
  partitionKey: PropTypes.string,
  loadIndexTemplates: PropTypes.func.isRequired,
  clearResults: PropTypes.func.isRequired,
  loadIndexList: PropTypes.func.isRequired
};

MangoIndexEditor.defaultProps = {
  isLoading: true,
  isDbPartitioned: false
};
