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
import ResultsScreen from './ResultsScreen';

export default class IndexResults extends React.Component {
  constructor (props) {
    super(props);
    const { fetchAllDocs, fetchParams, queryOptionsParams } = this.props;

    // now get the docs!
    fetchAllDocs(fetchParams, queryOptionsParams);
  }

  componentWillUnmount () {
    const { resetState } = this.props;
    resetState();
  }

  deleteSelectedDocs () {
    const { bulkDeleteDocs, fetchParams, selectedDocs } = this.props;
    bulkDeleteDocs(selectedDocs, fetchParams);
  }

  isSelected (id) {
    const { selectedDocs } = this.props;

    // check whether this id exists in our array of selected docs
    return selectedDocs.findIndex((doc) => {
      return id === doc._id;
    }) > -1;
  }

  docChecked (_id, _rev) {
    const { selectDoc, selectedDocs } = this.props;

    // dispatch an action to push this doc on to the array of selected docs
    const doc = {
      _id: _id,
      _rev: _rev,
      _deleted: true
    };

    selectDoc(doc, selectedDocs);
  }

  toggleSelectAll () {
    const {
      docs,
      selectedDocs,
      allDocumentsSelected,
      bulkCheckOrUncheck
    } = this.props;

    bulkCheckOrUncheck(docs, selectedDocs, allDocumentsSelected);
  }

  render () {
    const { results } = this.props;

    return (
      <ResultsScreen
        removeItem={this.deleteSelectedDocs.bind(this)}
        isSelected={this.isSelected.bind(this)}
        docChecked={this.docChecked.bind(this)}
        isListDeletable={results.hasBulkDeletableDoc}
        toggleSelectAll={this.toggleSelectAll.bind(this)}
        {...this.props} />
    );
  }
};
