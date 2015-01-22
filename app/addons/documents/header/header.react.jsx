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
  'addons/documents/header/header.actions'
],

function (app, FauxtonAPI, React, Stores, Actions) {
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
  var headerBarStore = Stores.headerBarStore;
  var alternativeHeaderBarStore = Stores.alternativeHeaderBarStore;

  // this will be a global component
  var ToggleHeaderButton = React.createClass({
    render: function () {
      var iconClasses = 'icon ' + this.props.fonticon + ' ' + this.props.innerClasses,
          containerClasses = 'button ' + this.props.containerClasses;

      if (this.props.setEnabledClass) {
        containerClasses = containerClasses + ' js-headerbar-togglebutton-selected';
      }

      return (
        <button
          title={this.props.title}
          disabled={this.props.disabled}
          onClick={this.props.toggleCallback}
          className={containerClasses}
          >
          <i className={iconClasses}></i><span>{this.props.text}</span>
        </button>
      );
    }
  });

  var AlternateHeaderControlBarController = React.createClass({
    getStoreState: function () {
      return {
        areDocumentsCollapsed: alternativeHeaderBarStore.getCollapsedState(),
        areAllDocumentsSelected: alternativeHeaderBarStore.getSelectedAllState()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      alternativeHeaderBarStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      alternativeHeaderBarStore.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    render: function () {
      var baseClass = 'header-control-box header-control-square ',
          areAllDocumentsSelected = this.state.areAllDocumentsSelected,
          areDocumentsCollapsed = this.state.areDocumentsCollapsed;

      return (
        <div className='alternative-header'>
          <ToggleHeaderButton
            fonticon={'fonticon-select-all'}
            toggleCallback={this.selectAllDocuments}
            innerClasses={''}
            containerClasses={baseClass + 'control-select-all'}
            text={''}
            setEnabledClass={areAllDocumentsSelected}
            disabled={areAllDocumentsSelected}
            title={'Select all Documents'} />

          <ToggleHeaderButton
            fonticon={'fonticon-deselect-all'}
            toggleCallback={this.selectAllDocuments}
            innerClasses={''}
            containerClasses={baseClass + 'control-de-select-all'}
            text={''}
            setEnabledClass={!areAllDocumentsSelected}
            disabled={!areAllDocumentsSelected}
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
      Actions.toggleSelectAllDocuments();
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
        isToggled: headerBarStore.getStatus(),
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

      $oldHeader.show();
    },

    render: function () {
      var containerClasses = 'header-control-box ' +
        'control-toggle-alternative-header ' + this.state.toggleClass;
      var innerClasses = '';

      var headerbar = null;
      if (this.state.isToggled) {
        headerbar = (<AlternateHeaderControlBarController key={1} />);
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
    AlternateHeaderControlBarController: AlternateHeaderControlBarController,
    HeaderBarController: HeaderBarController,
    ToggleHeaderButton: ToggleHeaderButton
  };

  return Views;

});
