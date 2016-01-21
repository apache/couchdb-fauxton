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

define([
  'app',
  'api',
  'react',
  'addons/documents/header/header.actions',
  'addons/components/react-components.react',

  'addons/documents/index-results/stores',
  'addons/documents/index-results/actions',
  'libs/react-bootstrap',
  'addons/documents/queryoptions/stores',
],

function (app, FauxtonAPI, React, Actions, ReactComponents,
  IndexResultsStore, IndexResultsActions, ReactBootstrap, QueryOptionsStore) {
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

  var indexResultsStore = IndexResultsStore.indexResultsStore;
  var queryOptionsStore = QueryOptionsStore.queryOptionsStore;


  var ToggleHeaderButton = ReactComponents.ToggleHeaderButton;

  var ButtonGroup = ReactBootstrap.ButtonGroup;
  var Button = ReactBootstrap.Button;


  var BulkDocumentHeaderController = React.createClass({
    getStoreState: function () {
      return {
        selectedView: indexResultsStore.getCurrentViewType(),
        isTableView: indexResultsStore.getIsTableView(),
        includeDocs: queryOptionsStore.getIncludeDocsEnabled(),
        bulkDocCollection: indexResultsStore.getBulkDocCollection()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      indexResultsStore.on('change', this.onChange, this);
      queryOptionsStore.on('change', this.onChange, this);

    },

    componentWillUnmount: function () {
      indexResultsStore.off('change', this.onChange);
      queryOptionsStore.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    render: function () {
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

    toggleIncludeDocs: function () {
      Actions.toggleIncludeDocs(this.state.includeDocs, this.state.bulkDocCollection);
    },

    toggleTableView: function (enable) {
      Actions.toggleTableView(enable);
    }
  });

  var Views = {
    BulkDocumentHeaderController: BulkDocumentHeaderController
  };

  return Views;

});
