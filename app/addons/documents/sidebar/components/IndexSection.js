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
import { Collapse, OverlayTrigger, Popover } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import FauxtonAPI from '../../../../core/api';

export default class IndexSection extends React.Component {
  static propTypes = {
    urlNamespace: PropTypes.string.isRequired,
    indexLabel: PropTypes.string.isRequired,
    database: PropTypes.object.isRequired,
    designDocName: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    selectedIndex: PropTypes.string.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    showDeleteIndexModal: PropTypes.func.isRequired,
    showCloneIndexModal: PropTypes.func.isRequired,
    isPartitioned: PropTypes.bool.isRequired,
    selectedPartitionKey: PropTypes.string
  };

  state = {
    placement: 'bottom'
  };

  // this dynamically changes the placement of the menu (top/bottom) to prevent it going offscreen and causing some
  // unsightly shifting
  setPlacement = (rowId) => {
    const rowTop = document.getElementById(rowId).getBoundingClientRect().top;
    const toggleHeight = 150; // the height of the menu overlay, arrow, view row
    const placement = (rowTop + toggleHeight > window.innerHeight) ? 'top' : 'bottom';
    this.setState({ placement: placement });
  };

  createItems = () => {

    // sort the indexes alphabetically
    const sortedItems = this.props.items.sort();

    return _.map(sortedItems, (indexName, index) => {
      let href = FauxtonAPI.urls(this.props.urlNamespace, 'app', encodeURIComponent(this.props.database.id), encodeURIComponent(this.props.designDocName));
      if (this.props.selectedPartitionKey) {
        href = FauxtonAPI.urls('partitioned_' + this.props.urlNamespace, 'app',
          encodeURIComponent(this.props.database.id),
          encodeURIComponent(this.props.selectedPartitionKey),
          encodeURIComponent(this.props.designDocName));
      }
      const className = (this.props.selectedIndex === indexName) ? 'active' : '';

      return (
        <li className={className} key={index}>
          <a
            id={this.props.designDocName + '_' + indexName}
            href={"#/" + href + encodeURIComponent(indexName)}
            className="toggle-view">
            {indexName}
          </a>
          <OverlayTrigger
            trigger="click"
            onEnter={this.setPlacement.bind(this, this.props.designDocName + '_' + indexName)}
            placement={this.state.placement}
            rootClose={true}
            ref={overlay => this.itemOverlay = overlay}
            overlay={
              <Popover id="index-menu-component-popover">
                <ul>
                  <li onClick={this.indexAction.bind(this, 'edit', { indexName: indexName, onEdit: this.props.onEdit })}>
                    <span className="fonticon fonticon-file-code-o"></span>
                    Edit
                  </li>
                  <li onClick={this.indexAction.bind(this, 'clone', { indexName: indexName, onClone: this.props.onClone })}>
                    <span className="fonticon fonticon-files-o"></span>
                    Clone
                  </li>
                  <li onClick={this.indexAction.bind(this, 'delete', { indexName: indexName, onDelete: this.props.onDelete })}>
                    <span className="fonticon fonticon-trash"></span>
                    Delete
                  </li>
                </ul>
              </Popover>
            }>
            <span className="index-menu-toggle fonticon fonticon-wrench2"></span>
          </OverlayTrigger>
        </li>
      );
    });
  };

  indexAction = (action, params, e) => {
    e.preventDefault();

    this.itemOverlay.hide();

    switch (action) {
      case 'delete':
        this.props.showDeleteIndexModal(params.indexName, this.props.designDocName, this.props.indexLabel, params.onDelete);
        break;
      case 'clone':
        this.props.showCloneIndexModal(params.indexName, this.props.designDocName, this.props.indexLabel, params.onClone);
        break;
      case 'edit':
        params.onEdit(this.props.database.id, this.props.selectedPartitionKey, this.props.designDocName, params.indexName);
        break;
    }
  };

  toggle = (e) => {
    e.preventDefault();
    this.props.toggle(this.props.designDocName, this.props.title);
  };

  render() {

    // if this section has no content, omit it to prevent clutter. Otherwise it would show a toggle option that
    // would hide/show nothing
    if (this.props.items.length === 0) {
      return null;
    }

    let toggleClassNames = 'accordion-header index-group-header';
    let toggleBodyClassNames = 'index-list accordion-body collapse';
    if (this.props.isExpanded) {
      toggleClassNames += ' down';
      toggleBodyClassNames += ' in';
    }

    const title = this.props.title;
    const designDocName = this.props.designDocName;
    const linkId = "nav-design-function-" + designDocName + this.props.selector;

    return (
      <li id={linkId}>
        <a className={toggleClassNames} data-toggle="collapse" onClick={this.toggle}>
          <div className="fonticon-play"></div>
          {title}
        </a>
        <Collapse in={this.props.isExpanded}>
          <ul className={toggleBodyClassNames}>
            {this.createItems()}
          </ul>
        </Collapse>
      </li>
    );
  }
}
