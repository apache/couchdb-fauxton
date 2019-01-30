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

import React from 'react';
import Constants from '../constants';
import { Button, ButtonGroup } from 'react-bootstrap';

export default class BulkDocumentHeaderController extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const {
      selectedLayout,
      docType,
      queryOptionsParams,
      fetchUrl
    } = this.props;

    let metadata, json, table;
    if (docType === Constants.INDEX_RESULTS_DOC_TYPE.VIEW) {
      metadata = <Button
        className={selectedLayout === Constants.LAYOUT_ORIENTATION.METADATA ? 'active' : ''}
        onClick={this.toggleLayout.bind(this, Constants.LAYOUT_ORIENTATION.METADATA)}
      >
          Metadata
      </Button>;
    } else if (docType === Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX) {
      return null;
    }

    // Reduce doesn't allow for include_docs=true, so we'll hide the JSON and table modes
    // since they force 'include_docs=true' when reduce is checked in the query options panel.
    const isAllDocsQuery = fetchUrl && fetchUrl.includes('/_all_docs');
    const isMangoQuery = docType === Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY;
    if (isAllDocsQuery || isMangoQuery || (!queryOptionsParams.reduce)) {
      table = <Button
        className={selectedLayout === Constants.LAYOUT_ORIENTATION.TABLE ? 'active' : ''}
        onClick={this.toggleLayout.bind(this, Constants.LAYOUT_ORIENTATION.TABLE)}
      >
        <i className="fonticon-table" /> Table
      </Button>;

      json = <Button
        className={selectedLayout === Constants.LAYOUT_ORIENTATION.JSON ? 'active' : ''}
        onClick={this.toggleLayout.bind(this, Constants.LAYOUT_ORIENTATION.JSON)}
      >
        <i className="fonticon-json" /> JSON
      </Button>;
    }

    return (
      <div className="alternative-header">
        <ButtonGroup className="two-sides-toggle-button">
          {table}
          {metadata}
          {json}
        </ButtonGroup>
      </div>
    );
  }

  toggleLayout (newLayout) {
    const {
      changeLayout,
      selectedLayout,
      fetchDocs,
      fetchParams,
      queryOptionsParams,
      queryOptionsToggleIncludeDocs
    } = this.props;

    if (newLayout !== selectedLayout) {
      // change our layout to JSON, Table, or Metadata
      changeLayout(newLayout);

      queryOptionsParams.include_docs = newLayout !== Constants.LAYOUT_ORIENTATION.METADATA;
      if (newLayout === Constants.LAYOUT_ORIENTATION.TABLE) {
        fetchParams.conflicts = true;
      } else {
        delete fetchParams.conflicts;
      }

      // tell the query options panel we're updating include_docs
      queryOptionsToggleIncludeDocs(!queryOptionsParams.include_docs);
      fetchDocs(fetchParams, queryOptionsParams);
      return;
    }
  }
}
