import FauxtonAPI from "../../core/api";

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

import PropTypes from 'prop-types';

import React, { Fragment } from "react";
import Components from "../components/react-components";
import ComponentsStore from "../components/stores";
import ComponentsActions from "../components/actions";
import PerPageSelector from '../documents/index-results/components/pagination/PerPageSelector';
import FauxtonComponentsReact from "..//fauxton/components";
import Stores from "./stores";
import Actions from "./actions";

import {Tooltip, OverlayTrigger} from 'react-bootstrap';

const databasesStore = Stores.databasesStore;
const deleteDbModalStore = ComponentsStore.deleteDbModalStore;

const {DeleteDatabaseModal, ToggleHeaderButton, TrayContents} = Components;


class DatabasesController extends React.Component {
  getStoreState = () => {
    return {
      dbList: databasesStore.getDbList(),
      loading: databasesStore.isLoading(),
      showDeleteDatabaseModal: deleteDbModalStore.getShowDeleteDatabaseModal(),
      showPartitionedColumn: databasesStore.isPartitionedDatabasesAvailable(),
      page: databasesStore.getPage(),
      limit: databasesStore.getLimit()
    };
  };

  componentDidMount() {
    databasesStore.on('change', this.onChange, this);
    deleteDbModalStore.on('change', this.onChange, this);
    this.loadData();
  }

  componentDidUpdate(_, prevState) {
    if (prevState.page !== this.state.page || prevState.limit !== this.state.limit) {
      this.loadData();
    }
  }

  loadData() {
    Actions.init({
      page: this.state.page,
      limit: this.state.limit
    });
  }

  componentWillUnmount() {
    databasesStore.off('change', this.onChange, this);
    deleteDbModalStore.off('change', this.onChange, this);
  }

  onChange = () => {
    this.setState(this.getStoreState());
  };

  state = this.getStoreState();

  render() {
    const {loading, dbList} = this.state;

    return (
      <DatabaseTable
        showDeleteDatabaseModal={this.state.showDeleteDatabaseModal}
        dbList={dbList}
        loading={loading}
        showPartitionedColumn={this.state.showPartitionedColumn} />
    );
  }
}

class DatabaseTable extends React.Component {
  static propTypes = {
    dbList: PropTypes.array.isRequired,
    showDeleteDatabaseModal: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    showPartitionedColumn: PropTypes.bool.isRequired
  };

  createRows = (dbList) => {
    return dbList.map((item, k) => {
      return (
        <DatabaseRow item={item} key={k} showPartitionedColumn={this.props.showPartitionedColumn}/>
      );
    });
  };

  getExtensionColumns = () => {
    var cols = FauxtonAPI.getExtensions('DatabaseTable:head');
    return _.map(cols, (Item, index) => {
      return <Item key={index} />;
    });
  };

  showDeleteDatabaseModal = () => {
    ComponentsActions.showDeleteDatabaseModal({
      showDeleteModal: !this.props.showDeleteDatabaseModal.showDeleteModal
    });
  };

  render() {
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
              {this.props.showPartitionedColumn ? (<th>Partitioned</th>) : null}
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
}

class DatabaseRow extends React.Component {
  static propTypes = {
    item: PropTypes.shape({
      id: PropTypes.string.isRequired,
      encodedId: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      failed: PropTypes.bool.isRequired,
      dataSize: PropTypes.string,
      docCount: PropTypes.number,
      docDelCount: PropTypes.number,
      isPartitioned: PropTypes.bool,
      showTombstoneWarning: PropTypes.bool
    }).isRequired,
    showPartitionedColumn: PropTypes.bool.isRequired
  };

  getExtensionColumns = (row) => {
    var cols = FauxtonAPI.getExtensions('DatabaseTable:databaseRow');
    return _.map(cols, (Item, index) => {
      return <Item row={row} key={index} />;
    });
  };

  showDeleteDatabaseModal = (name) => {
    ComponentsActions.showDeleteDatabaseModal({showDeleteModal: true, dbId: name});
  };

  render() {
    const {
      item
    } = this.props;

    const {encodedId, id, url, dataSize, docCount, docDelCount, showTombstoneWarning, failed, isPartitioned } = item;
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
    const partitionedCol = this.props.showPartitionedColumn ?
      (<td>{isPartitioned ? 'Yes' : 'No'}</td>) :
      null;
    return (
      <tr>
        <td>
          <a href={url}>{id}</a>
        </td>
        <td>{dataSize}</td>
        <td>{docCount} {tombStoneWarning}</td>
        {partitionedCol}
        {this.getExtensionColumns(item)}

        <td className="database-actions">
          <a className="db-actions btn fonticon-replicate set-replication-start"
            title={"Replicate " + name}
            href={"#/replication/_create/" + encodedId} />
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
}

const GraveyardInfo = ({docCount, docDelCount}) => {
  const graveyardTitle = `This database has just ${docCount} docs and ${docDelCount} deleted docs`;
  const tooltip = <Tooltip id="graveyard-tooltip">{graveyardTitle}</Tooltip>;

  return (
    <OverlayTrigger placement="top" overlay={tooltip}>
      <i className="js-db-graveyard icon icon-exclamation-sign" title={graveyardTitle}></i>
    </OverlayTrigger>
  );
};

class RightDatabasesHeader extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      showPartitionedOption: databasesStore.isPartitionedDatabasesAvailable()
    };
  }

