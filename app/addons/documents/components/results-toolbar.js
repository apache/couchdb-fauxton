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
import BulkDocumentHeaderController from "../header/header";
import ResultsOptions from './results-options';
import Components from "../../components/react-components";
import Constants from '../constants';
import Helpers from '../helpers';

const {BulkActionComponent} = Components;

export class ResultsToolBar extends React.Component {

  shouldComponentUpdate (nextProps) {
    return nextProps.isListDeletable != undefined;
  }

  render () {
    const {
      hasResults,
      isListDeletable,
      removeItem,
      allDocumentsSelected,
      hasSelectedItem,
      toggleSelectAll,
      isLoading,
      databaseName,
      partitionKey
    } = this.props;

    // Determine if we need to display the bulk action selector
    let bulkAction = null;
    if ((isListDeletable && hasResults) || isLoading) {
      bulkAction = <BulkActionComponent
        removeItem={removeItem}
        isChecked={allDocumentsSelected}
        hasSelectedItem={hasSelectedItem}
        toggleSelect={toggleSelectAll}
        disabled={isLoading}
        title="Select all docs that can be..." />;
    }

    // Determine if we need to display the bulk doc header and result options
    let bulkHeader = null;
    const showDensityOptions = this.props.selectedLayout !== Constants.LAYOUT_ORIENTATION.JSON;
    let resultOptions = null;
    if (hasResults || isLoading) {
      bulkHeader = <BulkDocumentHeaderController {...this.props} />;
      resultOptions = <ResultsOptions
        updateStyle={this.props.updateResultsStyle}
        resultsStyle={this.props.resultsStyle}
        showDensity={showDensityOptions}
      />;
    }

    let createDocumentLink = null;
    if (databaseName) {
      createDocumentLink = (
        <div className="document-result-screen__toolbar-flex-container">
          <a href={Helpers.getNewDocUrl(databaseName, partitionKey)} className="btn save document-result-screen__toolbar-create-btn btn-primary">
            Create Document
          </a>
        </div>
      );
    }

    return (
      <div className="document-result-screen__toolbar">
        {bulkAction}
        {bulkHeader}
        {resultOptions}
        {createDocumentLink}
      </div>
    );
  }
}

ResultsToolBar.propTypes = {
  removeItem: PropTypes.func.isRequired,
  allDocumentsSelected: PropTypes.bool.isRequired,
  hasSelectedItem: PropTypes.bool.isRequired,
  toggleSelectAll: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  hasResults: PropTypes.bool.isRequired,
  isListDeletable: PropTypes.bool,
  partitionKey: PropTypes.string,
  docType: PropTypes.string,
  resultsStyle: PropTypes.object.isRequired,
  updateResultsStyle: PropTypes.func.isRequired
};
