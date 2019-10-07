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
import React from 'react';
import FauxtonAPI from '../../../core/api';
import GeneralComponents from '../../components/react-components';

export default class SearchForm extends React.Component {
  static propTypes = {
    hasActiveQuery: PropTypes.bool.isRequired,
    searchQuery: PropTypes.string.isRequired,
    searchPerformed: PropTypes.bool.isRequired,
    querySearch: PropTypes.func.isRequired,
    setSearchQuery: PropTypes.func.isRequired,
    searchResults: PropTypes.array
  };

  componentDidMount() {
    this.searchInput.focus();
  }

  componentDidUpdate() {
    prettyPrint();
  }

  querySearch = (e) => {
    e.preventDefault();
    if (this.props.searchQuery.trim() === '') {
      FauxtonAPI.addNotification({
        msg: 'Please enter a search term.',
        type: 'error',
        clear: true
      });
      this.searchInput.focus();
      return;
    }
    const {databaseName, partitionKey, ddocName, indexName, searchQuery} = this.props;
    this.props.querySearch(databaseName, partitionKey, ddocName, indexName, searchQuery);
  };

  getRows = () => {
    const database = encodeURIComponent(this.props.databaseName);
    return this.props.searchResults.map((item) => {
      const doc = {
        header: item.id,
        content: JSON.stringify(item, null, '  '),
        url: FauxtonAPI.urls('document', 'app', database, encodeURIComponent(item.id))
      };
      return <GeneralComponents.Document
        key={item.id}
        keylabel={'id:'}
        doc={doc}
        header={item.id}
        isDeletable={false}
        docContent={doc.content}
        onClick={this.onClick}
        docChecked={() => { }}
        docIdentifier={item.id} />;
    });
  };

  onClick = (id, doc) => {
    if (doc.url) {
      FauxtonAPI.navigate(doc.url);
    }
  };

  onType = (e) => {
    this.props.setSearchQuery(e.target.value);
  };

  getResults = () => {
    if (this.props.hasActiveQuery) {
      return (<GeneralComponents.LoadLines />);
    }

    if (this.props.noResultsWarning) {
      return (<div data-select="search-result-set">{this.props.noResultsWarning}</div>);
    }

    if (!this.props.searchResults) {
      return false;
    }

    if (this.props.searchResults.length === 0) {
      return (<div data-select="search-result-set">No results found.</div>);
    }

    return (
      <div id="doc-list" data-select="search-result-set">
        {this.getRows()}
      </div>
    );
  };

  render() {
    const buttonLabel = this.props.hasActiveQuery ? 'Querying...' : 'Query';
    return (
      <div>
        <form id="search-index-preview-form">
          <span className="input-append">
            <input
              className="span4"
              ref={el => this.searchInput = el}
              type="text"
              placeholder="Enter your search query"
              onChange={this.onType}
              value={this.props.searchQuery} />
            <button className="btn btn-primary" id="search-index-query-button" type="submit" disabled={this.props.hasActiveQuery}
              onClick={this.querySearch}>{buttonLabel}</button>
          </span>
          <a className="help-link" data-bypass="true" href={FauxtonAPI.constants.DOC_URLS.SEARCH_INDEX_QUERIES} target="_blank" rel="noopener noreferrer">
            <i className="icon-question-sign" />
          </a>
        </form>

        {this.getResults()}
      </div>
    );
  }
}
