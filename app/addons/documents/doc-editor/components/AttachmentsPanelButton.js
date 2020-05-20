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

import FauxtonAPI from '../../../../core/api';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import { Dropdown, MenuItem } from 'react-bootstrap';
import Helpers from '../../../../helpers';


export default class AttachmentsPanelButton extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    disabled: PropTypes.bool,
    doc: PropTypes.object
  };

  static defaultProps = {
    isLoading: true,
    disabled: false,
    doc: {}
  };

  getAttachmentList = () => {
    const db = encodeURIComponent(this.props.doc.database.get('id'));
    const doc = encodeURIComponent(this.props.doc.get('_id'));

    return _.map(this.props.doc.get('_attachments'), (item, filename) => {
      const url = FauxtonAPI.urls('document', 'attachment', db, doc, encodeURIComponent(filename));
      return (
        <MenuItem key={filename} href={url} target="_blank" data-bypass="true">
          <strong>{filename}</strong>
          <span className="attachment-delimiter">-</span>
          <span>{item.content_type}{item.content_type ? ', ' : ''}{Helpers.formatSize(item.length)}</span>
        </MenuItem>
      );
    });
  };

  render() {
    if (this.props.isLoading || !this.props.doc.get('_attachments')) {
      return false;
    }

    return (
      <div className="panel-section view-attachments-section btn-group">
        <Dropdown id="view-attachments-menu" disabled={this.props.disabled} >
          <Dropdown.Toggle noCaret className="panel-button dropdown-toggle btn" data-bypass="true">
            <i className="icon icon-paper-clip"></i>
            <span className="button-text">View Attachments</span>
            <span className="caret"></span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {this.getAttachmentList()}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
}
