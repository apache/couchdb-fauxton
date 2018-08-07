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
import React from "react";
import ReactDOM from "react-dom";
import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import Stores from "./stores";
import Actions from "./actions";
import Components from "../../components/react-components";
import ComponentsStore from "../../components/stores";
import ComponentsActions from "../../components/actions";
import IndexEditorActions from "../index-editor/actions";
import IndexEditorComponents from "../index-editor/components";
import GeneralComponents from "../../fauxton/components";
import DocumentHelper from "../../documents/helpers";
import { Collapse, OverlayTrigger, Popover, Modal } from "react-bootstrap";
import "../../../../assets/js/plugins/prettify";

const store = Stores.sidebarStore;
const { DeleteDatabaseModal, LoadLines, MenuDropDown } = Components;
const { DesignDocSelector } = IndexEditorComponents;
const { ConfirmationModal } = GeneralComponents;
const { deleteDbModalStore } = ComponentsStore;

class MainSidebar extends React.Component {
  static propTypes = {
    selectedNavItem: PropTypes.string.isRequired
  };

  getNewButtonLinks = () => {  // these are links for the sidebar '+' on All Docs and All Design Docs
    return DocumentHelper.getNewButtonLinks(this.props.databaseName);
  };

  buildDocLinks = () => {
    const base = FauxtonAPI.urls('base', 'app', this.props.databaseName);
    return FauxtonAPI.getExtensions('docLinks').map((link) => {
      return (
        <li key={link.url} className={this.getNavItemClass(link.url)}>
          <a id={link.url} href={base + link.url}>{link.title}</a>
        </li>
      );
    });
  };

  getNavItemClass = (navItem) => {
    return (navItem === this.props.selectedNavItem) ? 'active' : '';
  };

  render() {
    const docLinks = this.buildDocLinks();
    const dbEncoded = FauxtonAPI.url.encode(this.props.databaseName);
    const changesUrl = '#' + FauxtonAPI.urls('changes', 'app', dbEncoded, '');
    const permissionsUrl = '#' + FauxtonAPI.urls('permissions', 'app', dbEncoded);
    const databaseUrl = FauxtonAPI.urls('allDocs', 'app', dbEncoded, '');
    const mangoQueryUrl = FauxtonAPI.urls('mango', 'query-app', dbEncoded);
    const runQueryWithMangoText = app.i18n.en_US['run-query-with-mango'];
    const buttonLinks = this.getNewButtonLinks();

    return (
      <ul className="nav nav-list">
        <li className={this.getNavItemClass('all-docs')}>
          <a id="all-docs"
            href={"#/" + databaseUrl}
            className="toggle-view">
            All Documents
          </a>
          <div id="new-all-docs-button" className="add-dropdown">
            <MenuDropDown links={buttonLinks} />
          </div>
        </li>
        <li className={this.getNavItemClass('mango-query')}>
          <a
            id="mango-query"
            href={'#' + mangoQueryUrl}
            className="toggle-view">
            {runQueryWithMangoText}
          </a>
        </li>
        <li className={this.getNavItemClass('permissions')}>
          <a id="permissions" href={permissionsUrl}>Permissions</a>
        </li>
        <li className={this.getNavItemClass('changes')}>
          <a id="changes" href={changesUrl}>Changes</a>
        </li>
        {docLinks}
        <li className={this.getNavItemClass('design-docs')}>
          <a
            id="design-docs"
            href={"#/" + databaseUrl + '?startkey="_design"&endkey="_design0"'}
            className="toggle-view">
            Design Documents
          </a>
          <div id="new-design-docs-button" className="add-dropdown">
            <MenuDropDown links={buttonLinks} />
          </div>
        </li>
      </ul>
    );
  }
}

class IndexSection extends React.Component {
  static propTypes = {
    urlNamespace: PropTypes.string.isRequired,
    indexLabel: PropTypes.string.isRequired,
    database: PropTypes.object.isRequired,
    designDocName: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    selectedIndex: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired
  };

  state = {
    placement: 'bottom'
  };

  // this dynamically changes the placement of the menu (top/bottom) to prevent it going offscreen and causing some
  // unsightly shifting
  setPlacement = (rowId) => {
    const rowTop = document.getElementById(rowId).getBoundingClientRect().top;
    const toggleHeight = 150; // the height of the menu overlay, arrow, view row
    const placement = (rowTop + toggleHeight > window.innerHeight) ? 'top' : 'bottom';
    this.setState({ placement: placement });
  };

