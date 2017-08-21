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
import "../../../../../assets/js/plugins/prettify";
import app from "../../../../app";
import FauxtonAPI from "../../../../core/api";
import ReactComponents from "../../../components/react-components";

const PaddedBorderedBox = ReactComponents.PaddedBorderedBox;
const CodeEditorPanel = ReactComponents.CodeEditorPanel;
const getDocUrl = app.helpers.getDocUrl;

export default class MangoQueryEditor extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    prettyPrint();
    // Clear results list in case it was populated by other pages
    this.props.clearResults();
  }

  componentDidUpdate () {
    prettyPrint();
  }

  getEditorValue () {
    return this.refs.codeEditor.getValue();
  }

  editorHasErrors () {
    return this.refs.codeEditor.getEditor().hasErrors();
  }

  editor() {
    return (
      <div className="mango-editor-wrapper">
        <form className="form-horizontal" onSubmit={(ev) => {this.runQuery(ev);}}>
          <PaddedBorderedBox>
            <CodeEditorPanel
              id="query-field"
              ref="codeEditor"
              title={this.props.editorTitle}
              docLink={getDocUrl('MANGO_SEARCH')}
              defaultCode={this.props.queryFindCode} />
          </PaddedBorderedBox>
          <div className="padded-box">
            <div className="control-group">
              <button type="submit" id="create-index-btn" className="btn btn-primary btn-space">Run Query</button>
              <button type="button" id="explain-btn" className="btn btn-secondary btn-space"
                onClick={(ev) => {this.runExplain(ev);} }>Explain</button>
              <a className="edit-link" style={{} } onClick={(ev) => {this.manageIndexes(ev);}}>manage indexes</a>
            </div>
          </div>
        </form>
      </div>
    );
  }

  render () {
    if (this.props.isLoading) {
      return (
        <div className="mango-editor-wrapper">
          <ReactComponents.LoadLines />
        </div>
      );
    }

    return this.editor();
  }

  notifyOnQueryError() {
    if (this.editorHasErrors()) {
      FauxtonAPI.addNotification({
        msg:  'Please fix the Javascript errors and try again.',
        type: 'error',
        clear: true
      });

      return true;
    }
    return false;
  }

  manageIndexes(event) {
    event.preventDefault();

    this.props.manageIndexes();

    const manageIndexURL = '#' + FauxtonAPI.urls('mango', 'index-app', encodeURIComponent(this.props.databaseName));
    FauxtonAPI.navigate(manageIndexURL);
  }

  runExplain(event) {
    event.preventDefault();

    if (this.notifyOnQueryError()) {
      return;
    }

    this.props.runExplainQuery({
      databaseName: this.props.databaseName,
      queryCode: this.getEditorValue()
    });
  }

  runQuery (event) {
    event.preventDefault();

    if (this.notifyOnQueryError()) {
      return;
    }

    this.props.runQuery({
      databaseName: this.props.databaseName,
      queryCode: JSON.parse(this.getEditorValue()),
      fetchParams: this.props.fetchParams
    });
  }
}

MangoQueryEditor.propTypes = {
  description: React.PropTypes.string.isRequired,
  editorTitle: React.PropTypes.string.isRequired,
  queryFindCode: React.PropTypes.string.isRequired,
  queryFindCodeChanged: React.PropTypes.bool,
  databaseName: React.PropTypes.string.isRequired,
  runExplainQuery: React.PropTypes.func.isRequired,
  manageIndexes: React.PropTypes.func.isRequired,
};
