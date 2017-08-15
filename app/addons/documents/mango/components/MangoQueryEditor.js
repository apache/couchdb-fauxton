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
import IndexResultActions from "../../index-results/actions";
import MangoEditor from "./MangoEditor";

const getDocUrl = app.helpers.getDocUrl;

export default class MangoQueryEditor extends Component {

  constructor(props) {
    super(props);
    console.log('MangoQueryEditor::constructors:', props);
  }

  componentDidMount() {
    console.log('MangoQueryEditor:::mounted');
    prettyPrint();
    this.props.fetchAndLoadIndexList();
  }

  // getStoreState: function () {
  //   return {
  //     queryCode: mangoStore.getQueryFindCode(),
  //     database: mangoStore.getDatabase(),
  //     changedQuery: mangoStore.getQueryFindCodeChanged(),
  //     availableIndexes: mangoStore.getAvailableQueryIndexes(),
  //     additionalIndexes: mangoStore.getAvailableAdditionalIndexes(),
  //     isLoading: mangoStore.getLoadingIndexes()
  //   };
  // },

  // onChange: function () {
  //   this.setState(this.getStoreState());
  // },

  componentDidUpdate () {
    prettyPrint();
  }

  // componentDidMount () {

  //   // mangoStore.on('change', this.onChange, this);
  // }

  // componentWillUnmount () {
  //   mangoStore.off('change', this.onChange);
  // },

  getMangoEditor () {
    return this.refs.mangoEditor;
  }

  render () {
    if (this.props.isLoading) {
      return (
        <div className="mango-editor-wrapper">
          <ReactComponents.LoadLines />
        </div>
      );
    }

    return (
      <MangoEditor
        ref="mangoEditor"
        description={this.props.description}
        // dbName={this.props.database.id}
        dbName={this.props.databaseName}
        onSubmit={(ev) => {this.runQuery(ev);}}
        title={this.props.editorTitle}
        additionalIndexesText={this.props.additionalIndexesText}
        docs={getDocUrl('MANGO_SEARCH')}
        exampleCode={this.props.queryFindCode} //mangoStore.getQueryFindCode(),
        changedQuery={this.props.queryFindCodeChanged} //mangoStore.getQueryFindCodeChanged(),
        availableIndexes={this.props.availableIndexes} //mangoStore.getAvailableQueryIndexes(),
        additionalIndexes={this.props.additionalIndexes} //mangoStore.getAvailableAdditionalIndexes(),
        confirmbuttonText="Run Query" />
    );
  }

  runQuery (event) {
    event.preventDefault();

    if (this.getMangoEditor().hasErrors()) {
      FauxtonAPI.addNotification({
        msg:  'Please fix the Javascript errors and try again.',
        type: 'error',
        clear: true
      });
      return;
    }

    IndexResultActions.runMangoFindQuery({
      database: this.props.database,
      queryCode: this.getMangoEditor().getEditorValue()
    });
  }
}

MangoQueryEditor.propTypes = {
  description: React.PropTypes.string.isRequired,
  editorTitle: React.PropTypes.string.isRequired,
  additionalIndexesText: React.PropTypes.string.isRequired,
  queryFindCode: React.PropTypes.string.isRequired,
  queryFindCodeChanged: React.PropTypes.bool,
  databaseName: React.PropTypes.string.isRequired,
  availableIndexes: React.PropTypes.arrayOf(React.PropTypes.object),
  additionalIndexes: React.PropTypes.arrayOf(React.PropTypes.object),
  isLoading: React.PropTypes.bool,
  fetchAndLoadIndexList: React.PropTypes.func.isRequired,
};
