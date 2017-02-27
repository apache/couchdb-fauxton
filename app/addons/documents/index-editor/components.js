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

import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import Stores from "./stores";
import Actions from "./actions";
import ReactComponents from "../../components/react-components";

var store = Stores.indexEditorStore;
var getDocUrl = app.helpers.getDocUrl;
var StyledSelect = ReactComponents.StyledSelect;
var CodeEditorPanel = ReactComponents.CodeEditorPanel;
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
    const selectContent =
      <optgroup label="Select a document">
        <option value="new-doc">New document</option>
        {this.getDocList()}
      </optgroup>;

    return (
      <div className="design-doc-group control-group">
        <div className="span3">
          <label htmlFor="ddoc">{this.props.designDocLabel}
            {this.getDocLink()}
          </label>
          <StyledSelect
            selectChange={this.selectDesignDoc}
            selectValue={this.props.selectedDesignDocName}
            selectId={"faux__edit-view__design-doc"}
            selectContent={selectContent}
          />
        </div>
        {this.getNewDDocField()}
      </div>
    );
  }
});


var ReduceEditor = React.createClass({

  getStoreState: function () {
    return {
      reduce: store.getReduce(),
      reduceOptions: store.reduceOptions(),
      reduceSelectedOption: store.reduceSelectedOption(),
      hasCustomReduce: store.hasCustomReduce(),
      hasReduce: store.hasReduce()
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
        allowZenMode={false}
        blur={this.updateReduceCode}
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
    this.setState(this.getStoreState());
  },

  componentDidMount: function () {
    store.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    store.off('change', this.onChange);
  }
});


var EditorController = React.createClass({

  getStoreState: function () {
    return {
      database: store.getDatabase(),
      isNewView: store.isNewView(),
      viewName: store.getViewName(),
      designDocs: store.getDesignDocs(),
      designDocList: store.getAvailableDesignDocs(),
      originalViewName: store.getOriginalViewName(),
      originalDesignDocName: store.getOriginalDesignDocName(),
      newDesignDoc: store.isNewDesignDoc(),
      designDocId: store.getDesignDocId(),
      newDesignDocName: store.getNewDesignDocName(),
      saveDesignDoc: store.getSaveDesignDoc(),
      map: store.getMap(),
      isLoading: store.isLoading()
    };
  },

  getInitialState: function () {
    return this.getStoreState();
  },

  onChange: function () {
    this.setState(this.getStoreState());
  },

  componentDidMount: function () {
    store.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    store.off('change', this.onChange);
  },

  // the code editor is a standalone component, so if the user goes from one edit view page to another, we need to
  // force an update of the editor panel
  componentDidUpdate: function (prevProps, prevState) {
    if (this.state.map !== prevState.map && this.refs.mapEditor) {
      this.refs.mapEditor.update();
    }
  },

  saveView: function (e) {
    e.preventDefault();

    if (!this.refs.designDocSelector.validate()) {
      return;
    }

    Actions.saveView({
      database: this.state.database,
      newView: this.state.isNewView,
      viewName: this.state.viewName,
      designDoc: this.state.saveDesignDoc,
      designDocId: this.state.designDocId,
      newDesignDoc: this.state.newDesignDoc,
      originalViewName: this.state.originalViewName,
      originalDesignDocName: this.state.originalDesignDocName,
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

    var pageHeader = (this.state.isNewView) ? 'New View' : 'Edit View';
    var btnLabel = (this.state.isNewView) ? 'Create Document and then Build Index' : 'Save Document and then Build Index';

    var cancelLink = '#' + FauxtonAPI.urls('view', 'showView', encodeURIComponent(this.state.database.id), this.state.designDocId, this.state.viewName);
    return (
      <div className="define-view">
        <form className="form-horizontal view-query-save" onSubmit={this.saveView}>
          <h3 className="simple-header">{pageHeader}</h3>

          <div className="new-ddoc-section">
            <DesignDocSelector
              ref="designDocSelector"
              designDocList={this.state.designDocList}
              selectedDesignDocName={this.state.designDocId}
              newDesignDocName={this.state.newDesignDocName}
              onSelectDesignDoc={Actions.selectDesignDoc}
              onChangeNewDesignDocName={Actions.updateNewDesignDocName}
              docLink={getDocUrl('DESIGN_DOCS')} />
          </div>

          <div className="control-group">
            <label htmlFor="index-name">
              <span>Index name</span>
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
          </div>
          <CodeEditorPanel
            id={'map-function'}
            ref="mapEditor"
            title={"Map function"}
            docLink={getDocUrl('MAP_FUNCS')}
            blur={this.updateMapCode}
            allowZenMode={false}
            defaultCode={this.state.map} />
          <ReduceEditor ref="reduceEditor" />
          <div className="padded-box">
            <div className="control-group">
              <ConfirmButton id="save-view" text={btnLabel} />
              <a href={cancelLink} className="index-cancel-link">Cancel</a>
            </div>
          </div>
        </form>
      </div>
    );
  }
});


export default {
  EditorController: EditorController,
  ReduceEditor: ReduceEditor,
  DesignDocSelector: DesignDocSelector,
  StyledSelect: StyledSelect
};