  createItems = () => {

    // sort the indexes alphabetically
    const sortedItems = this.props.items.sort();

    return _.map(sortedItems, (indexName, index) => {
      const href = FauxtonAPI.urls(this.props.urlNamespace, 'app', encodeURIComponent(this.props.database.id), encodeURIComponent(this.props.designDocName));
      const className = (this.props.selectedIndex === indexName) ? 'active' : '';

      return (
        <li className={className} key={index}>
          <a
            id={this.props.designDocName + '_' + indexName}
            href={"#/" + href + encodeURIComponent(indexName)}
            className="toggle-view">
            {indexName}
          </a>
          <OverlayTrigger
            trigger="click"
            onEnter={this.setPlacement.bind(this, this.props.designDocName + '_' + indexName)}
            placement={this.state.placement}
            rootClose={true}
            ref={overlay => this.itemOverlay = overlay}
            overlay={
              <Popover id="index-menu-component-popover">
                <ul>
                  <li onClick={this.indexAction.bind(this, 'edit', { indexName: indexName, onEdit: this.props.onEdit })}>
                    <span className="fonticon fonticon-file-code-o"></span>
                    Edit
                  </li>
                  <li onClick={this.indexAction.bind(this, 'clone', { indexName: indexName, onClone: this.props.onClone })}>
                    <span className="fonticon fonticon-files-o"></span>
                    Clone
                  </li>
                  <li onClick={this.indexAction.bind(this, 'delete', { indexName: indexName, onDelete: this.props.onDelete })}>
                    <span className="fonticon fonticon-trash"></span>
                    Delete
                  </li>
                </ul>
              </Popover>
            }>
            <span className="index-menu-toggle fonticon fonticon-wrench2"></span>
          </OverlayTrigger>
        </li>
      );
    });
  };

  indexAction = (action, params, e) => {
    e.preventDefault();

    this.itemOverlay.hide();

    switch (action) {
      case 'delete':
        Actions.showDeleteIndexModal(params.indexName, this.props.designDocName, this.props.indexLabel, params.onDelete);
        break;
      case 'clone':
        Actions.showCloneIndexModal(params.indexName, this.props.designDocName, this.props.indexLabel, params.onClone);
        break;
      case 'edit':
        params.onEdit(this.props.database.id, this.props.designDocName, params.indexName);
        break;
    }
  };

  toggle = (e) => {
    e.preventDefault();
    this.props.toggle(this.props.designDocName, this.props.title);
  };

  render() {

    // if this section has no content, omit it to prevent clutter. Otherwise it would show a toggle option that
    // would hide/show nothing
    if (this.props.items.length === 0) {
      return null;
    }

    let toggleClassNames = 'accordion-header index-group-header';
    let toggleBodyClassNames = 'index-list accordion-body collapse';
    if (this.props.isExpanded) {
      toggleClassNames += ' down';
      toggleBodyClassNames += ' in';
    }

    const title = this.props.title;
    const designDocName = this.props.designDocName;
    const linkId = "nav-design-function-" + designDocName + this.props.selector;

    return (
      <li id={linkId}>
        <a className={toggleClassNames} data-toggle="collapse" onClick={this.toggle}>
          <div className="fonticon-play"></div>
          {title}
        </a>
        <Collapse in={this.props.isExpanded}>
          <ul className={toggleBodyClassNames}>
            {this.createItems()}
          </ul>
        </Collapse>
      </li>
    );
  }
}

class DesignDoc extends React.Component {
  static propTypes = {
    database: PropTypes.object.isRequired,
    sidebarListTypes: PropTypes.array.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    selectedNavInfo: PropTypes.object.isRequired,
    toggledSections: PropTypes.object.isRequired,
    designDocName:  PropTypes.string.isRequired
  };

  state = {
    updatedSidebarListTypes: this.props.sidebarListTypes
  };

  UNSAFE_componentWillMount() {
    if (_.isEmpty(this.state.updatedSidebarListTypes) ||
      (_.has(this.state.updatedSidebarListTypes[0], 'selector') && this.state.updatedSidebarListTypes[0].selector !== 'views')) {

      const newList = this.state.updatedSidebarListTypes;
      newList.unshift({
        selector: 'views',
        name: 'Views',
        urlNamespace: 'view',
        indexLabel: 'view',
        onDelete: IndexEditorActions.deleteView,
        onClone: IndexEditorActions.cloneView,
        onEdit: IndexEditorActions.gotoEditViewPage
      });
      this.setState({ updatedSidebarListTypes: newList });
    }
  }

