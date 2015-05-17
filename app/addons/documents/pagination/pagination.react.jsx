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
  'addons/documents/pagination/stores',
  'addons/documents/pagination/actions',
  ], function (FauxtonAPI, React, Stores, Actions) {
    var indexPaginationStore = Stores.indexPaginationStore;

    var IndexPaginationController = React.createClass({

      getStoreState: function () {
        return {
          canShowPrevious: indexPaginationStore.canShowPrevious(),
          canShowNext: indexPaginationStore.canShowNext(),
        };
      },

      getInitialState: function () {
        return this.getStoreState();
      },

      componentDidMount: function () {
        indexPaginationStore.on('change', this.onChange, this);
      },

      componentWillUnmount: function () {
        indexPaginationStore.off('change', this.onChange);
      },

      onChange: function () {
        this.setState(this.getStoreState());
      },

      nextClicked: function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.state.canShowNext) { return; }
        Actions.paginateNext();
      },

      previousClicked: function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.state.canShowPrevious) { return; }
        Actions.paginatePrevious();
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
          <ul className="pagination">
            <li className={canShowPreviousClassName} >
              <a id="previous" onClick={this.previousClicked} className="icon fonticon-left-open" href="#" data-bypass="true"></a>
            </li>
            <li className={canShowNextClassName} >
              <a id="next" onClick={this.nextClicked} className="icon fonticon-right-open" href="#" data-bypass="true"></a>
            </li>
        </ul>
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
              Per page:
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
          totalRows: indexPaginationStore.getTotalRows(),
          pageStart: indexPaginationStore.getPageStart(),
          pageEnd: indexPaginationStore.getPageEnd(),
          updateSeq: indexPaginationStore.getUpdateSeq(),
          perPage: indexPaginationStore.getPerPage()
        };
      },

      getInitialState: function () {
        return this.getStoreState();
      },

      componentDidMount: function () {
        indexPaginationStore.on('change', this.onChange, this);
      },

      componentWillUnmount: function () {
        indexPaginationStore.off('change', this.onChange);
      },

      onChange: function () {
        this.setState(this.getStoreState());
      },

      pageNumber: function () {
        if (this.state.totalRows === 0) {
          return <p> Showing 0 documents. </p>;
        }

        return <p>Showing {this.state.pageStart} - {this.state.pageEnd}</p>;
      },

      updateSequence: function () {
        if (this.state.updateSeq) {
          return <span> Update Sequence: {this.state.updateSeq} </span>;
        }
      },

      perPageChange: function (perPage) {
        Actions.updatePerPage(perPage);
      },

      render: function () {
        return (
          <div>
            <div className="index-indicator">
              {this.pageNumber()}
              {this.updateSequence()}
            </div>
            <PerPageSelector perPageChange={this.perPageChange} perPage={this.state.perPage} />
          </div>
        );
      }

    });

    var Footer = React.createClass({
      render: function () {
        return (
          <footer className="index-pagination pagination-footer">
            <div id="documents-pagination">
              <IndexPaginationController />
            </div>
            <div id="item-numbers">
              <AllDocsNumberController />
            </div>
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
