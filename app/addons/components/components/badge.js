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

import React from "react";
import ReactDOM from "react-dom";

export class BadgeList extends React.Component {
  static propTypes = {
    elements: PropTypes.array.isRequired,
    removeBadge: PropTypes.func.isRequired
  };

  static defaultProps = {
    getLabel (el) {
      return el;
    },

    getId (el) {
      return el;
    }
  };

  getBadges = () => {
    return this.props.elements.map(function (el, i) {
      return <Badge
        label={this.props.getLabel(el)}
        key={i}
        id={el}
        remove={this.removeBadge} />;
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
    remove: PropTypes.func.isRequired
  };

  remove = (e) => {
    e.preventDefault();
    this.props.remove(this.props.label, this.props.id);
  };

  render() {
    return (
      <li className="component-badge">
        <span className="label label-info">{this.props.label}</span>
        <a
          href="#"
          className="label label-info remove-filter"
          onClick={this.remove} data-bypass="true"
        >
          &times;
        </a>
      </li>
    );
  }
}
