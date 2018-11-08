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
import app from '../../../../app';
import FauxtonAPI from '../../../../core/api';
import ReactComponents from '../../../components/react-components';
import DesignDocSelector from './DesignDocSelector';
import ReduceEditor from './ReduceEditor';

const getDocUrl = app.helpers.getDocUrl;
const {CodeEditorPanel, ConfirmButton, LoadLines} = ReactComponents;

export default class IndexEditor extends Component {

  constructor(props) {
    super(props);
  }

  // the code editor is a standalone component, so if the user goes from one edit view page to another, we need to
  // force an update of the editor panel
  componentDidUpdate(prevProps) {
    if (this.props.map !== prevProps.map && this.mapEditor) {
      this.mapEditor.update();
    }
  }

  saveView(el) {
    el.preventDefault();

    if (!this.designDocSelector.validate()) {
      return;
    }

    this.props.saveView({
      database: this.props.database,
      isNewView: this.props.isNewView,
      viewName: this.props.viewName,
      designDoc: this.props.saveDesignDoc,
      designDocId: this.props.designDocId,
      isNewDesignDoc: this.props.isNewDesignDoc,
      originalViewName: this.props.originalViewName,
      originalDesignDocName: this.props.originalDesignDocName,
      map: this.mapEditor.getValue(),
      reduce: this.reduceEditor.getReduceValue(),
      designDocs: this.props.designDocs
    });
  }

  viewChange(el) {
    this.props.changeViewName(el.target.value);
  }

  updateMapCode(code) {
    this.props.updateMapCode(code);
  }

  render() {
    if (this.props.isLoading) {
      return (
        <div className="define-view">
          <LoadLines />
        </div>
      );
    }

    const pageHeader = (this.props.isNewView) ? 'New View' : 'Edit View';
    const btnLabel = (this.props.isNewView) ? 'Create Document and then Build Index' : 'Save Document and then Build Index';
    const cancelLink = '#' + FauxtonAPI.urls('view', 'showView', this.props.database.id, this.props.designDocId, this.props.viewName);
    return (
      <div className="define-view" >
        <form className="form-horizontal view-query-save" onSubmit={this.saveView.bind(this)}>
          <h3 className="simple-header">{pageHeader}</h3>

          <div className="new-ddoc-section">
            <DesignDocSelector
              ref={(el) => { this.designDocSelector = el; }}
              designDocList={this.props.designDocList}
              selectedDesignDocName={this.props.designDocId}
              newDesignDocName={this.props.newDesignDocName}
              onSelectDesignDoc={this.props.selectDesignDoc}
              onChangeNewDesignDocName={this.props.updateNewDesignDocName}
              docLink={getDocUrl('DESIGN_DOCS')} />
          </div>

          <div className="control-group">
            <label htmlFor="index-name">
              <span>Index name</span>
              <a
                className="help-link"
                data-bypass="true"
                href={getDocUrl('VIEW_FUNCS')}
                target="_blank"
                rel="noopener noreferrer">
                <i className="icon-question-sign"></i>
              </a>
            </label>
            <input
              type="text"
              id="index-name"
              value={this.props.viewName}
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
            defaultCode={this.props.map} />
          <ReduceEditor ref={(el) => { this.reduceEditor = el; }} {...this.props} />
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

IndexEditor.propTypes = {
  isLoading:PropTypes.bool.isRequired,
  isNewView: PropTypes.bool.isRequired,
  database: PropTypes.object.isRequired,
  designDocId: PropTypes.string.isRequired,
  viewName: PropTypes.string.isRequired,
  isNewDesignDoc: PropTypes.bool.isRequired,
  originalViewName: PropTypes.string,
  originalDesignDocName: PropTypes.string,
  designDocs: PropTypes.object,
  saveDesignDoc: PropTypes.object,
  updateNewDesignDocName: PropTypes.func.isRequired,
  changeViewName: PropTypes.func.isRequired,
  updateMapCode: PropTypes.func.isRequired
};
