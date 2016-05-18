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
  '../../../app',
  '../../../core/api',
  'react',
  './mango.stores',
  './mango.actions',
  '../../components/react-components.react',
  '../index-results/actions',
  './mango.helper',
  'react-bootstrap',

  '../../../../assets/js/plugins/prettify'
],

 (app, FauxtonAPI, React, Stores, Actions,
  ReactComponents, IndexResultActions, MangoHelper, ReactBootstrap) => {

  const mangoStore = Stores.mangoStore;
  const getDocUrl = app.helpers.getDocUrl;

  const PaddedBorderedBox = ReactComponents.PaddedBorderedBox;
  const CodeEditorPanel = ReactComponents.CodeEditorPanel;
  const ConfirmButton = ReactComponents.ConfirmButton;
  const StyledSelect = ReactComponents.StyledSelect;
  const BadgeList = ReactComponents.BadgeList;

  const ButtonGroup = ReactBootstrap.ButtonGroup;
  const Button = ReactBootstrap.Button;


  var MangoQueryBuilder = React.createClass({

    getInitialState: function () {
      var state = this.getStoreState();
      state.operator = '$eq';

      return state;
    },

    getStoreState: function () {
      return {
        database: mangoStore.getDatabase(),
        isLoading: mangoStore.getLoadingIndexes(),

        possibleOperators: mangoStore.getPossibleOperators(),
        query: mangoStore.getStringifiedQuery(),
        queryParts: mangoStore.getSelectors(),
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      prettyPrint();
      mangoStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      mangoStore.off('change', this.onChange);
    },

    getOperatorOptions: function () {
      return this.state.possibleOperators.map(function (el, i) {
        return <option key={i} value={el.selector}>{el.text}</option>;
      });
    },

    getSelectOptions: function () {
      return (
        <optgroup label="Select a selector">
          {this.getOperatorOptions()}
        </optgroup>
      );
    },

    selectChange: function (e) {
      this.setState({operator: event.target.value});
    },

    fieldChange: function (e) {
      this.setState({field: event.target.value});
    },

    fieldValueChange: function (e) {
      this.setState({fieldValue: event.target.value});
    },

    maybeAddSelectorKeyUp: function (e) {
      if (e.keyCode !== 13) {
        return;
      }

      if (!this.state.field) {
        return;
      }

      if (!this.state.fieldValue) {
        return;
      }

      this.addSelector();
    },

    addSelector: function () {
      var selector = {
        field: this.state.field,
        operator: this.state.operator,
        fieldValue: this.state.fieldValue
      };

      Actions.addSelector(selector);

      this.setState({
        field: '',
        operator: '$eq',
        fieldValue: ''
      });
    },

    removeSelector: function (label, selector) {
      Actions.removeSelector(selector);
    },

    // XXX
    componentWillUpdate: function (nextProps, nextState) {
      this.refs.field.getEditor().setValue(nextState.query);
    },

    getDataFields: function () {
      return (
          <PaddedBorderedBox>
            <table className="mango-qb-selector-combobox">
              <tbody>
                <tr>
                  <td>
                    Field
                  </td>
                  <td>
                    <input
                      onChange={this.fieldChange}
                      onKeyUp={this.maybeAddSelectorKeyUp}
                      value={this.state.field}
                      type="text"
                      className="mango-select-value"
                      ref="mango-select-field" />
                  </td>
                </tr>
                <tr>
                  <td>
                    Function
                  </td>
                  <td>
                  <StyledSelect
                    selectValue={this.state.fieldValue}
                    selectId="mango-select-function"
                    className={""}
                    selectChange={this.selectChange}
                    selectContent={this.getSelectOptions()} />
                  </td>
                </tr>
                <tr>
                  <td>
                    Value
                  </td>
                  <td>
                    <input
                      onChange={this.fieldValueChange}
                      onKeyUp={this.maybeAddSelectorKeyUp}
                      value={this.state.fieldValue}
                      type="text"
                      className="mango-select-value"
                      ref="mango-select-value" />
                  </td>
                  <td>
                    <ConfirmButton onClick={this.addSelector} text="Add" />
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mango-selector-display">
              <div className="button-wrapper">
                <ButtonGroup className="two-sides-toggle-button">
                  <Button
                    className={'active'}
                  >
                    And
                  </Button>
                  <Button
                    className={'s'}
                  >
                    Or
                  </Button>
                </ButtonGroup>
              </div>

              <BadgeList
                style={{height: '100px'}}
                removeBadge={this.removeSelector}
                elements={this.state.queryParts}
                getLabel={this.getLabel} />
            </div>

          </PaddedBorderedBox>
      );
    },


    getLabel: function (selector) {
      return `${selector.field} : ${selector.fieldValue}`;
    },

    getPreviewField: function () {
      return (
        <PaddedBorderedBox>
          <CodeEditorPanel
            id="query-field"
            allowZenMode={false}
            ref="field"
            title={""}
            docLink={"this.props.docs"}
            defaultCode={this.state.query} />
        </PaddedBorderedBox>
      );
    },

    render: function () {
      return (
        <div className="editor-wrapper">
          <PaddedBorderedBox>
            <div
              dangerouslySetInnerHTML={{__html: this.props.description}}
              className="editor-description">
            </div>
          </PaddedBorderedBox>
          {this.getDataFields()}
          {this.getPreviewField()}
        </div>
      );
    }
  });

  var QueryBuilderController = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        database: mangoStore.getDatabase(),
        builtQuery: mangoStore.getBuiltQuery(),
        isLoading: mangoStore.getLoadingIndexes()
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

    getMangoQueryBuilder: function () {
      return this.refs.mangoQueryBuilder;
    },

    render: function () {
      //if (this.state.isLoading) {
      //  return (
      //    <LoadingEditor />
      //  );
      //}

      return (
        <MangoQueryBuilder
          ref="mangoQueryBuilder"
          description="Start building an ad hoc query below."
          dbName={this.state.database.id}
          onSubmit={this.runQuery}
          title={this.props.editorTitle}
          docs={getDocUrl('MANGO_SEARCH')}
          exampleCode=""
          changedQuery={this.state.builtQuery}
          confirmbuttonText="Run Query" />
      );
    },

    runQuery: function (event) {
      event.preventDefault();
      IndexResultActions.runMangoFindQuery({
        database: this.state.database,
        queryCode: this.getMangoQueryBuilder().getEditorValue()
      });
    }
  });

  var LoadingEditor = React.createClass({
    render: function () {
      return (
        <div className="editor-wrapper">
          <ReactComponents.LoadLines />
        </div>
      );
    }
  });


  const MangoQueryEditorController = React.createClass({
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
        isLoading: mangoStore.getLoadingIndexes()
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
      if (this.state.isLoading) {
        return (
          <LoadingEditor />
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
          docs={getDocUrl('MANGO_SEARCH')}
          exampleCode={this.state.queryCode}
          changedQuery={this.state.changedQuery}
          availableIndexes={this.state.availableIndexes}
          additionalIndexes={this.state.additionalIndexes}
          confirmbuttonText="Run Query" />
      );
    },

    runQuery: function (event) {
      event.preventDefault();

      if (this.getMangoEditor().hasErrors()) {
        FauxtonAPI.addNotification({
          msg: 'Please fix the Javascript errors and try again.',
          type: 'error',
          clear: true
        });
        return;
      }

      IndexResultActions.runMangoFindQuery({
        database: this.state.database,
        queryCode: this.getMangoEditor().getEditorValue(),

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
      var url = '#/' + FauxtonAPI.urls('allDocs', 'app', this.props.dbName, '');

      return (
        <div className="mango-editor-wrapper">
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
              <CodeEditorPanel
                id="query-field"
                ref="field"
                title={this.props.title}
                docLink={this.props.docs}
                defaultCode={this.props.exampleCode} />
              {this.getChangedQueryText()}
            </PaddedBorderedBox>
            {this.getIndexBox()}
            <div className="padded-box">
              <div className="control-group">
                <ConfirmButton text={this.props.confirmbuttonText} id="create-index-btn" showIcon={false} />
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
          <a className="edit-link" href={'#' + FauxtonAPI.urls('mango', 'index-app', this.props.dbName)}>edit</a>
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

    hasErrors: function () {
      return this.getEditor().hasErrors();
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
          docs={getDocUrl('MANGO_INDEX')}
          exampleCode={this.state.queryIndexCode}
          confirmbuttonText="Create Index" />
      );
    },

    saveQuery: function (event) {
      event.preventDefault();

      if (this.getMangoEditor().hasErrors()) {
        FauxtonAPI.addNotification({
          msg: 'Please fix the Javascript errors and try again.',
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
    MangoQueryEditorController: MangoQueryEditorController,
    QueryBuilderController: QueryBuilderController
  };

  return Views;
});
