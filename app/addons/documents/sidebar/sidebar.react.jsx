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

import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import Stores from "./stores.react";
import Actions from "./actions";
import Components from "../../components/react-components.react";
import ComponentsStore from "../../components/stores";
import ComponentsActions from "../../components/actions";
import IndexEditorActions from "../index-editor/actions";
import IndexEditorComponents from "../index-editor/components.react";
import GeneralComponents from "../../fauxton/components.react";
import DocumentHelper from "../../documents/helpers";
import { OverlayTrigger, Popover, Modal } from "react-bootstrap";
import "../../../../assets/js/plugins/prettify";

var store = Stores.sidebarStore;
var LoadLines = Components.LoadLines;
var DesignDocSelector = IndexEditorComponents.DesignDocSelector;
var ConfirmationModal = GeneralComponents.ConfirmationModal;

var DeleteDatabaseModal = Components.DeleteDatabaseModal;
var deleteDbModalStore = ComponentsStore.deleteDbModalStore;


var MainSidebar = React.createClass({
  propTypes: {
    selectedNavItem: React.PropTypes.string.isRequired
  },

  getNewButtonLinks: function () {  // these are links for the sidebar '+' on All Docs and All Design Docs
    return DocumentHelper.getNewButtonLinks(this.props.databaseName);
  },

  buildDocLinks: function () {
    var base = FauxtonAPI.urls('base', 'app', this.props.databaseName);
    return FauxtonAPI.getExtensions('docLinks').map(function (link) {
      return (
        <li key={link.url} className={this.getNavItemClass(link.url)}>
          <a id={link.url} href={base + link.url}>{link.title}</a>
        </li>
      );
    }, this);
  },

  getNavItemClass: function (navItem) {
    return (navItem === this.props.selectedNavItem) ? 'active' : '';
  },

  render: function () {
    var docLinks = this.buildDocLinks();
    var changesUrl     = '#' + FauxtonAPI.urls('changes', 'app', this.props.databaseName, '');
    var permissionsUrl = '#' + FauxtonAPI.urls('permissions', 'app', this.props.databaseName);
    var databaseUrl    = FauxtonAPI.urls('allDocs', 'app', this.props.databaseName, '');
    var mangoQueryUrl  = FauxtonAPI.urls('mango', 'query-app', this.props.databaseName);
    var runQueryWithMangoText = app.i18n.en_US['run-query-with-mango'];
    var buttonLinks = this.getNewButtonLinks();

    return (
      <ul className="nav nav-list">
        <li className={this.getNavItemClass('all-docs')}>
          <a id="all-docs"
            href={"#/" + databaseUrl}
            className="toggle-view">
            All Documents
          </a>
          <div id="new-all-docs-button" className="add-dropdown">
            <Components.MenuDropDown links={buttonLinks} />
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
            <Components.MenuDropDown links={buttonLinks} />
          </div>
        </li>
      </ul>
    );
  }
});


var IndexSection = React.createClass({

  propTypes: {
    urlNamespace: React.PropTypes.string.isRequired,
    indexLabel: React.PropTypes.string.isRequired,
    database: React.PropTypes.object.isRequired,
    designDocName: React.PropTypes.string.isRequired,
    items: React.PropTypes.array.isRequired,
    isExpanded: React.PropTypes.bool.isRequired,
    selectedIndex: React.PropTypes.string.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onClone: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      placement: 'bottom'
    };
  },

  // this dynamically changes the placement of the menu (top/bottom) to prevent it going offscreen and causing some
  // unsightly shifting
  setPlacement: function (rowId) {
    var rowTop = document.getElementById(rowId).getBoundingClientRect().top;
    var toggleHeight = 150; // the height of the menu overlay, arrow, view row
    var placement = (rowTop + toggleHeight > window.innerHeight) ? 'top' : 'bottom';
    this.setState({ placement: placement });
  },

  createItems: function () {

    // sort the indexes alphabetically
    var sortedItems = this.props.items.sort();

    return _.map(sortedItems, function (indexName, index) {
      var href = FauxtonAPI.urls(this.props.urlNamespace, 'app', this.props.database.id, this.props.designDocName);
      var className = (this.props.selectedIndex === indexName) ? 'active' : '';

      return (
        <li className={className} key={index}>
          <a
            id={this.props.designDocName + '_' + indexName}
            href={"#/" + href + indexName}
            className="toggle-view">
            {indexName}
          </a>
          <OverlayTrigger
            ref={"indexMenu-" + index}
            trigger="click"
            onEnter={this.setPlacement.bind(this, this.props.designDocName + '_' + indexName)}
            placement={this.state.placement}
            rootClose={true}
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
    }, this);
  },

  indexAction: function (action, params, e) {
    e.preventDefault();

    // ensures the menu gets closed. The hide() on the ref doesn't consistently close it
    $('body').trigger('click');

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
  },

  toggle: function (e) {
    e.preventDefault();
    var newToggleState = !this.props.isExpanded;
    var state = newToggleState ? 'show' : 'hide';
    $(ReactDOM.findDOMNode(this)).find('.accordion-body').collapse(state);
    this.props.toggle(this.props.designDocName, this.props.title);
  },

  render: function () {

    // if this section has no content, omit it to prevent clutter. Otherwise it would show a toggle option that
    // would hide/show nothing
    if (this.props.items.length === 0) {
      return null;
    }

    var toggleClassNames = 'accordion-header index-group-header';
    var toggleBodyClassNames = 'index-list accordion-body collapse';
    if (this.props.isExpanded) {
      toggleClassNames += ' down';
      toggleBodyClassNames += ' in';
    }

    var title = this.props.title;
    var designDocName = this.props.designDocName;
    var linkId = "nav-design-function-" + designDocName + this.props.selector;

    return (
      <li id={linkId}>
        <a className={toggleClassNames} data-toggle="collapse" onClick={this.toggle}>
          <div className="fonticon-play"></div>
          {title}
        </a>
        <ul className={toggleBodyClassNames}>
          {this.createItems()}
        </ul>
      </li>
    );
  }
});


