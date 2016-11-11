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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import Components from "../components/react-components.react";
import ComponentsStore from "../components/stores";
import ComponentsActions from "../components/actions";
import FauxtonComponentsReact from "..//fauxton/components.react";
import Stores from "./stores";
import Resources from "./resources";
import Actions from "./actions";

import ReactSelect from "react-select";
import {Tooltip, OverlayTrigger} from 'react-bootstrap';

var ToggleHeaderButton = Components.ToggleHeaderButton;
var databasesStore = Stores.databasesStore;
var deleteDbModalStore = ComponentsStore.deleteDbModalStore;
var DeleteDatabaseModal = Components.DeleteDatabaseModal;


var DatabasesController = React.createClass({

  getStoreState: function () {
    return {
      dbList: databasesStore.getDbList(),
      loading: databasesStore.isLoading(),
      showDeleteDatabaseModal: deleteDbModalStore.getShowDeleteDatabaseModal()
    };
  },

  getInitialState: function () {
    return this.getStoreState();
  },

  componentDidMount: function () {
    databasesStore.on('change', this.onChange, this);
    deleteDbModalStore.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    databasesStore.off('change', this.onChange, this);
    deleteDbModalStore.off('change', this.onChange, this);
  },

  onChange: function () {
    if (this.isMounted()) {
      this.setState(this.getStoreState());
    }
  },

  render: function () {
    const {loading, dbList} = this.state;

    return (
      <DatabaseTable
        showDeleteDatabaseModal={this.state.showDeleteDatabaseModal}
        dbList={dbList}
        loading={loading} />
    );
  }
});

const DatabaseTable = React.createClass({

  propTypes: {
    dbList: React.PropTypes.array.isRequired,
    showDeleteDatabaseModal: React.PropTypes.object.isRequired,
    loading: React.PropTypes.bool.isRequired,
  },

  createRows: function (dbList) {
    return dbList.map((item, k) => {
      return (
        <DatabaseRow item={item} key={k} />
      );
    });
  },

  getExtensionColumns: function () {
    var cols = FauxtonAPI.getExtensions('DatabaseTable:head');
    return _.map(cols, function (Item, index) {
      return <Item key={index} />;
    });
  },

  showDeleteDatabaseModal: function (name) {
    ComponentsActions.showDeleteDatabaseModal({
      showDeleteModal: !this.props.showDeleteDatabaseModal.showDeleteModal
    });
  },

  render: function () {
    if (this.props.loading) {
      return (
        <div className="view">
          <Components.LoadLines />
        </div>
      );
    }

    const rows = this.createRows(this.props.dbList);
    return (
      <div className="view">
        <DeleteDatabaseModal
          showHide={this.showDeleteDatabaseModal}
          modalProps={this.props.showDeleteDatabaseModal} />
        <table className="table table-striped fauxton-table-list databases">
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th># of Docs</th>
              {this.getExtensionColumns()}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {rows}
          </tbody>
        </table>
      </div>
    );
  }
});

var DatabaseRow = React.createClass({

  propTypes: {
    row: React.PropTypes.object
  },

  getExtensionColumns: function (row) {
    var cols = FauxtonAPI.getExtensions('DatabaseTable:databaseRow');
    return _.map(cols, function (Item, index) {
      return <Item row={row} key={index} />;
    });
  },

  showDeleteDatabaseModal: function (name) {
    ComponentsActions.showDeleteDatabaseModal({showDeleteModal: true, dbId: name});
  },

  render: function () {
    const {
      item
    } = this.props;

    const {encodedId, id, url, dataSize, docCount, docDelCount, showTombstoneWarning, failed } = item;
    const tombStoneWarning = showTombstoneWarning ?
      (<GraveyardInfo docCount={docCount} docDelCount={docDelCount} />) : null;

    // if the row status failed to load, inform the user
    if (failed) {
      return (
        <tr>
          <td data-name="database-load-fail-name">{id}</td>
          <td colSpan="4" className="database-load-fail">This database failed to load.</td>
        </tr>
      );
    }

    return (
      <tr>
        <td>
          <a href={url}>{id}</a>
        </td>
        <td>{dataSize}</td>
        <td>{docCount} {tombStoneWarning}</td>
        {this.getExtensionColumns(item)}

        <td className="database-actions">
          <a className="db-actions btn fonticon-replicate set-replication-start"
            title={"Replicate " + name}
            href={"#/replication/" + encodedId} />
          <a
            className="db-actions btn icon-lock set-permissions"
            title={"Set permissions for " + name} href={"#/database/" + encodedId + "/permissions"} />
          <a
            className="db-actions btn icon-trash"
            onClick={this.showDeleteDatabaseModal.bind(this, id, encodedId)}
            title={'Delete ' + id} data-bypass="true" />
        </td>
      </tr>
    );
  }
});

