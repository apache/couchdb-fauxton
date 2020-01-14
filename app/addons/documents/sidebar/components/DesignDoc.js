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
import React from 'react';
import { Collapse } from 'react-bootstrap';
import FauxtonAPI from '../../../../core/api';
import Components from '../../../components/react-components';
import IndexEditorActions from '../../index-editor/actions';
import IndexSection from './IndexSection';

const { MenuDropDown } = Components;

export default class DesignDoc extends React.Component {
  static propTypes = {
    database: PropTypes.object.isRequired,
    sidebarListTypes: PropTypes.array.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    isPartitioned: PropTypes.bool.isRequired,
    selectedPartitionKey: PropTypes.string,
    selectedNavInfo: PropTypes.object.isRequired,
    toggledSections: PropTypes.object.isRequired,
    designDocName:  PropTypes.string.isRequired,
    showDeleteIndexModal: PropTypes.func.isRequired,
    showCloneIndexModal: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      updatedSidebarListTypes: this.props.sidebarListTypes
    };
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
      this.state = { updatedSidebarListTypes: newList };
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
          items={_.keys(this.props.designDoc[index.selector])}
          isPartitioned={this.props.isPartitioned}
          selectedPartitionKey={this.props.selectedPartitionKey}
          showDeleteIndexModal={this.props.showDeleteIndexModal}
          showCloneIndexModal={this.props.showCloneIndexModal} />
      );
    });
  };

  toggle = (e) => {
    e.preventDefault();
    this.props.toggle(this.props.designDocName);
  };

  getNewButtonLinks = () => {
    const encodedPartKey = this.props.selectedPartitionKey ? encodeURIComponent(this.props.selectedPartitionKey) : '';
    const newUrlPrefix = FauxtonAPI.urls('databaseBaseURL', 'app', encodeURIComponent(this.props.database.id))
      + (encodedPartKey ? '/_partition/' + encodedPartKey : '');
    const designDocName = this.props.designDocName;

    const addonLinks = FauxtonAPI.getExtensions('sidebar:links');
    const addNewLinks = addonLinks.reduce((menuLinks, link) => {
      if (!this.props.isPartitioned || link.showForPartitionedDDocs) {
        menuLinks.push({
          title: link.title,
          url: '#' + newUrlPrefix + '/' + link.url + '/' + encodeURIComponent(designDocName),
          icon: 'fonticon-plus-circled'
        });
      }
      return menuLinks;
    }, [{
      title: 'New View',
      url: '#' + FauxtonAPI.urls('new', 'addView', encodeURIComponent(this.props.database.id), encodedPartKey, encodeURIComponent(designDocName)),
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
    const encodedPartKey = this.props.selectedPartitionKey ? encodeURIComponent(this.props.selectedPartitionKey) : '';
    const designDocMetaUrl = FauxtonAPI.urls('designDocs', 'app',
      encodeURIComponent(this.props.database.id), encodedPartKey, designDocName);
    const metadataRowClass = (this.props.selectedNavInfo.designDocSection === 'metadata') ? 'active' : '';
    const iconTitle = this.props.isPartitioned ? 'Partitioned design document' : 'Global design document';
    const iconClass = this.props.isPartitioned ? 'fonticon-documents' : 'fonticon-document';
    return (
      <li className="nav-header">
        <div id={"sidebar-tab-" + designDocName} className={toggleClassNames}>
          <div id={"nav-header-" + designDocName} onClick={this.toggle} className='accordion-list-item'>
            <div className="fonticon-play"></div>
            <p className='design-doc-name'>
              <span title={'_design/' + designDocName}>
                <i className={iconClass} title={iconTitle}></i>
                {designDocName}
              </span>
            </p>
          </div>
          <div className='new-button add-dropdown'>
            <MenuDropDown links={buttonLinks} />
          </div>
        </div>
        <Collapse in={this.props.isExpanded}>
          <ul className={toggleBodyClassNames} id={`design-doc-menu-${this.props.designDocName}`}>
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
