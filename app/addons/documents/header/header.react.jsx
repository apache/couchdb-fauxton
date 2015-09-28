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
  'addons/documents/header/header.stores',
  'addons/documents/header/header.actions',
  'addons/components/react-components.react',
  'addons/documents/index-results/stores',
  'addons/documents/index-results/actions',
],

function (app, FauxtonAPI, React, Stores, Actions, ReactComponents, IndexResultsStore, IndexResultsActions) {
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
  var headerBarStore = Stores.headerBarStore;
  var bulkDocumentHeaderStore = Stores.bulkDocumentHeaderStore;
  var indexResultsStore = IndexResultsStore.indexResultsStore;
  var ToggleHeaderButton = ReactComponents.ToggleHeaderButton;

  var BulkDocumentHeaderController = React.createClass({
    getStoreState: function () {
      return {
        canCollapseDocs: indexResultsStore.canCollapseDocs(),
        canUncollapseDocs: indexResultsStore.canUncollapseDocs(),
        canDeselectAll: indexResultsStore.canDeselectAll(),
        canSelectAll: indexResultsStore.canSelectAll()
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

    render: function () {
      var baseClass = 'header-control-box header-control-square ',
          canDeselectAll = this.state.canDeselectAll,
          canSelectAll = this.state.canSelectAll,
          canCollapseDocs = this.state.canCollapseDocs,
          canUncollapseDocs = this.state.canUncollapseDocs;

      return (
        <div className='alternative-header'>
          <ToggleHeaderButton
            fonticon={'fonticon-select-all'}
            toggleCallback={this.selectAllDocuments}
            containerClasses={baseClass + 'control-select-all'}
            text={''}
            selected={!canSelectAll}
            disabled={!canSelectAll}
            title={'Select all Documents'} />

          <ToggleHeaderButton
            fonticon={'fonticon-deselect-all'}
            toggleCallback={this.deSelectAllDocuments}
            containerClasses={baseClass + 'control-de-select-all'}
            text={''}
            selected={!canDeselectAll}
            disabled={!canDeselectAll}
            title={'Deselect all Documents'} />

          <ToggleHeaderButton
            fonticon={'fonticon-collapse'}
            toggleCallback={this.collapseDocuments}
            containerClasses={baseClass + 'control-collapse'}
            text={''}
            selected={!canCollapseDocs}
            disabled={!canCollapseDocs}
            title={'Collapse Selected'} />

          <ToggleHeaderButton
            fonticon={'fonticon-expand'}
            toggleCallback={this.unCollapseDocuments}
            containerClasses={baseClass + 'control-expand'}
            text={''}
            selected={!canUncollapseDocs}
            disabled={!canUncollapseDocs}
            title={'Expand Selected'} />

          <ToggleHeaderButton
            fonticon={'fonticon-trash'}
            toggleCallback={this.deleteSelected}
            containerClasses={baseClass + 'control-delete'}
            text={''}
            title={'Delete selected'} />

          <ToggleHeaderButton
            fonticon={''}
            toggleCallback={this.cancelView}
            containerClasses={baseClass + 'control-cancel'}
            text={'Cancel'}
            title={'Switch to other view'} />
        </div>
      );
    },

    collapseDocuments: function () {
      Actions.collapseDocuments();
    },

    unCollapseDocuments: function () {
      Actions.unCollapseDocuments();
    },

    selectAllDocuments: function () {
      Actions.selectAllDocuments();
    },

    deSelectAllDocuments: function () {
      Actions.deSelectAllDocuments();
    },

    cancelView: function () {
      Actions.toggleHeaderControls();
    },

    deleteSelected: function () {
      IndexResultsActions.deleteSelected();
    }
  });

  var HeaderBarController = React.createClass({
    getStoreState: function () {
      return {
        isToggled: headerBarStore.getToggleStatus(),
        toggleClass: headerBarStore.getToggleClass()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      headerBarStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      headerBarStore.off('change', this.onChange);
    },

    toggleCallback: function () {
      Actions.toggleHeaderControls();
    },

    componentDidUpdate: function () {
      // todo reactify right header (api bar, query options)
      var $oldHeader = $('#api-navbar, #right-header, #notification-center-btn');
      if (this.state.isToggled) {
        $oldHeader.hide();
        return;
      }

      setTimeout(function () {
        $oldHeader.velocity('fadeIn', 250);
      }, 250);
    },

    render: function () {
      var containerClasses = 'header-control-box ' +
        'control-toggle-alternative-header ' + this.state.toggleClass;
      var innerClasses = '';

      var headerbar = null;
      if (this.state.isToggled) {
        headerbar = (<BulkDocumentHeaderController key={1} />);
      }

      return (
        <div>
          <div>
            <ToggleHeaderButton
              fonticon={'fonticon-ok-circled'}
              toggleCallback={this.toggleCallback}
              containerClasses={containerClasses}
              innerClasses={innerClasses}
              text={'Select'} />
              <ReactCSSTransitionGroup transitionName={'fade'}>
                {headerbar}
              </ReactCSSTransitionGroup>
          </div>
        </div>
      );
    }
  });

  var Views = {
    BulkDocumentHeaderController: BulkDocumentHeaderController,
    HeaderBarController: HeaderBarController,
    ToggleHeaderButton: ToggleHeaderButton
  };

  return Views;

});