var DesignDoc = React.createClass({
  propTypes: {
    database: React.PropTypes.object.isRequired,
    sidebarListTypes: React.PropTypes.array.isRequired,
    isExpanded: React.PropTypes.bool.isRequired,
    selectedNavInfo: React.PropTypes.object.isRequired,
    toggledSections: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      updatedSidebarListTypes: this.props.sidebarListTypes
    };
  },

  componentWillMount: function () {
    if (_.isEmpty(this.state.updatedSidebarListTypes) ||
      (_.has(this.state.updatedSidebarListTypes[0], 'selector') && this.state.updatedSidebarListTypes[0].selector !== 'views')) {

      var newList = this.state.updatedSidebarListTypes;
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
  },

  indexList: function () {
    return _.map(this.state.updatedSidebarListTypes, function (index, key) {
      var expanded = _.has(this.props.toggledSections, index.name) && this.props.toggledSections[index.name];

      // if an index in this list is selected, pass that down
      var selectedIndex = '';
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
    }.bind(this));
  },

  toggle: function (e) {
    e.preventDefault();
    var newToggleState = !this.props.isExpanded;
    var state = newToggleState ? 'show' : 'hide';
    $(ReactDOM.findDOMNode(this)).find('#' + this.props.designDocName).collapse(state);
    this.props.toggle(this.props.designDocName);
  },

  getNewButtonLinks: function () {
    var newUrlPrefix = FauxtonAPI.urls('databaseBaseURL', 'app', this.props.database.id);
    var designDocName = this.props.designDocName;

    var addNewLinks = _.reduce(FauxtonAPI.getExtensions('sidebar:links'), function (menuLinks, link) {
      menuLinks.push({
        title: link.title,
        url: '#' + newUrlPrefix + '/' + link.url + '/' + designDocName,
        icon: 'fonticon-plus-circled'
      });
      return menuLinks;
    }, [{
      title: 'New View',
      url: '#' + FauxtonAPI.urls('new', 'addView', this.props.database.id, designDocName),
      icon: 'fonticon-plus-circled'
    }]);

    return [{
      title: 'Add New',
      links: addNewLinks
    }];
  },

  render: function () {
    var buttonLinks = this.getNewButtonLinks();
    var toggleClassNames = 'design-doc-section accordion-header';
    var toggleBodyClassNames = 'design-doc-body accordion-body collapse';

    if (this.props.isExpanded) {
      toggleClassNames += ' down';
      toggleBodyClassNames += ' in';
    }
    var designDocName = this.props.designDocName;
    var designDocMetaUrl = FauxtonAPI.urls('designDocs', 'app', this.props.database.id, designDocName);
    var metadataRowClass = (this.props.selectedNavInfo.designDocSection === 'metadata') ? 'active' : '';

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
            <Components.MenuDropDown links={buttonLinks} />
          </div>
        </div>
        <ul className={toggleBodyClassNames} id={this.props.designDocName}>
          <li className={metadataRowClass}>
            <a href={"#/" + designDocMetaUrl} className="toggle-view accordion-header">
              Metadata
            </a>
          </li>
          {this.indexList()}
        </ul>
      </li>
    );
  }
});


