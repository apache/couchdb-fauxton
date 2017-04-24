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

var BulkDocumentHeaderController = React.createClass({
  getStoreState () {
    return {
      selectedView: indexResultsStore.getCurrentViewType(),
      selectedLayout: indexResultsStore.getSelectedLayout(),
      bulkDocCollection: indexResultsStore.getBulkDocCollection()
    };
  },

  getInitialState () {
    return this.getStoreState();
  },

  componentDidMount () {
    indexResultsStore.on('change', this.onChange, this);
    queryOptionsStore.on('change', this.onChange, this);

  },

  componentWillUnmount () {
    indexResultsStore.off('change', this.onChange);
    queryOptionsStore.off('change', this.onChange);
  },

  onChange () {
    this.setState(this.getStoreState());
  },

  render () {
    const layout = this.state.selectedLayout;

    return (
      <div className="alternative-header">
        <ButtonGroup className="two-sides-toggle-button">
          <Button
            className={layout === Constants.LAYOUT_ORIENTATION.TABLE ? 'active' : ''}
            onClick={this.toggleLayout.bind(this, Constants.LAYOUT_ORIENTATION.TABLE)}
          >
            <i className="fonticon-table" /> Table
          </Button>
          <Button
            className={layout === Constants.LAYOUT_ORIENTATION.METADATA ? 'active' : ''}
            onClick={this.toggleLayout.bind(this, Constants.LAYOUT_ORIENTATION.METADATA)}
          >
            Metadata
          </Button>
          <Button
            className={layout === Constants.LAYOUT_ORIENTATION.JSON ? 'active' : ''}
            onClick={this.toggleLayout.bind(this, Constants.LAYOUT_ORIENTATION.JSON)}
          >
            <i className="fonticon-json" /> JSON
          </Button>
        </ButtonGroup>
      </div>
    );
  },

  toggleLayout: function (layout) {
    Actions.toggleLayout(layout);
    Actions.toggleIncludeDocs(layout === Constants.LAYOUT_ORIENTATION.METADATA, this.state.bulkDocCollection);
  }
});

export default {
  BulkDocumentHeaderController: BulkDocumentHeaderController
};
