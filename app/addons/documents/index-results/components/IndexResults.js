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
import Components from '../index-results.components';

export default class IndexResults extends React.Component {
  constructor (props) {
    super(props);
  }

  componentWillMount () {
    const { fetchAllDocs, queryParams, initialize } = this.props;

    // save the prop params to the state tree as an initialization step
    initialize();

    // now get the docs!
    fetchAllDocs(queryParams.docParams);
  }

  deleteSelectedDocs () {
    const { bulkDeleteDocs, fetchAllDocs, queryParams, selectedDocs } = this.props;
    bulkDeleteDocs(selectedDocs).then(fetchAllDocs(queryParams));
  }

  isSelected (id) {
    const { selectedDocs } = this.props;

    // check whether this id exists in our array of selected docs
    return selectedDocs.findIndex((doc) => {
      return id === doc.id;
    }) > -1;
  }

  docChecked (_id, _rev) {
    const { selectDoc } = this.props;

    // dispatch an action to push this doc on to the array of selected docs
    selectDoc({
      _id: _id,
      _rev: _rev
    });
  }

  render () {
    return (
      <Components.ResultsScreen
        removeItem={this.deleteSelectedDocs.bind(this)}
        hasSelectedItem={this.props.hasDocSelected}
        allDocumentsSelected={this.props.allDocsSelected}
        isSelected={this.isSelected.bind(this)}
        isEditable={this.props.isEditable}
        isListDeletable={this.props.dataForRendering.hasBulkDeletableDoc}
        docChecked={this.docChecked}
        isLoading={this.props.isLoading}
        hasResults={this.props.hasResults}
        textEmptyIndex={this.props.textEmptyIndex}
        results={this.props.dataForRendering}
        selectedLayout={this.props.selectedLayout} />
    );
  }
}
