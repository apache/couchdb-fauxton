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

import app from '../../../app';

import FauxtonAPI from '../../../core/api';
import React from 'react';
import ReactDOM from 'react-dom';
import QueryOptionsStores from './stores';
import Actions from './actions';
import Components from '../../components/react-components.react';

const { connectToStores, TrayWrapper, ToggleHeaderButton, TrayContents } = Components;

const {queryOptionsStore: store} = QueryOptionsStores;

var MainFieldsView = React.createClass({
  propTypes: {
    toggleIncludeDocs: React.PropTypes.func.isRequired,
    includeDocs: React.PropTypes.bool.isRequired,
    reduce: React.PropTypes.bool.isRequired,
    toggleReduce: React.PropTypes.func,
    updateGroupLevel: React.PropTypes.func,
    docURL: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      docURL: FauxtonAPI.constants.DOC_URLS.GENERAL
    };
  },

  toggleIncludeDocs: function (e) {
    this.props.toggleIncludeDocs(e);
  },

  groupLevelChange: function (e) {
    this.props.updateGroupLevel(e.target.value);
  },

  groupLevel: function () {
    if (!this.props.reduce) {
      return null;
    }

    return (
      <label className="drop-down inline" id="qoGroupLevelGroup">
        Group Level
        <select onChange={this.groupLevelChange} id="qoGroupLevel" value={this.props.groupLevel} name="group_level" className="input-small">
          <option value="0">None</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="exact">Exact</option>
        </select>
      </label>
    );
  },

  reduce: function () {
    if (!this.props.showReduce) {
      return null;
    }

    return (
      <span>
        <div className="checkbox inline">
          <input id="qoReduce" name="reduce" onChange={this.props.toggleReduce} type="checkbox" checked={this.props.reduce} />
          <label htmlFor="qoReduce">Reduce</label>
        </div>
        {this.groupLevel()}
      </span>
    );
  },

  render: function () {
    var includeDocs = this.props.includeDocs;
    return (
      <div className="query-group" id="query-options-main-fields">
        <span className="add-on">
          Query Options
          <a className="help-link" href={this.props.docURL} target="_blank" data-bypass="true">
            <i className="icon-question-sign" />
          </a>
        </span>
        <div className="controls-group qo-main-fields-row">
          <div className="row-fluid fieldsets">
            <div className="checkbox inline">
              <input disabled={this.props.reduce} onChange={this.toggleIncludeDocs} id="qoIncludeDocs"
                 name="include_docs" type="checkbox" checked={includeDocs} />
              <label className={this.props.reduce ? 'disabled' : ''} htmlFor="qoIncludeDocs" id="qoIncludeDocsLabel">Include Docs</label>
            </div>
            {this.reduce()}
          </div>
        </div>
      </div>
    );
  }

});

