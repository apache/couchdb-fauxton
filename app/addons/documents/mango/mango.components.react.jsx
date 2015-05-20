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

define([
  'app',
  'api',
  'react',
  'addons/documents/mango/mango.stores',
  'addons/documents/mango/mango.actions',
  'addons/components/react-components.react',
  'addons/documents/index-results/actions',
  'addons/documents/mango/mango.helper',

  'plugins/prettify'
],

function (app, FauxtonAPI, React, Stores, Actions,
          ReactComponents, IndexResultActions, MangoHelper) {

  var mangoStore = Stores.mangoStore;
  var getDocUrl = app.helpers.getDocUrl;

  var PaddedBorderedBox = ReactComponents.PaddedBorderedBox;
  var CodeEditor = ReactComponents.CodeEditor;
  var ConfirmButton = ReactComponents.ConfirmButton;

  var MangoQueryEditorController = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        queryCode: mangoStore.getQueryFindCode(),
        database: mangoStore.getDatabase(),
        changedQuery: mangoStore.getQueryFindCodeChanged(),
        availableIndexes: mangoStore.getAvailableQueryIndexes(),
        additionalIndexes: mangoStore.getAvailableAdditionalIndexes(),
        isLoading: mangoStore.getLoadingIndexes(),
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidUpdate: function () {
      prettyPrint();
    },

    componentDidMount: function () {
      prettyPrint();
      mangoStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      mangoStore.off('change', this.onChange);
    },

    getMangoEditor: function () {
      return this.refs.mangoEditor;
    },

    render: function () {
      var loadLines;
      if (this.state.isLoading) {
        return (
          <div className="editor-wrapper span5 scrollable">
            <ReactComponents.LoadLines />
          </div>
        );
      }

      return (
        <MangoEditor
          ref="mangoEditor"
          description={this.props.description}
          dbName={this.state.database.id}
          onSubmit={this.runQuery}
          title={this.props.editorTitle}
          additionalIndexesText={this.props.additionalIndexesText}
          docs={getDocUrl('MANGO')}
          exampleCode={this.state.queryCode}
          changedQuery={this.state.changedQuery}
          availableIndexes={this.state.availableIndexes}
          additionalIndexes={this.state.additionalIndexes}
          confirmbuttonText="Run Query" />
      );
    },

    runQuery: function (event) {
      event.preventDefault();

      if (!this.getMangoEditor().hasValidCode()) {
        FauxtonAPI.addNotification({
          msg:  'Please fix the Javascript errors and try again.',
          type: 'error',
          clear: true
        });
        return;
      }

      IndexResultActions.runMangoFindQuery({
        database: this.state.database,
        queryCode: this.getMangoEditor().getEditorValue()
      });
    }
  });

  var MangoEditor = React.createClass({
    getDefaultProps: function () {
      return {
        changedQuery: null,
        availableIndexes: null,
        additionalIndexes: null
      };
    },

    render: function () {
      var url = FauxtonAPI.urls('allDocs', 'app', this.props.dbName, '');

      return (
        <div className="editor-wrapper span5 scrollable">
          <PaddedBorderedBox>
            <div
              dangerouslySetInnerHTML={{__html: this.props.description}}
              className="editor-description">
            </div>
          </PaddedBorderedBox>
          <PaddedBorderedBox>
            <strong>Database</strong>
            <div className="db-title">
              <a href={url}>{this.props.dbName}</a>
            </div>
          </PaddedBorderedBox>
          <form className="form-horizontal" onSubmit={this.props.onSubmit}>
            <PaddedBorderedBox>
              <CodeEditor
                id="query-field"
                ref="field"
                title={this.props.title}
                docs={this.props.docs}
                code={this.props.exampleCode}
                disableUnload={true} />
              {this.getChangedQueryText()}
            </PaddedBorderedBox>
            {this.getIndexBox()}
            <div className="padded-box">
              <div className="control-group">
                <ConfirmButton text={this.props.confirmbuttonText} />
              </div>
            </div>
          </form>
        </div>
      );
    },

    getChangedQueryText: function () {
      if (!this.props.changedQuery) {
        return null;
      }

      return (
        <div className="info-changed-query">
          <strong>Info:</strong>
          <div>We changed the default query based on the last Index you created.</div>
        </div>
      );
    },

    getIndexBox: function () {
      if (!this.props.availableIndexes) {
        return null;
      }

      return (
        <PaddedBorderedBox>
          <strong>Your available Indexes:</strong>
          <pre
            className="mango-available-indexes">
            {this.getIndexes('index', this.props.availableIndexes)}
            {this.getIndexes('additonal', this.props.additionalIndexes)}
          </pre>
        </PaddedBorderedBox>
      );
    },

    getIndexes: function (prefix, indexes) {
      if (!indexes) {
        return;
      }

      return indexes.map(function (index, i) {
        var name = MangoHelper.getIndexName(index);

        return (
          <div key={prefix + i}>{name}</div>
        );
      });
    },

    getEditorValue: function () {
      return this.refs.field.getValue();
    },

    getEditor: function () {
      return this.refs.field.getEditor();
    },

    hasValidCode: function () {
      var editor = this.getEditor();
      return editor.hadValidCode();
    }
  });

  var MangoIndexEditorController = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        queryIndexCode: mangoStore.getQueryIndexCode(),
        database: mangoStore.getDatabase(),
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      mangoStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      mangoStore.off('change', this.onChange);
    },

    getMangoEditor: function () {
      return this.refs.mangoEditor;
    },

    render: function () {
      return (
        <MangoEditor
          ref="mangoEditor"
          description={this.props.description}
          dbName={this.state.database.id}
          onSubmit={this.saveQuery}
          title="Index"
          docs={getDocUrl('MANGO')}
          exampleCode={this.state.queryIndexCode}
          confirmbuttonText="Create Index" />
      );
    },

    saveQuery: function (event) {
      event.preventDefault();

      if (!this.getMangoEditor().hasValidCode()) {
        FauxtonAPI.addNotification({
          msg:  'Please fix the Javascript errors and try again.',
          type: 'error',
          clear: true
        });
        return;
      }

      Actions.saveQuery({
        database: this.state.database,
        queryCode: this.getMangoEditor().getEditorValue()
      });
    }
  });

  var Views = {
    MangoIndexEditorController: MangoIndexEditorController,
    MangoQueryEditorController: MangoQueryEditorController
  };

  return Views;
});