var DesignDocList = React.createClass({
  componentWillMount: function () {
    var list = FauxtonAPI.getExtensions('sidebar:list');
    this.sidebarListTypes = _.isUndefined(list) ? [] : list;
  },

  designDocList: function () {
    return _.map(this.props.designDocs, function (designDoc, key) {
      var ddName = designDoc.safeId;

      // only pass down the selected nav info and toggle info if they're relevant for this particular design doc
      var expanded = false,
        toggledSections = {};
      if (_.has(this.props.toggledSections, ddName)) {
        expanded = this.props.toggledSections[ddName].visible;
        toggledSections = this.props.toggledSections[ddName].indexGroups;
      }

      var selectedNavInfo = {};
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
    }.bind(this));
  },

  render: function () {
    return (
      <ul className="nav nav-list">
        {this.designDocList()}
      </ul>
    );
  }
});

var SidebarController = React.createClass({
  getStoreState: function () {
    return {
      database: store.getDatabase(),
      selectedNav: store.getSelected(),
      designDocs: store.getDesignDocs(),
      designDocList: store.getDesignDocList(),
      availableDesignDocIds: store.getAvailableDesignDocs(),
      toggledSections: store.getToggledSections(),
      isLoading: store.isLoading(),
      database: store.getDatabase(),
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
  },

  getInitialState: function () {
    return this.getStoreState();
  },

  componentDidMount: function () {
    store.on('change', this.onChange, this);
    deleteDbModalStore.on('change', this.onChange, this);
  },

  componentWillUnmount: function () {
    store.off('change', this.onChange);
    deleteDbModalStore.off('change', this.onChange, this);
  },

  onChange: function () {
    if (this.isMounted()) {
      this.setState(this.getStoreState());
    }
  },

  showDeleteDatabaseModal: function (payload) {
    ComponentsActions.showDeleteDatabaseModal(payload);
  },

  // handles deleting of any index regardless of type. The delete handler and all relevant info is set when the user
  // clicks the delete action for a particular index
  deleteIndex: function () {

    // if the user is currently on the index that's being deleted, pass that info along to the delete handler. That can
    // be used to redirect the user to somewhere appropriate
    var isOnIndex = this.state.selectedNav.navItem === 'designDoc' &&
                    ('_design/' + this.state.selectedNav.designDocName) === this.state.deleteIndexModalDesignDoc.id &&
                    this.state.selectedNav.indexName === this.state.deleteIndexModalIndexName;

    this.state.deleteIndexModalOnSubmit({
      isOnIndex: isOnIndex,
      indexName: this.state.deleteIndexModalIndexName,
      designDoc: this.state.deleteIndexModalDesignDoc,
      designDocs: this.state.designDocs,
      database: this.state.database
    });
  },

  cloneIndex: function () {
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
  },

  render: function () {
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
});


var CloneIndexModal = React.createClass({
  propTypes: {
    visible: React.PropTypes.bool.isRequired,
    title: React.PropTypes.string,
    close: React.PropTypes.func.isRequired,
    submit: React.PropTypes.func.isRequired,
    designDocArray: React.PropTypes.array.isRequired,
    selectedDesignDoc: React.PropTypes.string.isRequired,
    newDesignDocName: React.PropTypes.string.isRequired,
    newIndexName: React.PropTypes.string.isRequired,
    indexLabel: React.PropTypes.string.isRequired
  },

  getDefaultProps: function () {
    return {
      title: 'Clone Index',
      visible: false
    };
  },

  submit: function () {
    if (!this.refs.designDocSelector.validate()) {
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
  },

  close: function (e) {
    if (e) {
      e.preventDefault();
    }
    this.props.close();
  },

  setNewIndexName: function (e) {
    Actions.setNewCloneIndexName(e.target.value);
  },

  render: function () {
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
                ref="designDocSelector"
                designDocList={this.props.designDocArray}
                selectedDesignDocName={this.props.selectedDesignDoc}
                newDesignDocName={this.props.newDesignDocName}
                onSelectDesignDoc={Actions.selectDesignDoc}
                onChangeNewDesignDocName={Actions.updateNewDesignDocName} />
            </div>

            <div className="clone-index-name-row">
              <label className="new-index-title-label" htmlFor="new-index-name">{this.props.indexLabel} Name</label>
              <input type="text" id="new-index-name" value={this.props.newIndexName} onChange={this.setNewIndexName}
                 placeholder="Enter new view name" />
            </div>
          </form>

        </Modal.Body>
        <Modal.Footer>
          <a href="#" className="cancel-link" onClick={this.close} data-bypass="true">Cancel</a>
          <button onClick={this.submit} data-bypass="true" className="btn btn-success save">
            <i className="icon fonticon-ok-circled" /> Clone {this.props.indexLabel}</button>
        </Modal.Footer>
      </Modal>
    );
  }
});

export default {
  SidebarController: SidebarController,
  DesignDoc: DesignDoc,
  CloneIndexModal: CloneIndexModal
};
