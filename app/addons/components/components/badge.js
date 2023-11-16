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
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

import React from "react";
import ReactDOM from "react-dom";

export class BadgeList extends React.Component {
  static propTypes = {
    elements: PropTypes.array.isRequired,
    removeBadge: PropTypes.func.isRequired,
    showClose: PropTypes.bool,
    tagExplanations: PropTypes.object
  };

  static defaultProps = {
    getLabel (el) {
      return el;
    },

    getId (el) {
      return el;
    },
    showClose: false,
    tagExplanations: null
  };

  getBadges = () => {
    return this.props.elements.map(function (el, i) {
      return <Badge
        label={this.props.getLabel(el)}
        key={i}
        id={el}
        remove={this.removeBadge}
        showClose={this.props.showClose}
        showTooltip={!!this.props.tagExplanations}
        tooltip={this.props.tagExplanations ? this.props.tagExplanations[el] : ''} />;
    }.bind(this));
  };

  removeBadge = (label, el) => {
    this.props.removeBadge(label, el);
  };

  render() {
    return (
      <ul className="component-badgelist">
        {this.getBadges()}
      </ul>
    );
  }
}

export class Badge extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    remove: PropTypes.func.isRequired,
    showClose: PropTypes.bool,
    showTooltip: PropTypes.bool,
    tooltip: PropTypes.string
  };
  static defaultProps = {
    showClose: false,
    showTooltip: false,
    tooltip: ''
  };

  remove = (e) => {
    e.preventDefault();
    this.props.remove(this.props.label, this.props.id);
  };

  render() {
    const className = "badge " + this.props.label.replace(' ', '-');
    const tooltip = <Tooltip id="graveyard-tooltip">{this.props.tooltip}</Tooltip>;

    return (
      <li className={className}>
        <div className="remove-filter">
          {this.props.showTooltip ?
            <OverlayTrigger placement="top" overlay={tooltip}>
              <span>{this.props.label}</span>
            </OverlayTrigger> :
            <span>{this.props.label}</span>}
          { this.props.showClose ?
            <a
              href="#"
              onClick={this.remove}
              data-bypass="true"
              className="ms-1">
            &times;
            </a>
            : null}
        </div>
      </li>
    );
  }
}
