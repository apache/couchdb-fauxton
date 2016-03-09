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
  'react-dom',
  'addons/documents/index-editor/stores',
  'addons/documents/index-editor/actions',
  'addons/fauxton/components',
  'addons/components/react-components.react'
],

function (app, FauxtonAPI, React, ReactDOM, Stores, Actions, Components, ReactComponents) {
  var indexEditorStore = Stores.indexEditorStore;
  var getDocUrl = app.helpers.getDocUrl;
  var StyledSelect = ReactComponents.StyledSelect;
  var CodeEditorPanel = ReactComponents.CodeEditorPanel;
  var PaddedBorderedBox = ReactComponents.PaddedBorderedBox;
  var ConfirmButton = ReactComponents.ConfirmButton;
  var LoadLines = ReactComponents.LoadLines;


  var DesignDocSelector = React.createClass({
    propTypes: {
      designDocList: React.PropTypes.array.isRequired,
      onSelectDesignDoc: React.PropTypes.func.isRequired,
      onChangeNewDesignDocName: React.PropTypes.func.isRequired,
      selectedDesignDocName: React.PropTypes.string.isRequired,
      newDesignDocName: React.PropTypes.string.isRequired,
      designDocLabel: React.PropTypes.string,
      docURL: React.PropTypes.string
    },

    getDefaultProps: function () {
      return {
        designDocLabel: 'Design Document'
      };
    },

    validate: function () {
      if (this.props.selectedDesignDocName === 'new-doc' && this.props.newDesignDocName === '') {
        FauxtonAPI.addNotification({
          msg: 'Please name your design doc.',
          type: 'error'
        });
        ReactDOM.findDOMNode(this.refs.newDesignDoc).focus();
        return false;
      }
      return true;
    },

    getDocList: function () {
      return _.map(this.props.designDocList, function (designDoc) {
        return (<option key={designDoc} value={designDoc}>{designDoc}</option>);
      });
    },

    selectDesignDoc: function (e) {
      this.props.onSelectDesignDoc(e.target.value);
    },

    updateDesignDocName: function (e) {
      this.props.onChangeNewDesignDocName(e.target.value);
    },

    getNewDDocField: function () {
      if (this.props.selectedDesignDocName !== 'new-doc') {
        return;
      }
      return (
        <div id="new-ddoc-section" className="span5">
          <label className="control-label" htmlFor="new-ddoc">_design/</label>
          <div className="controls">
            <input type="text" ref="newDesignDoc" id="new-ddoc" placeholder="newDesignDoc"
               onChange={this.updateDesignDocName}/>
          </div>
        </div>
      );
    },

    getDocLink: function () {
      if (!this.props.docLink) {
        return null;
      }
      return (
        <a className="help-link" data-bypass="true" href={this.props.docLink} target="_blank">
          <i className="icon-question-sign" />
        </a>
      );
    },

    render: function () {
      return (
        <div className="design-doc-group control-group">
          <div className="span3">
            <label htmlFor="ddoc">{this.props.designDocLabel}
              {this.getDocLink()}
            </label>
            <div className="styled-select">
              <label htmlFor="js-backup-list-select">
                <i className="fonticon-down-dir" />
                <select id="ddoc" onChange={this.selectDesignDoc} value={this.props.selectedDesignDocName}>
                  <optgroup label="Select a document">
                    <option value="new-doc">New document</option>
                    {this.getDocList()}
                  </optgroup>
                </select>
              </label>
            </div>
          </div>
          {this.getNewDDocField()}
        </div>
      );
    }
  });


  var ReduceEditor = React.createClass({

    getStoreState: function () {
      return {
        reduce: indexEditorStore.getReduce(),
        reduceOptions: indexEditorStore.reduceOptions(),
        reduceSelectedOption: indexEditorStore.reduceSelectedOption(),
        hasCustomReduce: indexEditorStore.hasCustomReduce(),
        hasReduce: indexEditorStore.hasReduce()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    getOptionsList: function () {
      return _.map(this.state.reduceOptions, function (reduce, i) {
        return <option key={i} value={reduce}>{reduce}</option>;
      }, this);
    },

    getReduceValue: function () {
      if (!this.state.hasReduce) {
        return null;
      }

      if (!this.state.hasCustomReduce) {
        return this.state.reduce;
      }

      return this.refs.reduceEditor.getValue();
    },

    getEditor: function () {
      return this.refs.reduceEditor.getEditor();
    },

    render: function () {
      var reduceOptions = this.getOptionsList(),
          customReduceSection;

      if (this.state.hasCustomReduce) {
        customReduceSection = <CodeEditorPanel
          ref='reduceEditor'
          id='reduce-function'
          title={'Custom Reduce function'}
          defaultCode={this.state.reduce}
          blur={this.updateReduceCode}
        />;
      }

      return (
        <div>
          <div className="control-group">
            <label htmlFor="reduce-function-selector">
              <strong>Reduce (optional)</strong>
              <a
                className="help-link"
                data-bypass="true"
                href={getDocUrl('REDUCE_FUNCS')}
                target="_blank"
              >
                <i className="icon-question-sign"></i>
              </a>
            </label>
            <StyledSelect
              selectContent={reduceOptions}
              selectChange={this.selectChange}
              selectId="reduce-function-selector"
              selectValue={this.state.reduceSelectedOption} />
          </div>

          {customReduceSection}
        </div>
      );
    },

    updateReduceCode: function (code) {
      Actions.updateReduceCode(code);
    },

    selectChange: function (event) {
      Actions.selectReduceChanged(event.target.value);
    },

    onChange: function () {
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    componentDidMount: function () {
      indexEditorStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      indexEditorStore.off('change', this.onChange);
    }
  });

  var DeleteView = React.createClass({
    getStoreState: function () {
      return {
        isNewView: indexEditorStore.isNewView(),
        designDocs: indexEditorStore.getDesignDocs(),
        viewName: indexEditorStore.getViewName(),
        designDocId: indexEditorStore.getDesignDocId(),
        database: indexEditorStore.getDatabase()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    render: function () {
      if (this.state.isNewView) {
        return null;
      }

      return (
        <button onClick={this.deleteView} className="btn btn-danger delete">
          <i className="icon fonticon-cancel-circled"></i>
          Delete
        </button>
      );
    },

    deleteView: function (event) {
      event.preventDefault();

      if (!confirm('Are you sure you want to delete this view?')) {return;}

      Actions.deleteView({
        designDocs: this.state.designDocs,
        viewName: this.state.viewName,
        designDocId: this.state.designDocId,
        database: this.state.database
      });
    }

  });

  var Editor = React.createClass({

    getStoreState: function () {
      return {
        hasViewNameChanged: indexEditorStore.hasViewNameChanged(),
        database: indexEditorStore.getDatabase(),
        isNewView: indexEditorStore.isNewView(),
        viewName: indexEditorStore.getViewName(),
        designDocs: indexEditorStore.getDesignDocs(),
        designDocList: indexEditorStore.getAvailableDesignDocs(),
        hasDesignDocChanged: indexEditorStore.hasDesignDocChanged(),
        newDesignDoc: indexEditorStore.isNewDesignDoc(),
        designDocId: indexEditorStore.getDesignDocId(),
        newDesignDocName: indexEditorStore.getNewDesignDocName(),
        saveDesignDoc: indexEditorStore.getSaveDesignDoc(),
        map: indexEditorStore.getMap(),
        isLoading: indexEditorStore.isLoading()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    onChange: function () {
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    componentDidMount: function () {
      indexEditorStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      indexEditorStore.off('change', this.onChange);
    },

    hasErrors: function () {
      var mapEditorErrors = this.refs.mapEditor.getEditor().hasErrors();
      var customReduceErrors = (indexEditorStore.hasCustomReduce()) ? this.refs.reduceEditor.getEditor().hasErrors() : false;
      return mapEditorErrors || customReduceErrors;
    },

    saveView: function (e) {
      e.preventDefault();

      if (!this.refs.designDocSelector.validate()) {
        return;
      }

      if (this.hasErrors()) {
        FauxtonAPI.addNotification({
          msg:  'Please fix the Javascript errors and try again.',
          type: 'error',
          clear: true
        });
        return;
      }

      Actions.saveView({
        database: this.state.database,
        newView: this.state.isNewView,
        viewName: this.state.viewName,
        designDoc: this.state.saveDesignDoc,
        designDocId: this.state.designDocId,
        newDesignDoc: this.state.newDesignDoc,
        designDocChanged: this.state.hasDesignDocChanged,
        hasViewNameChanged: this.state.hasViewNameChanged,
        map: this.refs.mapEditor.getValue(),
        reduce: this.refs.reduceEditor.getReduceValue(),
        designDocs: this.state.designDocs
      });
    },

    viewChange: function (e) {
      Actions.changeViewName(e.target.value);
    },

    updateMapCode: function (code) {
      Actions.updateMapCode(code);
    },

    render: function () {
      if (this.state.isLoading) {
        return (
          <div className="define-view">
            <LoadLines />
          </div>
        );
      }

      var url = '#/' + FauxtonAPI.urls('allDocs', 'app', this.state.database.id, '');
      return (
        <div className="define-view">
          <PaddedBorderedBox>
            Views are the primary tools for querying and reporting.
          </PaddedBorderedBox>
          <PaddedBorderedBox>
            <strong>Database</strong>
            <div className="db-title">
              <a href={url}>{this.state.database.id}</a>
            </div>
          </PaddedBorderedBox>
          <form className="form-horizontal view-query-save" onSubmit={this.saveView}>

            <div className="new-ddoc-section">
              <PaddedBorderedBox>
                <DesignDocSelector
                  ref="designDocSelector"
                  designDocList={this.state.designDocList}
                  selectedDesignDocName={this.state.designDocId}
                  newDesignDocName={this.state.newDesignDocName}
                  onSelectDesignDoc={Actions.selectDesignDoc}
                  onChangeNewDesignDocName={Actions.updateNewDesignDocName}
                  docLink={getDocUrl('DESIGN_DOCS')} />
              </PaddedBorderedBox>
            </div>

            <div className="control-group">
              <PaddedBorderedBox>
                <label htmlFor="index-name">
                  <strong>Index name</strong>
                  <a
                    className="help-link"
                    data-bypass="true"
                    href={getDocUrl('VIEW_FUNCS')}
                    target="_blank">
                    <i className="icon-question-sign"></i>
                  </a>
                </label>
                <input
                  type="text"
                  id="index-name"
                  value={this.state.viewName}
                  onChange={this.viewChange}
                  placeholder="Index name" />
              </PaddedBorderedBox>
            </div>
            <div className="control-group">
              <PaddedBorderedBox>
                <CodeEditorPanel
                  id={'map-function'}
                  ref="mapEditor"
                  title={"Map function"}
                  docLink={getDocUrl('MAP_FUNCS')}
                  blur={this.updateMapCode}
                  defaultCode={this.state.map} />
              </PaddedBorderedBox>
            </div>
            <PaddedBorderedBox>
              <ReduceEditor ref="reduceEditor" />
            </PaddedBorderedBox>
            <div className="padded-box">
              <div className="control-group">
                <ConfirmButton id="save-view" text="Save Document and Build Index" />
                <DeleteView />
              </div>
            </div>
          </form>
        </div>
      );
    }
  });

  var EditorController = React.createClass({
    render: function () {
      return (
        <div className="editor-wrapper">
          <Editor />
        </div>
      );
    }
  });

  var Views = {
    EditorController: EditorController,
    ReduceEditor: ReduceEditor,
    Editor: Editor,
    DesignDocSelector: DesignDocSelector,
    StyledSelect: StyledSelect
  };

  return Views;
});
