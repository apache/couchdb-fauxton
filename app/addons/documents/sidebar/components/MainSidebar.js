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
import app from "../../../../app";
import FauxtonAPI from '../../../../core/api';
import DocumentHelper from "../../../documents/helpers";
import Components from '../../../components/react-components';

const { MenuDropDown } = Components;

export default class MainSidebar extends React.Component {
  static propTypes = {
    databaseName: PropTypes.string.isRequired,
    selectedNavItem: PropTypes.string.isRequired,
    selectedPartitionKey: PropTypes.string
  };

  getNewButtonLinks = () => {  // these are links for the sidebar '+' on All Docs and All Design Docs
    return DocumentHelper.getNewButtonLinks(this.props.databaseName, this.props.selectedPartitionKey);
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
    const partKeyEncoded = this.props.selectedPartitionKey ? encodeURIComponent(this.props.selectedPartitionKey) : '';
    const changesUrl = '#' + FauxtonAPI.urls('changes', 'app', dbEncoded, partKeyEncoded, '');
    const permissionsUrl = '#' + FauxtonAPI.urls('permissions', 'app', dbEncoded, partKeyEncoded);
    const databaseUrl = FauxtonAPI.urls('allDocs', 'app', dbEncoded, partKeyEncoded, '');
    const mangoQueryUrl = FauxtonAPI.urls('mango', 'query-app', dbEncoded, partKeyEncoded);
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
