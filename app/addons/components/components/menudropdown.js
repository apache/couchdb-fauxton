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
import React from "react";
import ReactDOM from "react-dom";

export const MenuDropDown = React.createClass({

  getDefaultProps () {
    return {
      icon: 'fonticon-plus-circled'
    };
  },

  createSectionLinks (links) {
    if (!links) { return null; }

    return links.map((link, key) => {
      return this.createEntry(link, key);
    });
  },

  createEntry (link, key) {
    return (
      <li key={key}>
        <a className={link.icon ? 'icon ' + link.icon : ''}
          data-bypass={link.external ? 'true' : ''}
          href={link.url}
          onClick={link.onClick}
          target={link.external ? '_blank' : ''}>
          {link.title}
        </a>
      </li>
    );
  },

  createSectionTitle (title) {
    if (!title) {
      return null;
    }

    return (
      <li className="header-label">{title}</li>
    );
  },

  createSection () {
    return this.props.links.map((linkSection, key) => {
      if (linkSection.title && linkSection.links) {
        return ([
          this.createSectionTitle(linkSection.title),
          this.createSectionLinks(linkSection.links)
        ]);
      }

      return this.createEntry(linkSection, 'el' + key);

    });
  },

  render () {
    return (
      <div className="dropdown">
        <a className={"dropdown-toggle icon " + this.props.icon}
          data-toggle="dropdown"
          href="#"
          data-bypass="true"></a>
        <ul className="dropdown-menu arrow" role="menu" aria-labelledby="dLabel">
          {this.createSection()}
        </ul>
      </div>
    );
  }
});
