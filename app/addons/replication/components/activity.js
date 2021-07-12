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
import {DeleteModal} from './modals';
import {ReplicationTable} from './common-table';
import {ReplicationHeader} from './common-activity';
import PaginationFooter from '../../documents/index-results/components/pagination/PaginationFooter';

export default class Activity extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      modalVisible: false,
      unconfirmedDeleteDocId: null
    };
  }

  closeModal () {
    this.setState({
      modalVisible: false,
      unconfirmedDeleteDocId: null
    });
  }

  showModal (doc) {
    this.setState({
      modalVisible: true,
      unconfirmedDeleteDocId: doc
    });
  }

  confirmDeleteDocs () {
    let docs = [];
    if (this.state.unconfirmedDeleteDocId) {
      const doc = this.props.docs.find(doc => doc._id === this.state.unconfirmedDeleteDocId);
      docs.push(doc);
    } else {
      docs = this.props.docs.filter(doc => doc.selected);
    }

    this.props.deleteDocs(docs, this.props.pagination);
    this.closeModal();
  }

  numDocsSelected () {
    return this.props.docs.filter(doc => doc.selected).length;
  }

  render () {
    const {
      onFilterChange,
      activitySort,
      changeActivitySort,
      docs,
      filter,
      selectAllDocs,
      someDocsSelected,
      allDocsSelected,
      selectDoc,
      pageStart,
      pageEnd,
      docsPerPage,
      updatePerPageResults,
      paginateNext,
      paginatePrevious,
      pagination
    } = this.props;

    const {modalVisible} = this.state;
    return (
      <div className="replication__activity">
        <p className="replication__activity-caveat">
          Replications must have a replication document to display in the following table.
        </p>
        <ReplicationHeader
          filter={filter}
          onFilterChange={onFilterChange}
        />
        <ReplicationTable
          someDocsSelected={someDocsSelected}
          allDocsSelected={allDocsSelected}
          selectAllDocs={selectAllDocs}
          docs={docs}
          selectDoc={selectDoc}
          deleteDocs={this.showModal.bind(this)}
          descending={activitySort.descending}
          column={activitySort.column}
          changeSort={changeActivitySort}
        />
        <div className="replication__paginate-footer">
          <PaginationFooter
            hasResults={true}
            showPrioritizedEnabled={false}
            prioritizedEnabled={false}
            canShowNext={pagination.canShowNext}
            canShowPrevious={pagination.page > 1}
            perPage={docsPerPage}
            toggleShowAllColumns={false}
            docs={this.props.docs}
            pageStart={pageStart}
            pageEnd={pageEnd}
            updatePerPageResults={updatePerPageResults}
            paginateNext={paginateNext}
            paginatePrevious={paginatePrevious}
            queryOptionsParams={{}}
            fetchParams={pagination}
          />
        </div>
        <DeleteModal
          isReplicationDB={true}
          multipleDocs={this.numDocsSelected()}
          visible={modalVisible}
          onClose={this.closeModal.bind(this)}
          onClick={this.confirmDeleteDocs.bind(this)}
        />
      </div>
    );
  }
}

Activity.propTypes = {
  docs: PropTypes.array.isRequired,
  filter: PropTypes.string.isRequired,
  selectAllDocs: PropTypes.func.isRequired,
  allDocsSelected: PropTypes.bool.isRequired,
  someDocsSelected: PropTypes.bool.isRequired,
  selectDoc: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  deleteDocs: PropTypes.func.isRequired,
  activitySort: PropTypes.object.isRequired,
  changeActivitySort: PropTypes.func.isRequired
};
