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
  'addons/documents/docs-list/stores',
  'addons/documents/docs-list/actions'
  ], function (FauxtonAPI, React, Stores, Actions) {
    var allDocsListStore = Stores.allDocsListStore;

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

    var AllDocsNumber = React.createClass({

      getStoreState: function () {
        return {
          totalRows: allDocsListStore.getTotalRows(),
          pageStart: allDocsListStore.getPageStart(),
          pageEnd: allDocsListStore.getPageEnd(),
          updateSeq: allDocsListStore.getUpdateSeq(),
          perPage: allDocsListStore.getPerPage()
        };
      },

      getInitialState: function () {
        return this.getStoreState();
      },

      componentDidMount: function() {
        allDocsListStore.on('change', this.onChange, this);
      },

      componentWillUnmount: function() {
        allDocsListStore.off('change', this.onChange);
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

    return {
      AllDocsNumber: AllDocsNumber,
      PerPageSelector: PerPageSelector,
      renderAllDocsNumber: function (el) {
        React.render(<AllDocsNumber/>, el);
      },
      removeAllDocsNumber: function (el) {
        React.unmountComponentAtNode(el);
      }
    };

  });