const GraveyardInfo = ({docCount, docDelCount}) => {
  const graveyardTitle = `This database has just ${docCount} docs and ${docDelCount} deleted docs`;
  const tooltip = <Tooltip id="graveyard-tooltip">{graveyardTitle}</Tooltip>;

  return (
    <OverlayTrigger placement="top" overlay={tooltip}>
      <i className="js-db-graveyard icon icon-exclamation-sign" title={graveyardTitle}></i>
    </OverlayTrigger>
  );
};

const RightDatabasesHeader = () => {
  return (
    <div className="header-right right-db-header flex-layout flex-row">
      <JumpToDatabaseWidget loadOptions={Actions.fetchAllDbsWithKey} />
      <AddDatabaseWidget />
    </div>
  );
};

var AddDatabaseWidget = React.createClass({

  onTrayToggle: function (e) {
    e.preventDefault();

    this.setState({isPromptVisible: !this.state.isPromptVisible});

    this.refs.newDbTray.toggle(function (shown) {
      if (shown) {
        ReactDOM.findDOMNode(this.refs.newDbName).focus();
      }
    }.bind(this));
  },

  onKeyUpInInput: function (e) {
    if (e.which === 13) {
      this.onAddDatabase();
    }
  },

  getInitialState: function () {
    return {
      isPromptVisible: false
    };
  },

  onAddDatabase: function () {
    var databaseName = ReactDOM.findDOMNode(this.refs.newDbName).value;
    Actions.createNewDatabase(databaseName);
  },

  render: function () {
    var headerButtonContainerClasses = 'header-control-box add-new-database-btn';

    return (
      <div>
        <ToggleHeaderButton
          selected={this.state.isPromptVisible}
          toggleCallback={this.onTrayToggle}
          containerClasses={headerButtonContainerClasses}
          title="Create Database"
          fonticon="fonticon-new-database"
          text="Create Database" />
        <FauxtonComponentsReact.Tray ref="newDbTray" className="new-database-tray">
          <span className="add-on">Create Database</span>
          <input id="js-new-database-name" type="text" onKeyUp={this.onKeyUpInInput} ref="newDbName" className="input-xxlarge" placeholder="Name of database" />
          <a className="btn" id="js-create-database" onClick={this.onAddDatabase}>Create</a>
        </FauxtonComponentsReact.Tray>
      </div>
    );
  }
});

const JumpToDatabaseWidget = ({loadOptions}) => {
  return (
    <div data-name="jump-to-db" className="faux-header__searchboxwrapper">
      <div className="faux-header__searchboxcontainer">

        <ReactSelect.Async
          placeholder="Database name"
          loadOptions={loadOptions}
          clearable={false}
          onChange={({value: databaseName}) => {
            Actions.jumpToDatabase(databaseName);
          }} />

      </div>
    </div>
  );
};
JumpToDatabaseWidget.propTypes = {
  loadOptions: React.PropTypes.func.isRequired
};

var DatabasePagination = React.createClass({

  getDefaultProps: function () {
    return {
      linkPath: '_all_dbs',
      store: databasesStore
    };
  },

  getStoreState: function () {
    const {store} = this.props;

    return {
      totalAmountOfDatabases: store.getTotalAmountOfDatabases(),
      page: store.getPage()
    };
  },

  getInitialState: function () {
    return this.getStoreState();
  },

  componentDidMount: function () {
    const {store} = this.props;

    store.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    const {store} = this.props;
    store.off('change', this.onChange, this);
  },

  onChange: function () {
    this.setState(this.getStoreState());
  },

  render: function () {
    const {page, totalAmountOfDatabases} = this.state;

    const urlPrefix = `#/${this.props.linkPath}?page=`;
    var start = 1 + (page - 1) * FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE;
    var end = Math.min(totalAmountOfDatabases, page * FauxtonAPI.constants.MISC.DEFAULT_PAGE_SIZE);

    return (
      <footer className="all-db-footer pagination-footer">
        <div id="database-pagination">
          <FauxtonComponentsReact.Pagination page={page} total={totalAmountOfDatabases} urlPrefix={urlPrefix} />
        </div>
        <div className="current-databases">
          Showing <span className="all-db-footer__range">{start}&ndash;{end}</span>
          &nbsp;of&nbsp;<span className="all-db-footer__total-db-count">{totalAmountOfDatabases}</span>
          &nbsp;databases.
        </div>
      </footer>
    );
  }
});

export default {
  DatabasesController: DatabasesController,
  DatabaseTable: DatabaseTable,
  DatabaseRow: DatabaseRow,
  RightDatabasesHeader: RightDatabasesHeader,
  GraveyardInfo: GraveyardInfo,
  AddDatabaseWidget: AddDatabaseWidget,
  JumpToDatabaseWidget: JumpToDatabaseWidget,
  DatabasePagination: DatabasePagination
};