var KeySearchFields = React.createClass({
  toggleByKeys: function () {
    this.props.toggleByKeys();
  },

  toggleBetweenKeys: function () {
    this.props.toggleBetweenKeys();
  },

  updateBetweenKeys: function () {
    this.props.updateBetweenKeys({
      startkey: ReactDOM.findDOMNode(this.refs.startkey).value,
      endkey: ReactDOM.findDOMNode(this.refs.endkey).value,
      include: this.props.betweenKeys.include
    });
  },

  updateInclusiveEnd: function () {
    this.props.updateBetweenKeys({
      include: !this.props.betweenKeys.include,
      startkey: this.props.betweenKeys.startkey,
      endkey: this.props.betweenKeys.endkey
    });
  },

  updateByKeys: function (e) {
    this.props.updateByKeys(e.target.value);
  },

  render: function () {
    var keysGroupClass = 'controls-group well js-query-keys-wrapper ';
    var byKeysClass = 'row-fluid js-keys-section ';
    var betweenKeysClass = byKeysClass;
    var byKeysButtonClass = 'drop-down btn ';
    var betweenKeysButtonClass = byKeysButtonClass;

    if (!this.props.showByKeys && !this.props.showBetweenKeys) {
      keysGroupClass += 'hide';
    }

    if (!this.props.showByKeys) {
      byKeysClass += 'hide';
    } else {
      byKeysButtonClass += 'active';
    }

    if (!this.props.showBetweenKeys) {
      betweenKeysClass += 'hide';
    } else {
      betweenKeysButtonClass += 'active';
    }

    return (
      <div className="query-group" id="query-options-key-search">
        <div className="add-on">Keys</div>
        <div className="btn-group toggle-btns row-fluid">
          <label style={{width: '101px'}} id="byKeys" onClick={this.toggleByKeys} className={byKeysButtonClass}>By Key(s)</label>
          <label style={{width: '101px'}} id="betweenKeys" onClick={this.toggleBetweenKeys} className={betweenKeysButtonClass}>Between Keys</label>
        </div>

        <div className={keysGroupClass}>
          <div className={byKeysClass} id="js-showKeys">
            <div className="controls controls-row">
              <label htmlFor="keys-input" className="drop-down">A key, or an array of keys.</label>
              <textarea value={this.props.byKeys} onChange={this.updateByKeys} id="keys-input" className="input-xxlarge" rows="5" type="text"
                placeholder='Enter either a single key ["123"] or an array of keys ["123", "456"].
A key value is the first parameter emitted in a map function. For example emit("123", 1) the key is "123".'></textarea>
              <div id="keys-error" className="inline-block js-keys-error"></div>
            </div>
          </div>

          <div className={betweenKeysClass} id="js-showStartEnd">
            <div className="controls controls-row">
              <div>
                <label htmlFor="startkey" className="drop-down">Start key</label>
                <input id="startkey" ref="startkey" type="text" onChange={this.updateBetweenKeys} value={this.props.betweenKeys.startkey} placeholder='e.g., "1234"' />
              </div>
              <div>
                <label htmlFor="endkey" className="drop-down">End key</label>
                <input id="endkey" ref="endkey" onChange={this.updateBetweenKeys} value={this.props.betweenKeys.endkey} type="text" placeholder='e.g., "1234"'/>
                <div className="controls include-end-key-row checkbox controls-row inline">
                  <input id="qoIncludeEndKeyInResults" ref="inclusive_end" type="checkbox" onChange={this.updateInclusiveEnd} checked={this.props.betweenKeys.include}/>
                  <label htmlFor="qoIncludeEndKeyInResults">Include End Key in results</label>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
});

var AdditionalParams = React.createClass({
  updateSkip: function (e) {
    e.preventDefault();
    var val = e.target.value;

    //check skip is only numbers
    if (!/^\d*$/.test(val)) {
      FauxtonAPI.addNotification({
        msg: 'Skip can only be a number',
        type: 'error'
      });
      val = this.props.skip;
    }

    this.props.updateSkip(val);
  },

  updateLimit: function (e) {
    e.preventDefault();
    this.props.updateLimit(e.target.value);
  },

  render: function () {
    return (
      <div className="query-group" id="query-options-additional-params">
        <div className="add-on additionalParams">Additional Parameters</div>
        <div className="row-fluid fieldsets">
          <div className="dropdown inline">
            <label className="drop-down">
              Limit
              <select id="qoLimit" onChange={this.updateLimit} name="limit" value={this.props.limit} className="input-small">
                <option value="none">None</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
              </select>
            </label>
          </div>
        </div>
        <div className="row-fluid fieldsets">
          <div className="checkbox inline">
            <input id="qoDescending" type="checkbox" onChange={this.props.toggleDescending} checked={this.props.descending} />
            <label htmlFor="qoDescending">Descending</label>
          </div>
          <div className="dropdown inline">
            <label htmlFor="qoSkip" className="drop-down">
              Skip
              <input value={this.props.skip} onChange={this.updateSkip} className="input-small" type="text" id="qoSkip" placeholder="# of rows" />
            </label>
          </div>
        </div>
      </div>
    );
  }
});

var QueryButtons = React.createClass({
  propTypes: {
    onCancel: React.PropTypes.func.isRequired
  },

  hideTray: function (e) {
    this.props.onCancel();
  },

  render: function () {
    return (
      <div className="controls-group query-group">
        <div id="button-options" className="controls controls-row">
          <button type="submit" className="btn btn-success">
            <i className="fonticon-play icon" />
            Run Query
          </button>
          <a onClick={this.hideTray} className="btn btn-cancel">Cancel</a>
        </div>
      </div>
    );
  }
});

var QueryOptionsController = React.createClass({
  getStoreState () {
    return {
      isVisible: store.isVisible()
    };
  },

  getInitialState () {
    return this.getStoreState();
  },

  onChange () {
    this.setState(this.getStoreState());
  },

  componentDidMount: function () {
    store.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    store.off('change', this.onChange);
  },

  getWrap: function () {
    if (!this.TrayWrapper) {
      this.TrayWrapper = connectToStores(TrayWrapper, [store], function () {

        return {
          includeDocs: store.includeDocs(),
          showBetweenKeys: store.showBetweenKeys(),
          showByKeys: store.showByKeys(),
          betweenKeys: store.betweenKeys(),
          byKeys: store.byKeys(),
          descending: store.descending(),
          skip: store.skip(),
          limit: store.limit(),
          showReduce: store.showReduce(),
          reduce: store.reduce(),
          groupLevel: store.groupLevel(),
          contentVisible: store.getTrayVisible(),
          queryParams: store.getQueryParams()
        };
      });
    }

    return this.TrayWrapper;
  },

  render: function () {
    if (!this.state.isVisible) { return null;}
    const TrayWrapper = this.getWrap();
    return (
      <div id="header-query-options">
        <div id="query-options">
          <TrayWrapper>
            <QueryTray contentVisible={false} />
          </TrayWrapper>
        </div>
      </div>
    );
  }
});

var QueryTray = React.createClass({

  propTypes: {
    contentVisible: React.PropTypes.bool.isRequired
  },

  runQuery: function (e) {
    e.preventDefault();

    Actions.runQuery(this.props.queryParams);
    this.toggleTrayVisibility();
  },

  toggleTrayVisibility: function () {
    Actions.toggleQueryBarVisibility(!this.props.contentVisible);
  },

  closeTray: function () {
    Actions.toggleQueryBarVisibility(false);
  },

  componentDidMount: function () {
    $('body').on('click.QueryTray', function (e) {
      if ($(e.target).closest('#query-options').length) {
        return;
      }
      Actions.toggleQueryBarVisibility(false);
    }.bind(this));
  },

  componentWillUnmount: function () {
    $('body').off('click.QueryTray');
  },

  toggleIncludeDocs: function (e) {
    Actions.toggleIncludeDocs();
  },

  getTray: function () {
    if (!this.props.contentVisible) {
      return null;
    }

    return (
      <TrayContents contentVisible={this.props.contentVisible}
        className="query-options"
        id="query-options-tray">

        <form onSubmit={this.runQuery} className="js-view-query-update custom-inputs">
          <MainFieldsView
            includeDocs={this.props.includeDocs}
            toggleIncludeDocs={this.toggleIncludeDocs}
            showReduce={this.props.showReduce}
            reduce={this.props.reduce}
            toggleReduce={Actions.toggleReduce}
            groupLevel={this.props.groupLevel}
            updateGroupLevel={Actions.updateGroupLevel} />
          <KeySearchFields
            key={1}
            showByKeys={this.props.showByKeys}
            showBetweenKeys={this.props.showBetweenKeys}
            toggleByKeys={Actions.toggleByKeys}
            toggleBetweenKeys={Actions.toggleBetweenKeys}
            betweenKeys={this.props.betweenKeys}
            updateBetweenKeys={Actions.updateBetweenKeys}
            byKeys={this.props.byKeys}
            updateByKeys={Actions.updateByKeys} />
          <AdditionalParams
            descending={this.props.descending}
            toggleDescending={Actions.toggleDescending}
            skip={this.props.skip}
            updateSkip={Actions.updateSkip}
            updateLimit={Actions.updateLimit}
            limit={this.props.limit} />
          <QueryButtons onCancel={this.closeTray} />
        </form>
      </TrayContents>
    );

  },

  render: function () {
    return (
      <div>
        <ToggleHeaderButton
          toggleCallback={this.toggleTrayVisibility}
          containerClasses="header-control-box control-toggle-queryoptions"
          title="Query Options"
          fonticon="fonticon-gears"
          text="Options" />
        {this.getTray()}
      </div>
    );
  }

});

export default {
  QueryOptionsController,
  QueryButtons,
  MainFieldsView,
  KeySearchFields,
  AdditionalParams,
  render: function (el) {
    ReactDOM.render(<QueryOptionsController />, $(el)[0]);
  }
};