  componentDidMount() {
    databasesStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    databasesStore.off('change', this.onChange, this);
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  render() {
    return (
      <div className="header-right right-db-header flex-layout flex-row">
        <JumpToDatabaseWidget loadOptions={Actions.fetchAllDbsWithKey} />
        <AddDatabaseWidget showPartitionedOption={this.state.showPartitionedOption}/>
      </div>
    );
  }
}

class AddDatabaseWidget extends React.Component {
  static defaultProps = {
    showPartitionedOption: false
  };

  static propTypes = {
    showPartitionedOption: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isPromptVisible: false,
      databaseName: '',
      partitionedSelected: false
    };

    this.onTrayToggle = this.onTrayToggle.bind(this);
    this.closeTray = this.closeTray.bind(this);
    this.focusInput = this.focusInput.bind(this);
    this.onKeyUpInInput = this.onKeyUpInInput.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onAddDatabase = this.onAddDatabase.bind(this);
    this.onTogglePartitioned = this.onTogglePartitioned.bind(this);
  }

  onTrayToggle () {
    this.setState({isPromptVisible: !this.state.isPromptVisible});
  }

  closeTray () {
    this.setState({isPromptVisible: false});
  }

  focusInput () {
    this.newDbName.focus();
  }

  onKeyUpInInput (e) {
    if (e.which === 13) {
      this.onAddDatabase();
    }
  }

  onChange (e) {
    this.setState({databaseName: e.target.value});
  }

  onAddDatabase () {
    const partitioned = this.props.showPartitionedOption ?
      this.state.partitionedSelected :
      undefined;

    Actions.createNewDatabase(
      this.state.databaseName,
      partitioned
    );
  }

  onTogglePartitioned() {
    this.setState({ partitionedSelected: !this.state.partitionedSelected });
  }

  partitionedCheckobx() {
    if (!this.props.showPartitionedOption) {
      return null;
    }
    return (
      <Fragment>
        <br/>
        <label style={{margin: '10px 10px 0px 0px'}}>
          <input
            id="js-partitioned-db"
            type="checkbox"
            checked={this.state.partitionedSelected}
            onChange={this.onTogglePartitioned}
            style={{margin: '0px 10px 0px 0px'}} />
          Partitioned
        </label>
      </Fragment>
    );
  }

  render() {
    return (
      <div>
        <ToggleHeaderButton
          selected={this.state.isPromptVisible}
          toggleCallback={this.onTrayToggle}
          containerClasses='header-control-box add-new-database-btn'
          title="Create Database"
          fonticon="fonticon-new-database"
          text="Create Database" />
        <TrayContents className="new-database-tray" contentVisible={this.state.isPromptVisible} closeTray={this.closeTray} onEnter={this.focusInput}>
          <span className="add-on">Create Database</span>
          <input
            id="js-new-database-name"
            ref={node => this.newDbName = node}
            type="text"
            value={this.state.databaseName}
            onChange={this.onChange} onKeyUp={this.onKeyUpInInput}
            className="input-xxlarge"
            placeholder="Name of database"
          />
          <a className="btn" id="js-create-database" onClick={this.onAddDatabase}>Create</a>
          { this.partitionedCheckobx() }
        </TrayContents>
      </div>
    );
  }
}


const JumpToDatabaseWidget = ({loadOptions}) => {
  return (
    <div data-name="jump-to-db" className="faux-header__searchboxwrapper">
      <div className="faux-header__searchboxcontainer">

        <Components.ThrottledReactSelectAsync
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
  loadOptions: PropTypes.func.isRequired
};

class DatabasePagination extends React.Component {
  static defaultProps = {
    linkPath: '_all_dbs',
    store: databasesStore
  };

  getStoreState = (props) => {
    const {store} = props;

    return {
      totalAmountOfDatabases: store.getTotalAmountOfDatabases(),
      page: store.getPage(),
      limit: store.getLimit()
    };
  };

  componentDidMount() {
    const {store} = this.props;

    store.on('change', this.onChange, this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState(this.getStoreState(nextProps));
    if (this.props.store) {
      this.props.store.off('change', this.onChange, this);
    }
    const {store} = nextProps;
    store.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    const {store} = this.props;
    store.off('change', this.onChange, this);
  }

  onChange = () => {
    this.setState(this.getStoreState(this.props));
  };

  state = this.getStoreState(this.props);

  onPageLinkClick(pageNumber) {
    const url = `#/${this.props.linkPath}?page=${pageNumber}&limit=${this.state.limit}`;
    FauxtonAPI.navigate(url);
  }

  onPerPageSelected(perPage) {
    const url = `#/${this.props.linkPath}?page=${this.state.page}&limit=${perPage}`;
    FauxtonAPI.navigate(url);
  }

  render() {
    const {limit, page, totalAmountOfDatabases} = this.state;
    const start = 1 + (page - 1) * limit;
    const end = Math.min(totalAmountOfDatabases, page * limit);

    return (
      <footer className="all-db-footer pagination-footer">
        <div id="database-pagination">
          <FauxtonComponentsReact.Pagination
            page={page}
            total={totalAmountOfDatabases}
            perPage={limit}
            onClick={this.onPageLinkClick.bind(this)}
          />
        </div>
        <PerPageSelector label="Databases per page" perPage={limit} perPageChange={this.onPerPageSelected.bind(this)}/>
        <div className="current-databases">
          Showing <span className="all-db-footer__range">{start}&ndash;{end}</span>
          &nbsp;of&nbsp;<span className="all-db-footer__total-db-count">{totalAmountOfDatabases}</span>
          &nbsp;databases.
        </div>
      </footer>
    );
  }
}

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
