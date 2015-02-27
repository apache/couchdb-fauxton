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
],

function (app, FauxtonAPI, React, Stores, Actions, ReactComponents) {
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
  var headerBarStore = Stores.headerBarStore;
  var bulkDocumentHeaderStore = Stores.bulkDocumentHeaderStore;
  var ToggleHeaderButton = ReactComponents.ToggleHeaderButton;

  var BulkDocumentHeaderController = React.createClass({
    getStoreState: function () {
      return {
        areDocumentsCollapsed: bulkDocumentHeaderStore.getCollapsedState(),
        isDeselectPossible: bulkDocumentHeaderStore.getIsDeselectPossible(),
        isSelectAllPossible: bulkDocumentHeaderStore.getIsSelectAllPossible()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      bulkDocumentHeaderStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      bulkDocumentHeaderStore.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    render: function () {
      var baseClass = 'header-control-box header-control-square ',
          isDeselectPossible = this.state.isDeselectPossible,
          isSelectAllPossible = this.state.isSelectAllPossible,
          areDocumentsCollapsed = this.state.areDocumentsCollapsed;

      return (
        <div className='alternative-header'>
          <ToggleHeaderButton
            fonticon={'fonticon-select-all'}
            toggleCallback={this.selectAllDocuments}
            innerClasses={''}
            containerClasses={baseClass + 'control-select-all'}
            text={''}
            setEnabledClass={!isSelectAllPossible}
            disabled={!isSelectAllPossible}
            title={'Select all Documents'} />

          <ToggleHeaderButton
            fonticon={'fonticon-deselect-all'}
            toggleCallback={this.deSelectAllDocuments}
            innerClasses={''}
            containerClasses={baseClass + 'control-de-select-all'}
            text={''}
            setEnabledClass={!isDeselectPossible}
            disabled={!isDeselectPossible}
            title={'Deselect all Documents'} />

          <ToggleHeaderButton
            fonticon={'fonticon-collapse'}
            toggleCallback={this.toggleCollapseDocuments}
            innerClasses={''}
            containerClasses={baseClass + 'control-collapse'}
            text={''}
            setEnabledClass={areDocumentsCollapsed}
            disabled={areDocumentsCollapsed}
            title={'Collapse all'} />

          <ToggleHeaderButton
            fonticon={'fonticon-expand'}
            toggleCallback={this.toggleCollapseDocuments}
            innerClasses={''}
            containerClasses={baseClass + 'control-expand'}
            text={''}
            setEnabledClass={!areDocumentsCollapsed}
            disabled={!areDocumentsCollapsed}
            title={'Expand all'} />

          <ToggleHeaderButton
            fonticon={'fonticon-trash'}
            toggleCallback={this.deleteSelected}
            innerClasses={''}
            containerClasses={baseClass + 'control-delete'}
            text={''}
            title={'Delete selected'} />

          <ToggleHeaderButton
            fonticon={''}
            toggleCallback={this.cancelView}
            innerClasses={''}
            containerClasses={baseClass + 'control-cancel'}
            text={'Cancel'}
            title={'Switch to other view'} />
        </div>
      );
    },

    toggleCollapseDocuments: function () {
      Actions.toggleCollapseDocuments();
    },

    selectAllDocuments: function () {
      Actions.toggleSelectAllDocuments(false);
    },

    deSelectAllDocuments: function () {
      Actions.toggleSelectAllDocuments(true);
    },

    cancelView: function () {
      Actions.toggleHeaderControls();
    },

    deleteSelected: function () {
      Actions.deleteSelected();
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

    componentWillUnmount: function() {
      headerBarStore.off('change', this.onChange);
    },

    toggleCallback: function () {
      Actions.toggleHeaderControls();
    },

    componentDidUpdate: function () {
      // todo reactify right header (api bar, query options)
      var $oldHeader = $('#api-navbar, #right-header');
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
    renderHeaderController: function (el) {
      React.render(<HeaderBarController/>, el);
    },
    removeHeaderController: function (el) {
      React.unmountComponentAtNode(el);
    },
    BulkDocumentHeaderController: BulkDocumentHeaderController,
    HeaderBarController: HeaderBarController,
    ToggleHeaderButton: ToggleHeaderButton
  };

  return Views;

});
