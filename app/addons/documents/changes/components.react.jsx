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

  var changesFilterStore = Stores.changesFilterStore;
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


  var ChangesHeader = React.createClass({
    getInitialState: function () {
      return {
        showTabContent: changesFilterStore.isTabVisible()
      };
    },

    componentDidMount: function () {
      changesFilterStore.on('change', this.onChange, this);
    },

    onChange: function () {
      this.setState({
        showTabContent: changesFilterStore.isTabVisible()
      });
    },

    toggleFilterSection: function () {
      Actions.toggleTabVisibility();
    },

    render: function () {
      var tabContent = '';

      if (this.state.showTabContent) {
        tabContent = <ChangesHeaderTabContent key="changesFilterSection" />;
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

  var ChangesHeaderTabContent = React.createClass({
    render: function () {
      return (
        <div className="tab-content">
          <div className="tab-pane active" ref="filterTab">
            <div className="changes-header js-filter">
              <ChangesFilter />
            </div>
          </div>
        </div>
      );
    }
  });

  var ChangesFilter = React.createClass({
    getStoreState: function () {
      return {
        currentFilter: changesFilterStore.getCurrentFilter(),
        filters: changesFilterStore.getFilters()
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    // props belong to the parent, so these aren't stored in the related store
    getDefaultProps: function () {
      return {
        tooltip: ''
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    submitForm: function (e) {
      e.preventDefault();
      e.stopPropagation();

      var filter = this.refs.addItem.getDOMNode().value.trim();
      if (!filter) {
        return;
      }

      Actions.addFilterViewItem(filter);
    },

    componentDidMount: function () {
      changesFilterStore.on('change', this.onChange, this);
      this.focusFilterField();
    },

    componentWillUnmount: function() {
      changesFilterStore.off('change', this.onChange);
    },

    componentDidUpdate: function () {
      this.focusFilterField();
    },

    getFilters: function () {
      return _.map(this.state.filters, function (filter) {
        return <ChangesFilterItem key={filter} label={filter} onRemoveFilter={this.removeFilter} />;
      }, this);
    },

    removeFilter: function (label) {
      Actions.removeFilterViewItem(label);
    },

    focusFilterField: function () {
      this.refs.addItem.getDOMNode().focus();
    },

    onChangeFilter: function (e) {
      Actions.filterChange(e.target.value);
    },

    render: function () {
      var filters = this.getFilters();

      return (
        <div>
          <form className="form-inline js-filter-form" onSubmit={this.submitForm}>
            <fieldset>
              <input type="text" ref="addItem" className="js-changes-filter-field" placeholder="Type a filter"
                onChange={this.onChangeFilter} value={this.state.currentFilter} />
              <button type="submit" className="btn btn-primary">Filter</button>
              <div className="help-block">
                <strong ref="helpText">e.g. _design or document ID</strong>
                {' '}
                <FilterTooltip tooltip={this.props.tooltip} />
              </div>
            </fieldset>
          </form>
          <ul className="filter-list">{filters}</ul>
        </div>
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

  var ChangesFilterItem = React.createClass({
    propTypes: {
      label: React.PropTypes.string.isRequired,
      onRemoveFilter: React.PropTypes.func.isRequired
    },

    removeFilter: function (e) {
      e.preventDefault();
      this.props.onRemoveFilter(this.props.label);
    },

    render: function () {
      return (
        <li>
          <span className="label label-info">{this.props.label}</span>
          <a href="#" className="label label-info js-remove-filter" onClick={this.removeFilter} data-bypass="true">&times;</a>
        </li>
      );
    }
  });


  return {
    render: function (el) {
      React.render(<ChangesHeader />, el);
    },
    remove: function (el) {
      React.unmountComponentAtNode(el);
    },

    // exposed for testing purposes only
    ChangesHeaderTab: ChangesHeaderTab,
    ChangesFilter: ChangesFilter
  };

});
