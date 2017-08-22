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
import Actions from './header.actions';
import Constants from '../constants';
import IndexResultStores from '../index-results/stores';
import QueryOptionsStore from '../queryoptions/stores';
import { Button, ButtonGroup } from 'react-bootstrap';

const { indexResultsStore } = IndexResultStores;
const { queryOptionsStore } = QueryOptionsStore;

export default class BulkDocumentHeaderController extends React.Component {
  constructor (props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      selectedLayout: indexResultsStore.getSelectedLayout(),
      bulkDocCollection: indexResultsStore.getBulkDocCollection(),
      isMango: indexResultsStore.getIsMangoResults(),
      //isMangoIndexList: indexResultsStore.getIsMangoIndexResults()
      // isMangoIndexList:
    };
  }

  componentDidMount () {
    indexResultsStore.on('change', this.onChange, this);
    queryOptionsStore.on('change', this.onChange, this);

  }

  componentWillUnmount () {
    indexResultsStore.off('change', this.onChange);
    queryOptionsStore.off('change', this.onChange);
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  render () {
    const {
      changeLayout,
      selectedLayout,
      typeOfIndex
    } = this.props;

    // If the changeLayout function is not undefined, default to using prop values
    // because we're using our new redux store.
    // TODO: migrate completely to redux and eliminate this check.
    const layout = changeLayout ? selectedLayout : this.state.selectedLayout;
    let metadata, json, table;
    if ((typeOfIndex && typeOfIndex === 'view')) {
      metadata = <Button
          className={layout === Constants.LAYOUT_ORIENTATION.METADATA ? 'active' : ''}
          onClick={this.toggleLayout.bind(this, Constants.LAYOUT_ORIENTATION.METADATA)}
        >
          Metadata
        </Button>;
    } else if ((typeOfIndex && typeOfIndex === 'MangoIndex')) {
      return null;
    }

    // reduce doesn't allow for include_docs=true, so we'll prevent JSON and table
    // views since they force include_docs=true when reduce is checked in the
    // query options panel.
    if (!queryOptionsStore.reduce()) {
      table = <Button
          className={layout === Constants.LAYOUT_ORIENTATION.TABLE ? 'active' : ''}
          onClick={this.toggleLayout.bind(this, Constants.LAYOUT_ORIENTATION.TABLE)}
        >
          <i className="fonticon-table" /> Table
        </Button>;

      json = <Button
          className={layout === Constants.LAYOUT_ORIENTATION.JSON ? 'active' : ''}
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
    // this will be present when using redux stores
    const {
      changeLayout,
      selectedLayout,
      fetchDocs,
      fetchParams,
      queryOptionsParams,
      queryOptionsToggleIncludeDocs
    } = this.props;

    if (changeLayout && newLayout !== selectedLayout) {
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

    // fall back to old backbone style logic
    Actions.toggleLayout(newLayout);
    if (!this.state.isMango) {
      Actions.toggleIncludeDocs(newLayout === Constants.LAYOUT_ORIENTATION.METADATA, this.state.bulkDocCollection);
    }
  }
};
