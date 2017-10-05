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
import { Dropdown } from "react-bootstrap";
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';

export class MenuDropDown extends React.Component {
  static defaultProps = {
    icon: 'fonticon-plus-circled'
  };

  createSectionLinks = (links) => {
    if (!links) { return null; }

    return links.map((link, key) => {
      return this.createEntry(link, key);
    });
  };

  createEntry = (link, key) => {
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
  };

  createSectionTitle = (title) => {
    if (!title) {
      return null;
    }

    return (
      <li className="header-label">{title}</li>
    );
  };

  createSection = () => {
    return this.props.links.map((linkSection, key) => {
      if (linkSection.title && linkSection.links) {
        return ([
          this.createSectionTitle(linkSection.title),
          this.createSectionLinks(linkSection.links)
        ]);
      }
      return this.createEntry(linkSection, 'el' + key);
    });
  };

  render() {
    const menuItems = this.createSection();
    return (
      <Dropdown id="dropdown-menu">
        <CustomMenuToggle bsRole="toggle" icon={this.props.icon}>
        </CustomMenuToggle>
        <CustomMenu bsRole="menu" className="arrow">
          {menuItems}
        </CustomMenu>
        }
      </Dropdown>
    );
  }
}

class CustomMenuToggle extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.onClick(e);
  }

  render() {
    return (
      <a className={"dropdown-toggle icon " + this.props.icon}
        style={{ fontSize: '1rem', boxShadow: '0px 0px 0px' }}
        onClick={this.handleClick}>
        {this.props.children}
      </a>
    );
  }
}

export class CustomMenu extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { children, open, onClose } = this.props;

    return (
      <RootCloseWrapper disabled={!open} onRootClose={onClose}>
        <ul className="dropdown-menu arrow" role="menu" aria-labelledby="dLabel">
          {children}
        </ul>
      </RootCloseWrapper>
    );
  }
}
