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

import app from '../../../app';

import FauxtonAPI from '../../../core/api';
import React from 'react';
import Actions from './header.actions';
import Components from '../../components/react-components.react';
import IndexResultStores from '../index-results/stores';
import IndexResultsActions from '../index-results/actions';
import QueryOptionsStore from '../queryoptions/stores';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Button, ButtonGroup } from 'react-bootstrap';

const { indexResultsStore } = IndexResultStores;
const { queryOptionsStore } = QueryOptionsStore;
const { ToggleHeaderButton } = Components;

var BulkDocumentHeaderController = React.createClass({
  getStoreState () {
    return {
      selectedView: indexResultsStore.getCurrentViewType(),
      isTableView: indexResultsStore.getIsTableView(),
      includeDocs: queryOptionsStore.getIncludeDocsEnabled(),
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
    var isTableViewSelected = this.state.isTableView;

    return (
      <div className="alternative-header">
        <ButtonGroup className="two-sides-toggle-button">
          <Button
            className={isTableViewSelected ? '' : 'active'}
            onClick={this.toggleTableView.bind(this, false)}
          >
            <i className="fonticon-json" /> JSON
          </Button>
          <Button
            className={isTableViewSelected ? 'active' : ''}
            onClick={this.toggleTableView.bind(this, true)}
          >
            <i className="fonticon-table" /> Table
          </Button>
        </ButtonGroup>
        {this.props.showIncludeAllDocs ? <ToggleHeaderButton
          toggleCallback={this.toggleIncludeDocs}
          containerClasses="header-control-box control-toggle-include-docs"
          title="Enable/Disable include_docs"
          fonticon={this.state.includeDocs ? 'icon-check' : 'icon-check-empty'}
          iconDefaultClass="icon fontawesome"
          text="" /> : null}  { /* text is set via responsive css */}
      </div>
    );
  },

  toggleIncludeDocs () {
    Actions.toggleIncludeDocs(this.state.includeDocs, this.state.bulkDocCollection);
  },

  toggleTableView: function (enable) {
    Actions.toggleTableView(enable);
  }
});

export default {
  BulkDocumentHeaderController: BulkDocumentHeaderController
};
