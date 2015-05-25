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
  'addons/documents/sidebar/stores',
  'addons/documents/sidebar/actions',
  'addons/components/react-components.react',
  'addons/documents/views',

  'plugins/prettify'
],

function (app, FauxtonAPI, React, Stores, Actions, Components, DocumentViews) {
  var DeleteDBModal = DocumentViews.Views.DeleteDBModal;
  var store = Stores.sidebarStore;
  var LoadLines = Components.LoadLines;

  var SidebarToggle = React.createClass({
    getInitialState: function () {
      return {
        hidden: false
      };
    },

    toggle: function (e) {
      e.preventDefault();
      var newHiddenState = !this.state.hidden;
      this.setState({hidden: newHiddenState});
      var $dashboard = $('#dashboard-content');

      if (newHiddenState) {
        $dashboard.animate({left: '210px'}, 300);
      } else {
        $dashboard.animate({left: '550px'}, 300);
      }

    },

    render: function () {
      return null;
    }

  });

  var MainSidebar = React.createClass({

    getNewButtonLinks: function () {  //these are links for the sidebar '+' on All Docs and All Design Docs
      var addLinks = FauxtonAPI.getExtensions('sidebar:links');
      var databaseName = this.props.databaseName;
      var newUrlPrefix = '#' + FauxtonAPI.urls('databaseBaseURL', 'app', databaseName);

      var addNewLinks = _.reduce(addLinks, function (menuLinks, link) {
        menuLinks.push({
          title: link.title,
          url: newUrlPrefix + '/' + link.url,
          icon: 'fonticon-plus-circled'
        });

        return menuLinks;
      }, [{
        title: 'New Doc',
        url: newUrlPrefix + '/new',
        icon: 'fonticon-plus-circled'
      }, {
        title: 'New View',
        url: newUrlPrefix + '/new_view',
        icon: 'fonticon-plus-circled'
      }, this.getMangoLink()]);

      return [{
        title: 'Add new',
        links: addNewLinks
      }];
    },

    getMangoLink: function () {
      var databaseName = this.props.databaseName;
      var newUrlPrefix = '#' + FauxtonAPI.urls('databaseBaseURL', 'app', databaseName);

      return {
        title: app.i18n.en_US['new-mango-index'],
        url: newUrlPrefix + '/_index',
        icon: 'fonticon-plus-circled'
      };
    },

    buildDocLinks: function () {
      var base = FauxtonAPI.urls('base', 'app', this.props.databaseName);
      var isActive = this.props.isActive;

      return FauxtonAPI.getExtensions('docLinks').map(function (link) {
        return (
          <li key={link.url} className={isActive(link.url)}>
            <a id={link.url} href={base + link.url}>{link.title}</a>
          </li>
        );

      });
    },

    render: function () {
      var isActive = this.props.isActive;
      var docLinks = this.buildDocLinks();
      var changesUrl = '#' + FauxtonAPI.urls('changes', 'app', this.props.databaseName, '');
      var permissionsUrl = '#' + FauxtonAPI.urls('permissions', 'app', this.props.databaseName);
      var databaseUrl = FauxtonAPI.urls('allDocs', 'app', this.props.databaseName, '');
      var mangoQueryUrl = FauxtonAPI.urls('mango', 'query-app', this.props.databaseName);
      var runQueryWithMangoText = app.i18n.en_US['run-query-with-mango'];
      var buttonLinks = this.getNewButtonLinks();

      return (
        <ul className="nav nav-list">
          <li className={isActive('permissions')}>
            <a id="permissions" href={permissionsUrl}>Permissions</a>
          </li>
          <li className={isActive('changes')}>
            <a id="changes" href={changesUrl}>Changes</a>
          </li>
          {docLinks}
          <li className={isActive('all-docs')}>
            <a id="all-docs"
              href={"#/" + databaseUrl}
              className="toggle-view">
              All Documents
            </a>
            <div id="new-all-docs-button" className="add-dropdown">
              <Components.MenuDropDown links={buttonLinks} />
            </div>
           </li>
          <li className={isActive('mango-query')}>
            <a
              id="mango-query"
              href={'#/' + mangoQueryUrl}
              className="toggle-view">
              {runQueryWithMangoText}
            </a>
            <div id="mango-query-button" className="add-dropdown">
              <Components.MenuDropDown links={buttonLinks} />
            </div>
          </li>
          <li className={isActive('design-docs')}>
            <a
              id="design-docs"
              href={"#/" + databaseUrl + '?startkey="_design"&endkey="_design0"'}
              className="toggle-view">
              All Design Docs
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

    getDefaultProps: function () {
      return {
        indexTypeMap: {
          views:   { icon: 'fonticon-sidenav-map-reduce', urlFolder: '_view', type: 'view' },
          indexes: { icon: 'fonticon-sidenav-search', urlFolder: '_indexes', type: 'search' }
        }
      };
    },

    createItems: function () {
      return _.map(this.props.items, function (index, key) {
        var href = FauxtonAPI.urls(this.props.indexTypeMap[this.props.selector].type, 'app', this.props.databaseName, this.props.designDocName);
        return (
          <li key={key}>
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
      var newToggleState = !this.props.contentVisible;
      var state = newToggleState ? 'show' : 'hide';
      $(this.getDOMNode()).find('.accordion-body').collapse(state);
      this.props.toggle(this.props.designDocName, this.props.title);
    },

    render: function () {
      var toggleClassNames = 'accordion-header';
      var toggleBodyClassNames = 'accordion-body collapse';
      if (this.props.contentVisible) {
        toggleClassNames += ' down';
        toggleBodyClassNames += ' in';
      }

      var title = this.props.title;
      var icon = this.props.indexTypeMap[this.props.selector].icon;
      var designDocName = this.props.designDocName;
      var linkId = "nav-design-function-" + designDocName + this.props.selector;
      return (
        <li id={linkId} onClick={this.toggle}>
          <a className={toggleClassNames} data-toggle="collapse">
            <div className="fonticon-play"></div>
            <span className={icon + " fonticon"}></span>
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

    createIndexList: function () {
      var sidebarListTypes = FauxtonAPI.getExtensions('sidebar:list');

      if (_.isEmpty(sidebarListTypes) ||
        (_.has(sidebarListTypes[0], 'selector') && sidebarListTypes[0].selector !== 'views')) {
        sidebarListTypes.unshift({
          selector: 'views',
          name: 'Views'
        });
      }

      return _.map(sidebarListTypes, function (index, key) {
        return <IndexSection
          contentVisible={this.props.isVisible(this.props.designDocName, index.name)}
          toggle={this.props.toggle}
          databaseName={this.props.databaseName}
          designDocName={this.props.designDocName}
          key={key}
          title={index.name}
          selector={index.selector}
          items={_.keys(this.props.designDoc[index.selector])} />;
      }.bind(this));
    },

    toggle: function (e) {
      e.preventDefault();
      var newToggleState = !this.props.contentVisible;
      var state = newToggleState ? 'show' : 'hide';
      $(this.getDOMNode()).find('#' + this.props.designDocName).collapse(state);
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
        title: 'Add new',
        links: addNewLinks
      }];
    },

    render: function () {
      var buttonLinks = this.getNewButtonLinks();
      var toggleClassNames = 'accordion-header';
      var toggleBodyClassNames = 'accordion-body collapse';

      if (this.props.contentVisible) {
        toggleClassNames += ' down';
        toggleBodyClassNames += ' in';
      }
      var designDocName = this.props.designDocName;
      var designDocMetaUrl = FauxtonAPI.urls('designDocs', 'app', this.props.databaseName, designDocName);
      return (
        <li  className="nav-header">

        <div id={"sidebar-tab-" + designDocName} className={toggleClassNames}>
          <div id={"nav-header-" + designDocName} onClick={this.toggle} className='accordion-list-item'>
            <div className='fonticon-play'></div>
            <p className='design-doc-name'>
              <span title={'_design/' + designDocName}>{'_design/' + designDocName}</span>
            </p>
          </div>
          <div className='new-button add-dropdown'>
            <Components.MenuDropDown links={buttonLinks} />
          </div>
        </div>
        <ul className={toggleBodyClassNames} id={this.props.designDocName}>
          <li>
            <a href={"#/" + designDocMetaUrl} className="toggle-view accordion-header">
              <span className="fonticon-sidenav-info fonticon"></span>
              Design Doc Metadata
            </a>
          </li>
          {this.createIndexList()}
        </ul>
        </li>
      );
    }

  });

  var DesignDocList = React.createClass({
    createDesignDocs: function () {
      return _.map(this.props.designDocs, function (designDoc, key) {
        return <DesignDoc
          toggle={this.props.toggle}
          contentVisible={this.props.isVisible(designDoc.safeId)}
          isVisible={this.props.isVisible}
          key={key}
          designDoc={designDoc}
          designDocName={designDoc.safeId}
          databaseName={this.props.databaseName} />;
      }.bind(this));
    },

    render: function () {
      var designDocName = this.props.designDocName;
      var designDocMetaUrl = FauxtonAPI.urls('designDocs', 'app', this.props.databaseName, designDocName);

      return (
        <ul className="nav nav-list">
          {this.createDesignDocs()}
        </ul>
      );
    }

  });

  var DeleteDBModalWrapper = React.createClass({

    componentDidMount: function () {
      this.dbModal = new DeleteDBModal({
        database: this.props.database,
        isSystemDatabase: (/^_/).test(this.props.database.id),
        el: this.getDOMNode()
      });

      this.dbModal.render();
    },

    componentWillUnmount: function () {
      this.dbModal.remove();
    },

    componentWillReceiveProps: function (newProps) {
      this.dbModal.database = newProps.database;
      this.dbModal.isSystemDatabase = newProps.database.isSystemDatabase();
    },

    render: function () {
      return <div id="delete-db-modal"> </div>;
    }

  });

  var SidebarController = React.createClass({
    getStoreState: function () {
      return {
        databaseName: store.getDatabaseName(),
        selectedTab: store.getSelectedTab(),
        designDocs: store.getDesignDocs(),
        isVisible: _.bind(store.isVisible, store),
        isLoading: store.isLoading(),
        database: store.getDatabase()
      };
    },

    isActive: function (id) {
      if (id === this.state.selectedTab) {
        return 'active';
      }

      return '';
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      store.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      store.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },


    render: function () {
      if (this.state.isLoading) {
        return <LoadLines />;
      }

      return (
        <nav className="sidenav">
          <SidebarToggle />
          <MainSidebar isActive={this.isActive} databaseName={this.state.databaseName} />
          <DesignDocList
            toggle={Actions.toggleContent}
            isVisible={this.state.isVisible}
            designDocs={this.state.designDocs}
            databaseName={this.state.databaseName} />
          <DeleteDBModalWrapper database={this.state.database}/>
        </nav>
      );
    }
  });

  var Views = {
    SidebarController: SidebarController
  };

  return Views;
});
