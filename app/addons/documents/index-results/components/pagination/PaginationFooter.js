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
import PagingControls from './PagingControls.js';
import PerPageSelector from './PerPageSelector.js';
import TableControls from './TableControls';

export default class PaginationFooter extends React.Component {
  constructor(props) {
    super(props);
  }

  getPageNumberText () {
    const { docs, pageStart, pageEnd } = this.props;

    if (docs.length === 0) {
      return <span>Showing 0 documents.</span>;
    }

    return <span>Showing document {pageStart} - {pageEnd}.</span>;
  }

  perPageChange (amount) {
    const { updatePerPageResults, fetchParams, queryOptionsParams } = this.props;
    updatePerPageResults(amount, fetchParams, queryOptionsParams);
  }

  nextClicked (event) {
    event.preventDefault();

    const { canShowNext, fetchParams, queryOptionsParams, paginateNext, perPage } = this.props;
    if (canShowNext) {
      paginateNext(fetchParams, queryOptionsParams, perPage);
    }
  }

  previousClicked (event) {
    event.preventDefault();

    const { canShowPrevious, fetchParams, queryOptionsParams, paginatePrevious, perPage } = this.props;
    if (canShowPrevious) {
      paginatePrevious(fetchParams, queryOptionsParams, perPage);
    }
  }

  render () {
    const {
      showPrioritizedEnabled,
      hasResults,
      prioritizedEnabled,
      displayedFields,
      perPage,
      canShowNext,
      canShowPrevious,
      toggleShowAllColumns
    } = this.props;

    return (
      <footer className="index-pagination pagination-footer">
        <PagingControls
          nextClicked={this.nextClicked.bind(this)}
          previousClicked={this.previousClicked.bind(this)}
          canShowNext={canShowNext}
          canShowPrevious={canShowPrevious} />

        <div className="footer-controls">
          <div className="page-controls">
            {showPrioritizedEnabled && hasResults ?
              <TableControls
                prioritizedEnabled={prioritizedEnabled}
                displayedFields={displayedFields}
                toggleShowAllColumns={toggleShowAllColumns} /> : null}
          </div>
          <PerPageSelector perPageChange={this.perPageChange.bind(this)} perPage={perPage} />
          <div className="current-docs">
            {this.getPageNumberText()}
          </div>
        </div>
      </footer>
    );
  }
}
