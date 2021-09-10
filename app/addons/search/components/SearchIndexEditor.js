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

import FauxtonAPI from '../../../core/api';
import app from '../../../app';
import PropTypes from 'prop-types';
import React from 'react';
import GeneralComponents from '../../components/react-components';
import IndexEditorComponents from '../../documents/index-editor/components';
import Analyzer from './Analyzer';

const DesignDocSelector = IndexEditorComponents.DesignDocSelector;

export default class SearchIndexEditor extends React.Component {
  static defaultProps = {
    isCreatingIndex: true,
    blur: function () { },
    isLoading: true
  };

  static propTypes = {
    isLoading: PropTypes.bool,
    isCreatingIndex: PropTypes.bool,
    database: PropTypes.object.isRequired,
    saveDoc: PropTypes.object.isRequired,
    newDesignDocName: PropTypes.string,
    blur: PropTypes.func,
    setSearchIndexName: PropTypes.func.isRequired,
    searchIndexFunction: PropTypes.string.isRequired,
    saveSearchIndex: PropTypes.func.isRequired,
    selectDesignDoc: PropTypes.func.isRequired,
    updateNewDesignDocName: PropTypes.func.isRequired
  };

  updateSearchIndexName = (e) => {
    this.props.setSearchIndexName(e.target.value);
  };

  saveIndex = (e) => {
    e.preventDefault();

    // pass off validation work to the individual form sections
    if (!this.designDocSelector.validate() || !this.analyzer.validate()) {
      return;
    }

    if (!this.props.searchIndexName.trim()) {
      FauxtonAPI.addNotification({
        msg: 'Please enter the index name.',
        type: 'error',
        clear: true
      });
      return;
    }

    const dDocNameClean = this.props.saveDoc.id.replace(/_design\//, '');
    const encodedPartKey = this.props.partitionKey ? encodeURIComponent(this.props.partitionKey) : '';
    const url = FauxtonAPI.urls('search', 'fragment', encodeURIComponent(this.props.database.id), encodedPartKey,
      encodeURIComponent(dDocNameClean), encodeURIComponent(this.props.searchIndexName));

    this.props.saveSearchIndex(this.props.saveDoc, {
      isCreatingIndex: this.props.isCreatingIndex,
      indexName: this.props.searchIndexName,
      designDocs: this.props.designDocs,
      database: this.props.database,
      indexFunction: this.getIndexFunction(),
      analyzerInfo: this.analyzer.getInfo(),
      lastSavedSearchIndexName: this.props.lastSavedSearchIndexName,
      lastSavedDesignDocName: this.props.lastSavedDesignDocName
    }, url);
  };

  getIndexFunction = () => {
    return this.searchIndexEditor.getValue();
  };

  getDesignDocList = () => {
    return this.props.designDocs.map(function (doc) {
      return doc.id;
    });
  };

  getCancelLink() {
    const encodedDatabase = encodeURIComponent(this.props.database.id);
    const encodedPartitionKey = this.props.partitionKey ? encodeURIComponent(this.props.partitionKey) : '';
    if (!this.props.lastSavedDesignDocName || this.props.isCreatingIndex) {
      return '#' + FauxtonAPI.urls('allDocs', 'app', encodedDatabase, encodedPartitionKey);
    }

    const encodedDDoc = app.utils.getSafeIdForDoc(this.props.lastSavedDesignDocName);
    const encodedIndex = encodeURIComponent(this.props.lastSavedSearchIndexName);
    return '#' + FauxtonAPI.urls('search', 'showIndex', encodedDatabase,
      encodedPartitionKey, encodedDDoc, encodedIndex);
  }

  render() {
    if (this.props.isLoading) {
      return (
        <div className="search-index-page-loading">
          <GeneralComponents.LoadLines />
        </div>
      );
    }
    // If failed to load
    if (!this.props.database) {
      return null;
    }

    const pageHeader = this.props.isCreatingIndex ? 'New Search Index' : 'Edit Search Index';
    const btnLabel = this.props.isCreatingIndex ? 'Create Document and Build Index' : 'Save Document and Build Index';
    return (
      <form className="form-horizontal search-query-save" id="search-index">
        <h3 className="simple-header">{pageHeader}</h3>

        <DesignDocSelector
          ref={node => this.designDocSelector = node}
          designDocLabel="Save to design document"
          designDocList={this.getDesignDocList()}
          isDbPartitioned={this.props.isDbPartitioned}
          newDesignDocName={this.props.newDesignDocName}
          newDesignDocPartitioned={this.props.newDesignDocPartitioned}
          selectedDesignDocName={this.props.ddocName}
          selectedDesignDocPartitioned={this.props.ddocPartitioned}
          onSelectDesignDoc={this.props.selectDesignDoc}
          onChangeNewDesignDocName={this.props.updateNewDesignDocName}
          onChangeNewDesignDocPartitioned={this.props.updateNewDesignDocPartitioned}
          docLink={app.helpers.getDocUrl('DOC_URL_DESIGN_DOCS')} />

        <div className="control-group">
          <label htmlFor="search-name">Index name</label>
          <input type="text" id="search-name" value={this.props.searchIndexName} onChange={this.updateSearchIndexName} />
        </div>

        <GeneralComponents.CodeEditorPanel
          id={'search-function'}
          className="ace-editor-section"
          ref={node => this.searchIndexEditor = node}
          title={"Search index function"}
          allowZenMode={false}
          docLink={app.helpers.getDocUrl('SEARCH_INDEXES')}
          defaultCode={this.props.searchIndexFunction}
          blur={this.props.blur} />

        <Analyzer ref={node => this.analyzer = node} {...this.props}/>

        <div className="control-group">
          <button id="save-index" className="btn btn-primary save" onClick={this.saveIndex}>
            <i className="icon fonticon-ok-circled" />{btnLabel}
          </button>
          <a href={this.getCancelLink()} className="index-cancel-link">Cancel</a>
        </div>
      </form>
    );
  }
}
