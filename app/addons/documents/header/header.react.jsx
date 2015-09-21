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
],

function (app, FauxtonAPI, React, Actions, ReactComponents, IndexResultsStore, IndexResultsActions) {
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

  var indexResultsStore = IndexResultsStore.indexResultsStore;
  var ToggleHeaderButton = ReactComponents.ToggleHeaderButton;
  var MenuDropDown = ReactComponents.MenuDropDown;

  var BulkDocumentHeaderController = React.createClass({
    getCollapseDocsButton: function () {
      return (
        <div className="add-dropdown">
          <div className="dropdown">
            <button data-toggle="dropdown" className="button header-control-box control-view">
              <i className="dropdown-toggle icon fonticon-eye"></i> View
            </button>
            <ul className="dropdown-menu arrow" role="menu" aria-labelledby="dLabel">
              <li>
                <a onClick={this.collapseAllDocuments}>
                  <i className="fonticon-list-alt" />
                  <div>
                    Collapsed View
                  </div>
                </a>
              </li>
              <li>
                <a onClick={this.toggleToNormalJson}>
                  <i className="fonticon-json" />
                  <div>
                    Expanded View
                  </div>
                </a>
              </li>
              <li>
                <a onClick={this.tablelizeView}>
                  <i className="fonticon-table" />
                  <div>
                    Table View
                  </div>
                </a>
              </li>
            </ul>

          </div>
        </div>
      );
    },

    render: function () {
      return (
        <div className='alternative-header'>
          {this.getCollapseDocsButton()}
        </div>
      );
    },

    collapseDocuments: function () {
      Actions.collapseDocuments();
    },

    unCollapseDocuments: function () {
      Actions.unCollapseDocuments();
    },

    toggleToNormalJson: function () {
      Actions.unCollapseAllDocuments();
    },

    collapseAllDocuments: function () {
      Actions.collapseAllDocuments();
    },

    tablelizeView: function () {
      Actions.enableTableView();
    }
  });

  var Views = {
    BulkDocumentHeaderController: BulkDocumentHeaderController,
    ToggleHeaderButton: ToggleHeaderButton
  };

  return Views;

});
