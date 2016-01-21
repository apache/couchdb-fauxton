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
  'addons/documents/changes/actions',
  'addons/documents/changes/stores',
  'addons/fauxton/components.react',
  'addons/components/react-components.react',

  'plugins/prettify'
], function (app, FauxtonAPI, React, Actions, Stores, Components, ReactComponents) {

  var changesStore = Stores.changesStore;
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

  var BadgeList = ReactComponents.BadgeList;

  // the top-level component for the Changes Filter section. Handles hiding/showing of the filters form
  var ChangesHeaderController = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        showTabContent: changesStore.isTabVisible()
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      changesStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      changesStore.off('change', this.onChange);
    },

    toggleFilterSection: function () {
      Actions.toggleTabVisibility();
    },

    render: function () {
      var tabContent = '';
      if (this.state.showTabContent) {
        tabContent = <ChangesTabContent key="changesFilterSection" />;
      }

      return (
        <div className="changes-header-section">
          <ChangesHeaderTab onToggle={this.toggleFilterSection} />
          <ReactCSSTransitionGroup transitionName="toggle-changes-filter" component="div" className="changes-tab-content">
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


  var ChangesTabContent = React.createClass({
    getStoreState: function () {
      return {
        filters: changesStore.getFilters(),
        pollingEnabled: changesStore.pollingEnabled()
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      changesStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      changesStore.off('change', this.onChange);
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    removeFilter: function (label) {
      Actions.removeFilter(label);
    },

    addFilter: function (newFilter) {
      if (_.isEmpty(newFilter)) {
        return;
      }
      Actions.addFilter(newFilter);
    },

    hasFilter: function (filter) {
      return changesStore.hasFilter(filter);
    },

    togglePolling: function () {
      Actions.togglePolling();
    },

    render: function () {
      return (
        <div className="tab-content">
          <div className="tab-pane active" ref="filterTab">
            <div className="changes-header js-filter">
              <div className="changes-polling">
                <input
                  type="checkbox"
                  id="changes-toggle-polling"
                  checked={this.state.pollingEnabled}
                  onChange={this.togglePolling}
                />
                <label htmlFor="changes-toggle-polling">Auto-update changes list</label>
              </div>
              <AddFilterForm tooltip={this.props.tooltip} filter={this.state.filter} addFilter={this.addFilter}
                hasFilter={this.hasFilter} />
              <BadgeList elements={this.state.filters} removeBadge={this.removeFilter} />
            </div>
            <div className="changes-auto-update">
            </div>
          </div>
        </div>
      );
    }
  });


  var AddFilterForm = React.createClass({
    propTypes: {
      addFilter: React.PropTypes.func.isRequired,
      hasFilter: React.PropTypes.func.isRequired
    },

    getInitialState: function () {
      return {
        filter: '',
        error: false
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

      if (this.props.hasFilter(this.state.filter)) {
        this.setState({ error: true });

        // Yuck. This removes the class after the effect has completed so it can occur again. The
        // other option is to use jQuery to add the flash. This seemed slightly less crumby
        var component = this;
        setTimeout(function () {
          component.setState({ error: false });
        }, 1000);
      } else {
        this.props.addFilter(this.state.filter);
        this.setState({ filter: '', error: false });
      }
    },

    componentDidMount: function () {
      this.focusFilterField();
    },

    componentDidUpdate: function () {
      this.focusFilterField();
    },

    focusFilterField: function () {
      React.findDOMNode(this.refs.addItem).focus();
    },

    onChangeFilter: function (e) {
      this.setState({ filter: e.target.value });
    },

    inputClassNames: function () {
      var className = 'js-changes-filter-field';
      if (this.state.error) {
        className += ' errorHighlight';
      }
      return className;
    },

    render: function () {
      return (
        <form className="form-inline js-filter-form" onSubmit={this.submitForm}>
          <fieldset>
            <input type="text" ref="addItem" className={this.inputClassNames()} placeholder="Type a filter"
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
        $(React.findDOMNode(this.refs.tooltip)).tooltip();
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

  var ChangesController = React.createClass({
    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        changes: changesStore.getChanges(),
        databaseName: changesStore.getDatabaseName(),
        isShowingSubset: changesStore.isShowingSubset()
      };
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      changesStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      changesStore.off('change', this.onChange);
    },

    showingSubsetMsg: function () {
      var msg = '';
      if (this.state.isShowingSubset) {
        var numChanges = this.state.changes.length;
        msg = <p className="changes-result-limit">Limiting results to latest <b>{numChanges}</b> changes.</p>;
      }
      return msg;
    },

    getRows: function () {
      return _.map(this.state.changes, function (change) {
        var key = change.id + '-' + change.seq;
        return <ChangeRow change={change} key={key} databaseName={this.state.databaseName} />;
      }, this);
    },

    render: function () {
      return (
        <div className="js-changes-view">
          {this.showingSubsetMsg()}
          {this.getRows()}
        </div>
      );
    }
  });


  var ChangeRow = React.createClass({
    propTypes: function () {
      return {
        change: React.PropTypes.object,
        databaseName: React.PropTypes.string.isRequired
      };
    },

    getInitialState: function () {
      return {
        codeVisible: false
      };
    },

    toggleJSON: function (e) {
      e.preventDefault();
      this.setState({ codeVisible: !this.state.codeVisible });
    },

    getChangesCode: function () {
      var json = '';
      if (this.state.codeVisible) {
        json = <Components.CodeFormat key="changesCodeSection" code={this.getChangeCode()} />;
      }
      return json;
    },

    getChangeCode: function () {
      return {
        changes: this.props.change.changes,
        doc: this.props.change.doc
      };
    },

    render: function () {
      var jsonBtnClasses = 'btn btn-small' + (this.state.codeVisible ? ' btn-secondary' : ' btn-primary');
      var wrapperClass = 'change-wrapper' + (this.props.change.isNew ? ' new-change-row' : '');

      return (
        <div className={wrapperClass}>
          <div className="change-box" data-id={this.props.change.id}>
            <div className="row-fluid">
              <div className="span2">seq</div>
              <div className="span8 change-sequence">{this.props.change.seq}</div>
              <div className="span2 text-right">
                <Components.Clipboard text={this.props.change.seq} />
              </div>
            </div>

            <div className="row-fluid">
              <div className="span2">id</div>
              <div className="span8">
                <ChangeID id={this.props.change.id} deleted={this.props.change.deleted} databaseName={this.props.databaseName} />
              </div>
              <div className="span2 text-right">
                <Components.Clipboard text={this.props.change.id} />
              </div>
            </div>

            <div className="row-fluid">
              <div className="span2">changes</div>
              <div className="span10">
                <button type="button" className={jsonBtnClasses} onClick={this.toggleJSON}>
                  {this.state.codeVisible ? 'Close JSON' : 'View JSON'}
                </button>
              </div>
            </div>

            <ReactCSSTransitionGroup transitionName="toggle-changes-code" component="div" className="changesCodeSectionWrapper">
              {this.getChangesCode()}
            </ReactCSSTransitionGroup>

            <div className="row-fluid">
              <div className="span2">deleted</div>
              <div className="span10">{this.props.change.deleted ? 'True' : 'False'}</div>
            </div>
          </div>
        </div>
      );
    }
  });


  var ChangeID = React.createClass({
    render: function () {
      if (this.props.deleted) {
        return (
          <span className="js-doc-id">{this.props.id}</span>
        );
      } else {
        var link = '#' + FauxtonAPI.urls('document', 'app', this.props.databaseName, this.props.id);
        return (
          <a href={link} className="js-doc-link">{this.props.id}</a>
        );
      }
    }
  });


  return {
    renderHeader: function (el) {
      React.render(<ChangesHeaderController />, el);
    },
    renderChanges: function (el) {
      React.render(<ChangesController />, el);
    },
    remove: function (el) {
      React.unmountComponentAtNode(el);
    },

    ChangesHeaderController: ChangesHeaderController,
    ChangesHeaderTab: ChangesHeaderTab,
    ChangesTabContent: ChangesTabContent,
    ChangesController: ChangesController,
    ChangeRow: ChangeRow
  };

});
