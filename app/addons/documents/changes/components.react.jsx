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
  'react',
  'addons/documents/changes/actions',
  'addons/documents/changes/stores'
], function (React, Actions, Stores) {

  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


  // the top-level component for the Changes Filter section. Handles hiding/showing
  var ChangesHeader = React.createClass({
    getInitialState: function () {
      return {
        showTabContent: Stores.changesHeaderStore.isTabVisible()
      };
    },

    onChange: function () {
      this.setState({
        showTabContent: Stores.changesHeaderStore.isTabVisible()
      });
    },

    componentDidMount: function () {
      Stores.changesHeaderStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      Stores.changesHeaderStore.off('change', this.onChange);
    },

    toggleFilterSection: function () {
      Actions.toggleTabVisibility();
    },

    render: function () {
      var tabContent = '';
      if (this.state.showTabContent) {
        tabContent = <ChangesFilter key="changesFilterSection" />;
      }

      return (
        <div className="changes-header-section">
          <ChangesHeaderTab onToggle={this.toggleFilterSection} />
          <ReactCSSTransitionGroup transitionName="toggleChangesFilter" component="div" className="changes-tab-content">
            {tabContent}
          </ReactCSSTransitionGroup>
        </div>
      );
    }
  });


  var ChangesHeaderTab = React.createClass({
    propTypes: {
      onToggle: React.PropTypes.func.isRequired
    },

    render: function () {
      return (
        <div className="dashboard-upper-menu">
          <ul className="nav nav-tabs" id="db-views-tabs-nav">
            <li>
              <a href="#filter" onClick={this.props.onToggle} data-bypass="true" data-toggle="tab">
                <i className="fonticon fonticon-plus"></i> Filter
              </a>
            </li>
          </ul>
        </div>
      );
    }
  });


  var ChangesFilter = React.createClass({
    getStoreState: function () {
      return {
        filters: Stores.changesFilterStore.getFilters()
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      Stores.changesFilterStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      Stores.changesFilterStore.off('change', this.onChange);
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    getFilters: function () {
      return _.map(this.state.filters, function (filter) {
        return <Filter key={filter} label={filter} />;
      }, this);
    },

    render: function () {
      var filters = this.getFilters();

      return (
        <div className="tab-content">
          <div className="tab-pane active" ref="filterTab">
            <div className="changes-header js-filter">
              <AddFilterForm tooltip={this.props.tooltip} filter={this.state.filter} onSubmit={this.submitForm} />
              <ul className="filter-list">{filters}</ul>
            </div>
          </div>
        </div>
      );
    }
  });


  var AddFilterForm = React.createClass({
    getInitialState: function () {
      return {
        filter: ''
      };
    },

    getDefaultProps: function () {
      return {
        tooltip: ''
      };
    },

    submitForm: function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (_.isEmpty(this.state.filter)) {
        return;
      }
      Actions.addFilter(this.state.filter);
    },

    componentDidMount: function () {
      this.focusFilterField();
    },

    componentDidUpdate: function () {
      this.focusFilterField();
    },

    focusFilterField: function () {
      this.refs.addItem.getDOMNode().focus();
    },

    onChangeFilter: function (e) {
      this.setState({ filter: e.target.value });
    },

    render: function () {
      return (
        <form className="form-inline js-filter-form" onSubmit={this.submitForm}>
          <fieldset>
            <input type="text" ref="addItem" className="js-changes-filter-field" placeholder="Type a filter"
              onChange={this.onChangeFilter} value={this.state.filter} />
            <button type="submit" className="btn btn-primary">Filter</button>
            <div className="help-block">
              <strong ref="helpText">e.g. _design or document ID</strong>
              {' '}
              <FilterTooltip tooltip={this.props.tooltip} />
            </div>
          </fieldset>
        </form>
      );
    }
  });


  var FilterTooltip = React.createClass({
    componentDidMount: function () {
      if (this.props.tooltip) {
        $(this.refs.tooltip.getDOMNode()).tooltip();
      }
    },

    render: function () {
      if (!this.props.tooltip) {
        return false;
      }
      return (
        <i ref="tooltip" className="icon icon-question-sign js-filter-tooltip" data-toggle="tooltip"
          data-original-title={this.props.tooltip}></i>
      );
    }
  });


  var Filter = React.createClass({
    propTypes: {
      label: React.PropTypes.string.isRequired
    },

    remove: function (e) {
      e.preventDefault();
      Actions.removeFilter(this.props.label);
    },

    render: function () {
      return (
        <li>
          <span className="label label-info">{this.props.label}</span>
          <a href="#" className="label label-info js-remove-filter" onClick={this.remove} data-bypass="true">&times;</a>
        </li>
      );
    }
  });


  return {
    renderHeader: function (el) {
      React.render(<ChangesHeader />, el);
    },
    removeHeader: function (el) {
      React.unmountComponentAtNode(el);
    },

    // exposed for testing purposes only
    ChangesHeader: ChangesHeader,
    ChangesHeaderTab: ChangesHeaderTab,
    ChangesFilter: ChangesFilter
  };

});
