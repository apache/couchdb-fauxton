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
  "api",
  "react",
  'addons/documents/pagination/actions',
  'addons/documents/index-results/stores',
  ], function (FauxtonAPI, React, Actions, IndexResultsStore) {
    var indexResultsStore = IndexResultsStore.indexResultsStore;

    var IndexPaginationController = React.createClass({

      getStoreState: function () {
        return {
          canShowPrevious: indexResultsStore.canShowPrevious(),
          canShowNext: indexResultsStore.canShowNext(),
          collection: indexResultsStore.getCollection(),
          bulkCollection: indexResultsStore.getBulkDocCollection(),
        };
      },

      getInitialState: function () {
        return this.getStoreState();
      },

      componentDidMount: function () {
        indexResultsStore.on('change', this.onChange, this);
      },

      componentWillUnmount: function () {
        indexResultsStore.off('change', this.onChange);
      },

      onChange: function () {
        this.setState(this.getStoreState());
      },

      nextClicked: function (event) {
        event.preventDefault();
        if (!this.state.canShowNext) { return; }

        var collection = this.state.collection;
        var bulkCollection = this.state.bulkCollection;
        Actions.paginateNext(collection, bulkCollection);
      },

      previousClicked: function (event) {
        event.preventDefault();
        if (!this.state.canShowPrevious) { return; }

        var collection = this.state.collection;
        var bulkCollection = this.state.bulkCollection;
        Actions.paginatePrevious(collection, bulkCollection);
      },

      render: function () {
        var canShowPreviousClassName = '';
        var canShowNextClassName = '';

        if (!this.state.canShowPrevious) {
          canShowPreviousClassName = 'disabled';
        }

        if (!this.state.canShowNext) {
          canShowNextClassName = 'disabled';
        }

        return (
          <div className="documents-pagination">
            <ul className="pagination">
              <li className={canShowPreviousClassName} >
                <a id="previous" onClick={this.previousClicked} className="icon fonticon-left-open" href="#" data-bypass="true"></a>
              </li>
              <li className={canShowNextClassName} >
                <a id="next" onClick={this.nextClicked} className="icon fonticon-right-open" href="#" data-bypass="true"></a>
              </li>
            </ul>
          </div>
        );
      }

    });

    var PerPageSelector = React.createClass({

      perPageChange: function (e) {
        var perPage = parseInt(e.target.value, 10);
        this.props.perPageChange(perPage);
      },

      render: function () {
        return (
          <div id="per-page">
            <label htmlFor="select-per-page" className="drop-down inline">
              Documents per page: &nbsp;
              <select id="select-per-page" onChange={this.perPageChange} value={this.props.perPage.toString()} className="input-small">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>
          </div>
        );
      }

    });

    var AllDocsNumberController = React.createClass({

      getStoreState: function () {
        return {
          totalRows: indexResultsStore.getTotalRows(),
          pageStart: indexResultsStore.getPageStart(),
          pageEnd: indexResultsStore.getPageEnd(),
          perPage: indexResultsStore.getPerPage(),
          prioritizedEnabled: indexResultsStore.getIsPrioritizedEnabled(),
          showPrioritizedFieldToggler: indexResultsStore.getShowPrioritizedFieldToggler(),
          displayedFields: indexResultsStore.getResults().displayedFields,
          collection: indexResultsStore.getCollection(),
          bulkCollection: indexResultsStore.getBulkDocCollection(),
        };
      },

      getInitialState: function () {
        return this.getStoreState();
      },

      componentDidMount: function () {
        indexResultsStore.on('change', this.onChange, this);
      },

      componentWillUnmount: function () {
        indexResultsStore.off('change', this.onChange);
      },

      onChange: function () {
        this.setState(this.getStoreState());
      },

      getPageNumberText: function () {
        if (this.state.totalRows === 0) {
          return <span>Showing 0 documents</span>;
        }

        return <span>Showing document {this.state.pageStart} - {this.state.pageEnd}</span>;
      },

      toggleTableViewType: function () {
        Actions.toggleTableViewType();
      },

      getTableControl: function () {
        if (!this.state.showPrioritizedFieldToggler) {
          return null;
        }

        return (
          <div className="footer-table-control">
            <div className="footer-doc-control-prioritized-wrapper pull-left">
              <label htmlFor="footer-doc-control-prioritized">
                <input
                  id="footer-doc-control-prioritized"
                  checked={this.state.prioritizedEnabled}
                  onChange={this.toggleTableViewType}
                  type="checkbox">
                </input>
                Show all columns
              </label>
            </div>
            {this.getAmountShownFields()}
          </div>
        );
      },

      perPageChange: function (perPage) {
        var collection = this.state.collection;
        var bulkCollection = this.state.bulkCollection;
        Actions.updatePerPage(perPage, collection, bulkCollection);
      },

      getAmountShownFields: function () {
        var fields = this.state.displayedFields;
        if (!fields || this.state.prioritizedEnabled) {
          return null;
        }

        return (
          <div className="pull-right">
            Showing {fields.shown} of {fields.allFieldCount} columns.
          </div>
        );
      },


      render: function () {
        return (
          <div className="footer-controls">
            <div className="page-controls">
              {this.getTableControl()}
            </div>

            <PerPageSelector perPageChange={this.perPageChange} perPage={this.state.perPage} />
            <div className="current-docs">
              {this.getPageNumberText()}
            </div>
          </div>
        );
      }

    });

    var Footer = React.createClass({
      render: function () {
        return (
          <footer className="index-pagination pagination-footer">
            <IndexPaginationController />
            <AllDocsNumberController />
          </footer>
        );
      }
    });

    return {
      AllDocsNumber: AllDocsNumberController,
      PerPageSelector: PerPageSelector,
      Footer: Footer
    };

  });
