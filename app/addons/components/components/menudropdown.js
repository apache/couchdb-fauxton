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

import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';

export class MenuDropDown extends React.Component {
  static defaultProps = {
    icon: 'fonticon-plus-circled',
    hideArrow: false,
    toggleType: 'link',
  };

  static propTypes = {
    icon: PropTypes.string,
    hideArrow: PropTypes.bool,
    links: PropTypes.array.isRequired,
    toggleType: PropTypes.string.isRequired,
  };

  createSectionLinks = (links) => {
    if (!links) {
      return null;
    }

    return links.map((link, key) => {
      return this.createEntry(link, key);
    });
  };

  createEntry = (link, key) => {
    let itemType = (link.url == null) ? 'button' : "a";
    return (
      <Dropdown.Item
        as={itemType}
        key={key}
        href={link.url}
        onClick={link.onClick}
        className={"py-2 ps-0"}
      >
        <div className='ms-0'>
          <span className={classnames('ms-2 align-middle icon', link.icon, {'fonticon-placeholder': !link.icon})}>
            {link.title}
          </span>
        </div>
      </Dropdown.Item>
    );
  };

  createSectionTitle = (title, key) => {
    if (!title) {
      return null;
    }

    return (
      <Dropdown.Header key={key}>{title}</Dropdown.Header>
    );
  };

  createSection = () => {
    return this.props.links.map((linkSection, key) => {
      if (linkSection.title && linkSection.links) {
        return [
          this.createSectionTitle(linkSection.title, 'title_' + key),
          this.createSectionLinks(linkSection.links),
        ];
      }
      return this.createEntry(linkSection, 'el' + key);
    });
  };

  render() {
    const menuItems = this.createSection();
    const CustomMenuToggle =
      this.props.toggleType === 'button'
        ? CustomMenuButtonToggle
        : CustomMenuLinkToggle;
    return (
      <Dropdown
        id="dropdown-menu">
        <Dropdown.Toggle
          as={CustomMenuToggle}
          icon={this.props.icon}
        ></Dropdown.Toggle>
        <Dropdown.Menu
          className={"pt-0 dropdown-arrow"}
        >
          {menuItems}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

const CustomMenuButtonToggle = React.forwardRef(
  ({ children, onClick, icon }, ref) => {
    const handleClick = (e) => {
      e.preventDefault();
      onClick(e);
    };
    return (
      <Button className="dropdown-toggle" ref={ref} onClick={handleClick} variant="cf-secondary">
        <i className={icon} />
        {children}
      </Button>
    );
  }
);

const CustomMenuLinkToggle = React.forwardRef(
  ({ children, onClick, icon }, ref) => {
    const handleClick = (e) => {
      e.preventDefault();
      onClick(e);
    };

    return (
      <a
        ref={ref}
        className={'dropdown-toggle cursor-pointer icon ' + icon}
        style={{ fontSize: '1rem', boxShadow: '0px 0px 0px'}}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }
);
