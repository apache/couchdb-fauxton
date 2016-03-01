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
  'react-dom',
  'addons/documents/sidebar/stores',
  'addons/documents/sidebar/actions',


  'addons/components/react-components.react',
  'addons/components/stores',
  'addons/components/actions',
  'addons/documents/helpers',
  'plugins/prettify'
],

function (app, FauxtonAPI, React, ReactDOM, Stores, Actions,
  Components, ComponentsStore, ComponentsActions, DocumentHelper) {

  var store = Stores.sidebarStore;
  var LoadLines = Components.LoadLines;

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
      databaseName: React.PropTypes.string.isRequired,
      designDocName: React.PropTypes.string.isRequired,
      items: React.PropTypes.array.isRequired,
      isExpanded: React.PropTypes.bool.isRequired,
      selectedIndex: React.PropTypes.string.isRequired
    },

    createItems: function () {
      return _.map(this.props.items, function (index, key) {
        var href = FauxtonAPI.urls(this.props.urlNamespace, 'app', this.props.databaseName, this.props.designDocName);
        var className = (this.props.selectedIndex === index) ? 'active' : '';

        return (
          <li className={className} key={key}>
            <a
              id={this.props.designDocName + '_' + index}
              href={"#/" + href + index}
              className="toggle-view">
              {index}
            </a>
          </li>
        );
      }, this);
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
          urlNamespace: 'view'
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
            selectedIndex={selectedIndex}
            toggle={this.props.toggle}
            databaseName={this.props.databaseName}
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
      var databaseName = this.props.databaseName;
      var newUrlPrefix = FauxtonAPI.urls('databaseBaseURL', 'app', databaseName);
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
        url: '#' + FauxtonAPI.urls('new', 'addView', databaseName, designDocName),
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
      var designDocMetaUrl = FauxtonAPI.urls('designDocs', 'app', this.props.databaseName, designDocName);
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
            databaseName={this.props.databaseName} />
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
        databaseName: store.getDatabaseName(),
        selectedNav: store.getSelected(),
        designDocs: store.getDesignDocs(),
        toggledSections: store.getToggledSections(),
        isLoading: store.isLoading(),
        database: store.getDatabase(),
        deleteDbModalProperties: deleteDbModalStore.getShowDeleteDatabaseModal()
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

    render: function () {
      if (this.state.isLoading) {
        return <LoadLines />;
      }
      return (
        <nav className="sidenav">
          <MainSidebar
            selectedNavItem={this.state.selectedNav.navItem}
            databaseName={this.state.databaseName} />
          <DesignDocList
            selectedNav={this.state.selectedNav}
            toggle={Actions.toggleContent}
            toggledSections={this.state.toggledSections}
            designDocs={this.state.designDocs}
            databaseName={this.state.databaseName} />

          <DeleteDatabaseModal
            showHide={this.showDeleteDatabaseModal}
            modalProps={this.state.deleteDbModalProperties} />
        </nav>
      );
    }
  });

  return {
    SidebarController: SidebarController,
    DesignDoc: DesignDoc
  };

});
