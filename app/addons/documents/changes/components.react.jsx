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
  'addons/fauxton/components',
  'plugins/prettify'
], function (app, FauxtonAPI, React, Actions, Stores, Components) {

  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


  // the top-level component for the Changes Filter section. Handles hiding/showing
  var ChangesHeaderController = React.createClass({
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

    removeFilter: function (label) {
      Actions.removeFilter(label);
    },

    getFilters: function () {
      return _.map(this.state.filters, function (filter) {
        return <Filter key={filter} label={filter} removeFilter={this.removeFilter} />;
      }, this);
    },

    addFilter: function (newFilter) {
      if (_.isEmpty(newFilter)) {
        return;
      }
      Actions.addFilter(newFilter);
    },

    hasFilter: function (filter) {
      return Stores.changesFilterStore.hasFilter(filter);
    },

    render: function () {
      var filters = this.getFilters();

      return (
        <div className="tab-content">
          <div className="tab-pane active" ref="filterTab">
            <div className="changes-header js-filter">
              <AddFilterForm tooltip={this.props.tooltip} filter={this.state.filter} addFilter={this.addFilter}
                hasFilter={this.hasFilter} />
              <ul className="filter-list">{filters}</ul>
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
      this.refs.addItem.getDOMNode().focus();
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
      label: React.PropTypes.string.isRequired,
      removeFilter: React.PropTypes.func.isRequired
    },

    removeFilter: function (e) {
      e.preventDefault();
      this.props.removeFilter(this.props.label);
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


  var ChangesController = React.createClass({
    getRows: function () {
      return _.map(this.props.model.changes.models, function(change) {
        return <ChangeRow change={change} key={change.cid} databaseURL={this.props.databaseURL} />;
      }, this);
    },

    componentWillMount: function () {
      //console.log("changing.");
    },

    // filters the list of changes as per whatever the user's entered in the UI
    filterList: function (json) {
      return _.reduce(this.props.filters, function (elements, filter) {
        return _.filter(elements, function (element) {
          var match = false;

          // make deleted searchable
          if (!element.deleted) {
            element.deleted = false;
          }
          _.each(element, function (value) {
            if (new RegExp(filter, 'i').test(value.toString())) {
              match = true;
            }
          });
          return match;
        });

      }, json, this);
    },

    render: function () {
      return (
        <div>
          {this.getRows()}
        </div>
      );
    }
  });


  var ChangeRow = React.createClass({
    getInitialState: function () {

      // I don't see a better way to do this. Having the component set up its own store feels elegant; the ugly part
      // is having to do it like this
      if (!this.store) {
        this.initStore();
      }

      return {
        jsonBtnLabel: this.store.getJsonBtnLabel(),
        showCode: this.store.isCodeVisible()
      };
    },

    initStore: function () {
      this.store = new Stores.ChangeStore();
      this.dispatchToken = FauxtonAPI.dispatcher.register(this.store.dispatch);
    },

    toggleJSON: function (e) {
      e.preventDefault();
      Actions.toggleCodeVisibility();
    },

    onChange: function () {
      this.setState({
        showTabContent: Stores.changesHeaderStore.isTabVisible()
      });
    },

    componentDidMount: function () {
      this.store.on('change', this.onChange, this);
      //prettyPrint(); // TODO

      // set up the clipboards
      new Components.Clipboard({ $el: $(this.refs.copySeq.getDOMNode()) });
      new Components.Clipboard({ $el: $(this.refs.copyId.getDOMNode()) });
    },

    componentWillUnmount: function () {
      this.store.off('change', this.onChange);
    },

    /*
    serialize: function () {
      var json = this.model.changes.toJSON(),
        filteredData = this.createFilteredData(json);

      return {
        database: this.model,
        href: function (db, id) {
          return FauxtonAPI.urls('document', 'app', db, id);
        }
      };
    },
    */

    render: function () {
      var attrs = this.props.change.attributes;
      var code = JSON.stringify({ changes: attrs.changes, doc: attrs.doc }, null, " ");
      var deletedLabel = attrs.deleted ? 'True' : 'False';
      var jsonBtnClasses = "btn btn-small " + ((this.state.showCode) ? 'btn-secondary' : 'btn-primary');

      return (
        <div className="change-wrapper">
          <div className="change-box">
            <div className="row-fluid">
              <div className="span2">seq</div>
              <div className="span8">{attrs.seq}</div>
              <div className="span2 text-right">
                <a href="#" ref="copySeq" data-clipboard-text={attrs.seq} data-bypass="true" title="Copy to clipboard">
                  <i className="fonticon-clipboard"></i>
                </a>
              </div>
            </div>

            <div className="row-fluid">
              <div className="span2">id</div>
              <div className="span8">
                <ChangeID id={attrs.id} deleted={attrs.deleted} databaseURL={this.props.databaseURL} />
              </div>
              <div className="span2 text-right">
                <a href="#" ref="copyId" data-clipboard-text={attrs.id} data-bypass="true" title="Copy to clipboard">
                  <i className="fonticon-clipboard"></i>
                </a>
              </div>
            </div>

            <div className="row-fluid">
              <div className="span2">changes</div>
              <div className="span10">
                <button type="button" className={jsonBtnClasses} onClick={this.toggleJSON}>{this.state.jsonBtnLabel}</button>
              </div>
            </div>

            <ReactCSSTransitionGroup transitionName="toggleChangesCode" component="div">
              <pre className="prettyprint">{code}</pre>
            </ReactCSSTransitionGroup>

            <div className="row-fluid">
              <div className="span2">deleted</div>
              <div className="span10">{deletedLabel}</div>
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
          <span>{this.props.id}</span>
        );
      } else {
//        FauxtonAPI.urls('document', 'app', db, id);

        var link = "#" + this.props.databaseURL + "/" + app.utils.safeURLName(this.props.id);
        return (
          <a href={link}>{this.props.id}</a>
        );
      }
    }
  });


  return {
    renderHeader: function (el) {
      React.render(<ChangesHeaderController />, el);
    },
    renderChanges: function (el, params) {
      React.render(<ChangesController {...params} />, el);
    },
    remove: function (el) {
      React.unmountComponentAtNode(el);
    },

    // exposed for testing purposes only
    ChangesHeaderController: ChangesHeaderController,
    ChangesHeaderTab: ChangesHeaderTab,
    ChangesFilter: ChangesFilter
  };

});
