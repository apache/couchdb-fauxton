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

const {BulkActionComponent, MenuDropDown} = Components;

export class ResultsToolBar extends React.Component {
  constructor (props) {
    super(props);
    this.toggleTextOverflow = this.toggleTextOverflow.bind(this);
  }

  shouldComponentUpdate (nextProps) {
    return nextProps.isListDeletable != undefined;
  }

  toggleTextOverflow() {
    if (this.props.resultsStyle.textOverflow === Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL) {
      this.props.setResultsTextOverflow(Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED);
    } else {
      this.props.setResultsTextOverflow(Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL);
    }
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

    // Determine if we need to display the bulk doc header
    let bulkHeader = null;
    if (hasResults || isLoading) {
      bulkHeader = <BulkDocumentHeaderController {...this.props} />;
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
    const isTruncated = this.props.resultsStyle.textOverflow === Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED;
    let textOverflowSwitch = null;
    if (this.props.selectedLayout !== Constants.LAYOUT_ORIENTATION.JSON) {
      textOverflowSwitch = (
        <div className="text-overflow-switch">
          <input
            style={{margin: 6}}
            type="checkbox"
            checked={isTruncated}
            onChange={this.toggleTextOverflow}
          />Truncate values
        </div>
      );
    }
    const densityItems = [{
      title: 'Truncate values',
      onClick: this.toggleTextOverflow,
      icon: this.props.resultsStyle.textOverflow === Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED ? 'fonticon-ok' : ''
    },
    {
      title: 'Show full values',
      onClick: this.toggleTextOverflow,
      icon: this.props.resultsStyle.textOverflow === Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL ? 'fonticon-ok' : ''
    }];
    const fontSizeItems = [{
      title: 'Small',
      onClick: () => { this.props.setFontSize(Constants.INDEX_RESULTS_STYLE.FONT_SIZE_SMALL); },
      icon: this.props.resultsStyle.fontSize === Constants.INDEX_RESULTS_STYLE.FONT_SIZE_SMALL ? 'fonticon-ok' : ''
    },
    {
      title: 'Medium',
      onClick: () => { this.props.setFontSize(Constants.INDEX_RESULTS_STYLE.FONT_SIZE_MEDIUM); },
      icon: this.props.resultsStyle.fontSize === Constants.INDEX_RESULTS_STYLE.FONT_SIZE_MEDIUM ? 'fonticon-ok' : ''
    },
    {
      title: 'Large',
      onClick: () => { this.props.setFontSize(Constants.INDEX_RESULTS_STYLE.FONT_SIZE_LARGE); },
      icon: this.props.resultsStyle.fontSize === Constants.INDEX_RESULTS_STYLE.FONT_SIZE_LARGE ? 'fonticon-ok' : ''
    }];
    const section = [{
      title: 'Display density',
      links: densityItems
    },
    {
      title: 'Font size',
      links: fontSizeItems
    }];
    return (
      <div className="document-result-screen__toolbar">
        {bulkAction}
        {bulkHeader}
        {/* <ResultsOptions /> */}
        <div className='toolbar-dropdown'>
          <MenuDropDown links={section} icon='fonticon-gears' hideArrow={true}/>
        </div>
        {/* {textOverflowSwitch} */}
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
  setResultsTextOverflow: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  hasResults: PropTypes.bool.isRequired,
  isListDeletable: PropTypes.bool,
  partitionKey: PropTypes.string,
  resultsStyle: PropTypes.object.isRequired
};