  indexList = () => {
    return _.map(this.state.updatedSidebarListTypes, (index, key) => {
      const expanded = _.has(this.props.toggledSections, index.name) && this.props.toggledSections[index.name];

      // if an index in this list is selected, pass that down
      let selectedIndex = '';
      if (this.props.selectedNavInfo.designDocSection === index.name) {
        selectedIndex = this.props.selectedNavInfo.indexName;
      }

      return (
        <IndexSection
          icon={index.icon}
          isExpanded={expanded}
          urlNamespace={index.urlNamespace}
          indexLabel={index.indexLabel}
          onEdit={index.onEdit}
          onDelete={index.onDelete}
          onClone={index.onClone}
          selectedIndex={selectedIndex}
          toggle={this.props.toggle}
          database={this.props.database}
          designDocName={this.props.designDocName}
          key={key}
          title={index.name}
          selector={index.selector}
          items={_.keys(this.props.designDoc[index.selector])} />
      );
    });
  };

  toggle = (e) => {
    e.preventDefault();
    this.props.toggle(this.props.designDocName);
  };

  getNewButtonLinks = () => {
    const newUrlPrefix = FauxtonAPI.urls('databaseBaseURL', 'app', encodeURIComponent(this.props.database.id));
    const designDocName = this.props.designDocName;

    const addNewLinks = _.reduce(FauxtonAPI.getExtensions('sidebar:links'), function (menuLinks, link) {
      menuLinks.push({
        title: link.title,
        url: '#' + newUrlPrefix + '/' + link.url + '/' + encodeURIComponent(designDocName),
        icon: 'fonticon-plus-circled'
      });
      return menuLinks;
    }, [{
      title: 'New View',
      url: '#' + FauxtonAPI.urls('new', 'addView', encodeURIComponent(this.props.database.id), encodeURIComponent(designDocName)),
      icon: 'fonticon-plus-circled'
    }]);

    return [{
      title: 'Add New',
      links: addNewLinks
    }];
  };

  render () {
    const buttonLinks = this.getNewButtonLinks();
    let toggleClassNames = 'design-doc-section accordion-header';
    let toggleBodyClassNames = 'design-doc-body accordion-body collapse';

    if (this.props.isExpanded) {
      toggleClassNames += ' down';
      toggleBodyClassNames += ' in';
    }
    const designDocName = this.props.designDocName;
    const designDocMetaUrl = FauxtonAPI.urls('designDocs', 'app', this.props.database.id, designDocName);
    const metadataRowClass = (this.props.selectedNavInfo.designDocSection === 'metadata') ? 'active' : '';

    return (
      <li className="nav-header">
        <div id={"sidebar-tab-" + designDocName} className={toggleClassNames}>
          <div id={"nav-header-" + designDocName} onClick={this.toggle} className='accordion-list-item'>
            <div className="fonticon-play"></div>
            <p className='design-doc-name'>
              <span title={'_design/' + designDocName}>{designDocName}</span>
            </p>
          </div>
          <div className='new-button add-dropdown'>
            <MenuDropDown links={buttonLinks} />
          </div>
        </div>
        <Collapse in={this.props.isExpanded}>
          <ul className={toggleBodyClassNames} id={this.props.designDocName}>
            <li className={metadataRowClass}>
              <a href={"#/" + designDocMetaUrl} className="toggle-view accordion-header">
                Metadata
              </a>
            </li>
            {this.indexList()}
          </ul>
        </Collapse>
      </li>
    );
  }
}

class DesignDocList extends React.Component {
  UNSAFE_componentWillMount() {
    const list = FauxtonAPI.getExtensions('sidebar:list');
    this.sidebarListTypes = _.isUndefined(list) ? [] : list;
  }

