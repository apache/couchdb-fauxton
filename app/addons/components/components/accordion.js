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
import classnames from 'classnames';

export const Accordion = (props) => {
  const { children, className, style } = props;
  const classNames = classnames('faux--accordion', className);
  return (
    <ul className={classNames} style={style}>
      {children}
    </ul>
  );
};

export class AccordionItem extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired
  };

  static defaultProps = {
    onClick: () => { }
  };

  state = {
    open: false
  };

  handleClick = (event) => {
    const newOpen = !this.state.open;
    this.setState({ open: newOpen });
    this.props.onClick({ isOpen: newOpen, event });
  };

  render() {
    const { children, title } = this.props;
    const icon = this.state.open ? 'fonticon-down-open' : 'fonticon-right-open';
    const contentClassNames = classnames(
      'faux--accordion__item-content', 'collapse',
      {in: this.state.open}
    );

    return (
      <li
        className='faux--accordion__item'
        onClick={this.handleClick}>
        <button
          type="button"
          className={`faux--accordion__item-header`}
          onClick={this.handleClick}>
          <i className={icon}></i>
          <span>{title}</span>
        </button>
        <Collapse in={this.state.open}>
          <div className={contentClassNames}>
            { children }
          </div>
        </Collapse>
      </li>
    );
  }
}
