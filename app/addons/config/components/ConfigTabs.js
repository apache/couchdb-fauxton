//  Licensed under the Apache License, Version 2.0 (the "License"); you may not
//  use this file except in compliance with the License. You may obtain a copy of
//  the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
//  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
//  License for the specific language governing permissions and limitations under
//  the License.

import PropTypes from 'prop-types';
import React from 'react';

const ConfigTabs = ({sidebarItems, selectedTab}) => {
  const tabItems = sidebarItems.map(item => {
    return <TabItem
      key={item.title}
      active={selectedTab === item.title}
      title={item.title}
      link={item.link}
    />;
  });
  return (
    <nav className="sidenav">
      <ul className="nav nav-list">
        {tabItems}
      </ul>
    </nav>
  );
};

const TabItem = ({active, link, title}) => {
  return (
    <li className={active ? 'active' : ''}>
      <a href={`#${link}`}>
        {title}
      </a>
    </li>
  );
};

TabItem.propTypes = {
  active: PropTypes.bool.isRequired,
  link: PropTypes.string.isRequired,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired
};

export default ConfigTabs;