  designDocList = () => {
    return _.map(this.props.designDocs, (designDoc, key) => {
      const ddName = decodeURIComponent(designDoc.safeId);

      // only pass down the selected nav info and toggle info if they're relevant for this particular design doc
      let expanded = false,
          toggledSections = {};
      if (_.has(this.props.toggledSections, ddName)) {
        expanded = this.props.toggledSections[ddName].visible;
        toggledSections = this.props.toggledSections[ddName].indexGroups;
      }

      let selectedNavInfo = {};
      if (this.props.selectedNav.navItem === 'designDoc' && this.props.selectedNav.designDocName === ddName) {
        selectedNavInfo = this.props.selectedNav;
      }

      return (
        <DesignDoc
          toggle={this.props.toggle}
          sidebarListTypes={this.sidebarListTypes}
          isExpanded={expanded}
          toggledSections={toggledSections}
          selectedNavInfo={selectedNavInfo}
          key={key}
          designDoc={designDoc}
          designDocName={ddName}
          database={this.props.database} />
      );
    });
  };

  render() {
    return (
      <ul className="nav nav-list">
        {this.designDocList()}
      </ul>
    );
  }
}

class SidebarController extends React.Component {
  getStoreState = () => {
    return {
      database: store.getDatabase(),
      selectedNav: store.getSelected(),
      designDocs: store.getDesignDocs(),
      designDocList: store.getDesignDocList(),
      availableDesignDocIds: store.getAvailableDesignDocs(),
      toggledSections: store.getToggledSections(),
      isLoading: store.isLoading(),
      deleteDbModalProperties: deleteDbModalStore.getShowDeleteDatabaseModal(),

      deleteIndexModalVisible: store.isDeleteIndexModalVisible(),
      deleteIndexModalText: store.getDeleteIndexModalText(),
      deleteIndexModalOnSubmit: store.getDeleteIndexModalOnSubmit(),
      deleteIndexModalIndexName: store.getDeleteIndexModalIndexName(),
      deleteIndexModalDesignDoc: store.getDeleteIndexDesignDoc(),

      cloneIndexModalVisible: store.isCloneIndexModalVisible(),
      cloneIndexModalTitle: store.getCloneIndexModalTitle(),
      cloneIndexModalSelectedDesignDoc: store.getCloneIndexModalSelectedDesignDoc(),
      cloneIndexModalNewDesignDocName: store.getCloneIndexModalNewDesignDocName(),
      cloneIndexModalOnSubmit: store.getCloneIndexModalOnSubmit(),
      cloneIndexDesignDocProp: store.getCloneIndexDesignDocProp(),
      cloneIndexModalNewIndexName: store.getCloneIndexModalNewIndexName(),
      cloneIndexSourceIndexName: store.getCloneIndexModalSourceIndexName(),
      cloneIndexSourceDesignDocName: store.getCloneIndexModalSourceDesignDocName(),
      cloneIndexModalIndexLabel: store.getCloneIndexModalIndexLabel()
    };
  };

  componentDidMount() {
    store.on('change', this.onChange, this);
    deleteDbModalStore.on('change', this.onChange, this);
  }

  componentWillUnmount() {
    store.off('change', this.onChange);
    deleteDbModalStore.off('change', this.onChange, this);
  }

  onChange = () => {

    const newState = this.getStoreState();
    // Workaround to signal Redux store that the design doc list was updated
    // which is currently required by QueryOptionsContainer
    // It should be removed once Sidebar components are refactored to use Redux
    if (this.props.reduxUpdatedDesignDocList) {
      this.props.reduxUpdatedDesignDocList(newState.designDocList);
    }

    this.setState(newState);
  };

  showDeleteDatabaseModal = (payload) => {
    ComponentsActions.showDeleteDatabaseModal(payload);
  };

  // handles deleting of any index regardless of type. The delete handler and all relevant info is set when the user
  // clicks the delete action for a particular index
  deleteIndex = () => {

    // if the user is currently on the index that's being deleted, pass that info along to the delete handler. That can
    // be used to redirect the user to somewhere appropriate
    const isOnIndex = this.state.selectedNav.navItem === 'designDoc' &&
      ('_design/' + this.state.selectedNav.designDocName) === this.state.deleteIndexModalDesignDoc.id &&
      this.state.selectedNav.indexName === this.state.deleteIndexModalIndexName;

    this.state.deleteIndexModalOnSubmit({
      isOnIndex: isOnIndex,
      indexName: this.state.deleteIndexModalIndexName,
      designDoc: this.state.deleteIndexModalDesignDoc,
      designDocs: this.state.designDocs,
      database: this.state.database
    });
  };

