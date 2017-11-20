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
import NavLink from "../components/NavLink";
import React from "react";
import ReactDOM from "react-dom";
import {mount} from 'enzyme';

describe('Navigation Bar', () => {
  const dbLink = {
    href: "#/_all_dbs",
    title: "Databases",
    icon: "fonticon-database",
    className: 'databases'
  };

  describe('Active Link', () => {
    it('matching title sets active css class', () => {
      const linkEl = mount(<NavLink link={dbLink} active={"Databases"} isMinimized={false} />);
      expect(linkEl.find('a.faux-navbar__link--active').length).toBe(1);
    });

    it('different title sets inactive css class', () => {
      const linkEl = mount(<NavLink link={dbLink} active={"Replication"} isMinimized={false} />);
      expect(linkEl.find('a.faux-navbar__link--inactive').length).toBe(1);
    });
  });

  describe('Minimized Link', () => {
    it('shows title when not minimized', () => {
      const linkEl = mount(<NavLink link={dbLink} active={"Databases"} isMinimized={false} />);
      expect(linkEl.text()).toMatch("Databases");
    });

    it('does not show title when minimized', () => {
      const linkEl = mount(<NavLink link={dbLink} active={"Databases"} isMinimized={true} />);
      expect(linkEl.find('span.faux-navbar__text').length).toBe(0);
    });
  });

  describe('Link icon badge', () => {
    const aLinkNoBadge = {
      href: "#/_all_dbs",
      title: "Databases",
      icon: "fonticon-database"
    };
    it('is not displayed when not set', () => {
      const linkEl = mount(<NavLink link={aLinkNoBadge} active={"Databases"} isMinimized={false} />);
      expect(linkEl.find('i.faux-navbar__icon-badge').length).toBe(0);
    });

    const aLinkWithBadge = {
      href: "#/_all_dbs",
      title: "Databases",
      icon: "fonticon-database",
      badge: true
    };
    it('is displayed when set to true', () => {
      const linkEl = mount(<NavLink link={aLinkWithBadge} active={"Databases"} isMinimized={false} />);
      expect(linkEl.find('i.faux-navbar__icon-badge').length).toBe(1);
    });
  });
});
