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


  const OperatorSelector = ({possibleOperators}) => {
    const options = possibleOperators.map((el, i) => {
      return <option key={i} value={el.operator}>{el.text}</option>;
    });

    return (
      <optgroup label="Select a selector">
        {options}
      </optgroup>
    );
  };

  OperatorSelector.propTypes = {
    possibleOperators: React.PropTypes.array.isRequired,
    selected: React.PropTypes.string
  };

  class MangoQueryBuilderController extends React.Component {

    constructor (props) {
      super(props);

      this.state = this.getStoreState();
      this.state.operator = '$eq';
    }

    getStoreState () {
      return {
        database: mangoStore.getDatabase(),
        isLoading: mangoStore.getLoadingIndexes(),

        possibleOperators: mangoStore.getPossibleOperators(),
        query: mangoStore.getStringifiedQuery(),
        queryParts: mangoStore.getSelectors(),
        builtQuery: mangoStore.getBuiltQuery(),
        logicOperator: mangoStore.getLogicOperator(),
      };
    }

    componentDidMount () {
      mangoStore.on('change', this.onChange, this);
    }

    componentWillUnmount () {
      mangoStore.off('change', this.onChange);
    }

    onChange () {
      this.setState(this.getStoreState());
    }

    getMangoQueryBuilder () {
      return this.refs.mangoQueryBuilder;
    }

    runQuery (e) {
      e.preventDefault();

      IndexResultActions.runMangoFindQuery({
        database: this.state.database,
        queryCode: this.getMangoQueryBuilder().getEditorValue()
      });
    }

    render () {
      //if (this.state.isLoading) {
      //  return (
      //    <LoadingEditor />
      //  );
      //}

      // XXX splat other state
      const {database} = this.state;

      return (
        <MangoQueryBuilder
          {...this.state}
          ref="mangoQueryBuilder"
          description="Start building an ad hoc query below."
          dbName={database.id}
          onSubmit={this.runQuery.bind(this)}
          title={this.props.editorTitle}
          docs={getDocUrl('MANGO_SEARCH')}
          exampleCode=""
          confirmbuttonText="Run Query" />
      );
    }
  };

  class MangoQueryBuilder extends React.Component {

    constructor (props) {
      super(props);

      this.state = {
        field: '',
        fieldValue: '',
        queryParts: [],
        operator: '$eq',
        logicOperator: '$and'
      };
    }

    selectChange (e) {
      this.setState({operator: e.target.value});
    }

    fieldChange (e) {
      this.setState({field: e.target.value});
    }

    fieldValueChange (e) {
      this.setState({fieldValue: e.target.value});
    }

    toggleLogicalOperator (op) {
      this.setState({logicOperator: op});
      Actions.setLogicalOperator({logicOperator: op});
    }

    maybeAddSelectorKeyUp (e) {
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
    }

    addSelector () {
      const selector = {
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

    }

    getSelectOptions () {
      return (
        <OperatorSelector possibleOperators={this.props.possibleOperators} />
      );
    }

    removeSelector (label, selector) {
      Actions.removeSelector(selector);
    }

    componentWillUpdate (nextProps, nextState) {
      if (!nextProps.query) {
        return;
      }
      this.refs.field.getEditor().setValue(nextProps.query);
    }

    getDataFields () {
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
                    onChange={this.fieldChange.bind(this)}
                    onKeyUp={this.maybeAddSelectorKeyUp.bind(this)}
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
                  selectValue={this.state.operator}
                  selectId="mango-select-function"
                  className={""}
                  selectChange={this.selectChange.bind(this)}
                  selectContent={this.getSelectOptions()} />
                </td>
              </tr>
              <tr>
                <td>
                  Value
                </td>
                <td>
                  <input
                    onChange={this.fieldValueChange.bind(this)}
                    onKeyUp={this.maybeAddSelectorKeyUp.bind(this)}
                    value={this.state.fieldValue}
                    type="text"
                    className="mango-select-value"
                    ref="mango-select-value" />
                </td>
                <td>
                  <ConfirmButton onClick={this.addSelector.bind(this)} text="Add" />
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{textAlign: 'center'}} className="mango-selector-display">
            <div className="button-wrapper">
              <ButtonGroup className="two-sides-toggle-button">
                <Button
                  style={{width: '58px'}}
                  className={this.state.logicOperator === '$and' ? 'active' : ''}
                  onClick={this.toggleLogicalOperator.bind(this, '$and')}
                >
                  And
                </Button>
                <Button
                  style={{width: '58px'}}
                  className={this.state.logicOperator === '$and' ? '' : 'active'}
                  onClick={this.toggleLogicalOperator.bind(this, '$or')}
                >
                  Or
                </Button>
              </ButtonGroup>
            </div>
          </div>

          <div style={{minHeight: '40px'}}>
            <BadgeList
              style={{height: '100px'}}
              removeBadge={this.removeSelector.bind(this)}
              elements={this.props.queryParts}
              getLabel={this.getLabel.bind(this)} />
          </div>
        </PaddedBorderedBox>
      );
    }

    getLabel (selector) {
      return `${selector.field} : ${selector.fieldValue}`;
    }

    getPreviewField () {
      return (
        <PaddedBorderedBox>
          <CodeEditorPanel
            id="query-field"
            allowZenMode={false}
            ref="field"
            title={""}
            docLink={"this.props.docs"}
            defaultCode={this.props.query} />
        </PaddedBorderedBox>
      );
    }

    render () {
      return (
        <div className="mango-editor-wrapper">
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
  };

  const LoadingEditor = () => {
    return (
      <div className="editor-wrapper">
        <ReactComponents.LoadLines />
      </div>
    );
  };


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

  const Views = {
    MangoIndexEditorController: MangoIndexEditorController,
    MangoQueryEditorController: MangoQueryEditorController,
    MangoQueryBuilderController: MangoQueryBuilderController
  };

  return Views;
});