  cloneIndex = () => {
    this.state.cloneIndexModalOnSubmit({
      sourceIndexName: this.state.cloneIndexSourceIndexName,
      sourceDesignDocName: this.state.cloneIndexSourceDesignDocName,
      targetDesignDocName: this.state.cloneIndexModalSelectedDesignDoc,
      newDesignDocName: this.state.cloneIndexModalNewDesignDocName,
      newIndexName: this.state.cloneIndexModalNewIndexName,
      designDocs: this.state.designDocs,
      database: this.state.database,
      onComplete: Actions.hideCloneIndexModal
    });
  };

  state = this.getStoreState();

  render() {
    if (this.state.isLoading) {
      return <LoadLines />;
    }

    return (
      <nav className="sidenav">
        <MainSidebar
          selectedNavItem={this.state.selectedNav.navItem}
          databaseName={this.state.database.id} />
        <DesignDocList
          selectedNav={this.state.selectedNav}
          toggle={Actions.toggleContent}
          toggledSections={this.state.toggledSections}
          designDocs={this.state.designDocList}
          database={this.state.database} />
        <DeleteDatabaseModal
          showHide={this.showDeleteDatabaseModal}
          modalProps={this.state.deleteDbModalProperties} />

        {/* the delete and clone index modals handle all index types, hence the props all being pulled from the store */}
        <ConfirmationModal
          title="Confirm Deletion"
          visible={this.state.deleteIndexModalVisible}
          text={this.state.deleteIndexModalText}
          onClose={Actions.hideDeleteIndexModal}
          onSubmit={this.deleteIndex} />
        <CloneIndexModal
          visible={this.state.cloneIndexModalVisible}
          title={this.state.cloneIndexModalTitle}
          close={Actions.hideCloneIndexModal}
          submit={this.cloneIndex}
          designDocArray={this.state.availableDesignDocIds}
          selectedDesignDoc={this.state.cloneIndexModalSelectedDesignDoc}
          newDesignDocName={this.state.cloneIndexModalNewDesignDocName}
          newIndexName={this.state.cloneIndexModalNewIndexName}
          indexLabel={this.state.cloneIndexModalIndexLabel} />
      </nav>
    );
  }
}

class CloneIndexModal extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    title: PropTypes.string,
    close: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    designDocArray: PropTypes.array.isRequired,
    selectedDesignDoc: PropTypes.string.isRequired,
    newDesignDocName: PropTypes.string.isRequired,
    newIndexName: PropTypes.string.isRequired,
    indexLabel: PropTypes.string.isRequired
  };

  static defaultProps = {
    title: 'Clone Index',
    visible: false
  };

  submit = () => {
    if (!this.designDocSelector.validate()) {
      return;
    }
    if (this.props.newIndexName === '') {
      FauxtonAPI.addNotification({
        msg: 'Please enter the new index name.',
        type: 'error',
        clear: true
      });
      return;
    }
    this.props.submit();
  };

  close = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.close();
  };

  setNewIndexName = (e) => {
    Actions.setNewCloneIndexName(e.target.value);
  };

  render() {
    return (
      <Modal dialogClassName="clone-index-modal" show={this.props.visible} onHide={this.close}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <form className="form" method="post" onSubmit={this.submit}>
            <p>
              Select the design document where the cloned {this.props.indexLabel} will be created, and then enter
              a name for the cloned {this.props.indexLabel}.
            </p>

            <div className="row">
              <DesignDocSelector
                ref={node => this.designDocSelector = node}
                designDocList={this.props.designDocArray}
                selectedDesignDocName={this.props.selectedDesignDoc}
                newDesignDocName={this.props.newDesignDocName}
                onSelectDesignDoc={Actions.selectDesignDoc}
                onChangeNewDesignDocName={Actions.updateNewDesignDocName} />
            </div>

            <div className="clone-index-name-row">
              <label className="new-index-title-label" htmlFor="new-index-name">{this.props.indexLabel} Name</label>
              <input type="text" id="new-index-name" value={this.props.newIndexName} onChange={this.setNewIndexName}
                placeholder="New view name" />
            </div>
          </form>

        </Modal.Body>
        <Modal.Footer>
          <a href="#" className="cancel-link" onClick={this.close} data-bypass="true">Cancel</a>
          <button onClick={this.submit} data-bypass="true" className="btn btn-primary save">
            <i className="icon fonticon-ok-circled" /> Clone {this.props.indexLabel}</button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default {
  SidebarController: SidebarController,
  DesignDoc: DesignDoc,
  CloneIndexModal: CloneIndexModal
};
