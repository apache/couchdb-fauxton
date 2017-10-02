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
import FauxtonAPI from "../../../../core/api";
import ReactComponents from "../../../components/react-components";
import Stores from "../stores";
import Actions from "../actions";
import DesignDocSelector from './DesignDocSelector';
import ReduceEditor from './ReduceEditor';

const getDocUrl = app.helpers.getDocUrl;
const store = Stores.indexEditorStore;
const {CodeEditorPanel, ConfirmButton, LoadLines} = ReactComponents;

export default class IndexEditor extends Component {

  constructor(props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState() {
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

  // the code editor is a standalone component, so if the user goes from one edit view page to another, we need to
  // force an update of the editor panel
  componentDidUpdate(prevProps, prevState) {
    if (this.state.map !== prevState.map && this.mapEditor) {
      this.mapEditor.update();
    }
  }

  saveView(el) {
    el.preventDefault();

    if (!this.designDocSelector.validate()) {
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
      map: this.mapEditor.getValue(),
      reduce: this.reduceEditor.getReduceValue(),
      designDocs: this.state.designDocs
    });
  }

  viewChange(el) {
    Actions.changeViewName(el.target.value);
  }

  updateMapCode(code) {
    Actions.updateMapCode(code);
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div className="define-view">
          <LoadLines />
        </div>
      );
    }

    const pageHeader = (this.state.isNewView) ? 'New View' : 'Edit View';
    const btnLabel = (this.state.isNewView) ? 'Create Document and then Build Index' : 'Save Document and then Build Index';
    const cancelLink = '#' + FauxtonAPI.urls('view', 'showView', this.state.database.id, this.state.designDocId, this.state.viewName);
    return (
      <div className="define-view" >
        <form className="form-horizontal view-query-save" onSubmit={this.saveView.bind(this)}>
          <h3 className="simple-header">{pageHeader}</h3>

          <div className="new-ddoc-section">
            <DesignDocSelector
              ref={(el) => { this.designDocSelector = el; }}
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
              onChange={this.viewChange.bind(this)}
              placeholder="Index name" />
          </div>
          <CodeEditorPanel
            id={'map-function'}
            ref={(el) => { this.mapEditor = el; }}
            title={"Map function"}
            docLink={getDocUrl('MAP_FUNCS')}
            blur={this.updateMapCode.bind(this)}
            allowZenMode={false}
            defaultCode={this.state.map} />
          <ReduceEditor ref={(el) => { this.reduceEditor = el; }} />
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
}
