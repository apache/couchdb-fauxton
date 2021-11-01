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
import { v4 as uuidv4 } from 'uuid';
import FauxtonAPI from '../../../../../core/api';
import Components from '../../../../components/react-components';
import Constants from '../../../constants';

const { Copy } = Components;

export default class TableRow extends React.Component {
  static defaultProps = {
    textOverflow: Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED
  };

  constructor (props) {
    super(props);
    this.state = {
      checked: this.props.isSelected
    };
  }

  onChange () {
    this.props.docChecked(this.props.el.id, this.props.el._rev);
  }

  getRowContents (element, rowNumber) {
    const el = element.content;

    const row = this.props.data.selectedFields.map(function (k, i) {

      const key = 'tableview-data-cell-' + rowNumber + k + i + el[k];
      const stringified = ['object', 'boolean'].includes(typeof el[k]) ?
        JSON.stringify(el[k], null, '  ') : el[k];

      const classNames = classnames({
        'showall': this.props.textOverflow === Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL,
        'small-font': this.props.fontSize === Constants.INDEX_RESULTS_STYLE.FONT_SIZE_SMALL,
        'large-font': this.props.fontSize === Constants.INDEX_RESULTS_STYLE.FONT_SIZE_LARGE
      });

      return (
        <td key={key} title={stringified} className={classNames} onClick={this.onClick.bind(this)}>
          {stringified}
        </td>
      );
    }.bind(this));

    return row;
  }

  maybeGetCheckboxCell (el, i) {
    return (
      <td className="tableview-checkbox-cell" key={"tableview-checkbox-cell-" + i}>
        {el.isDeletable ? <input
          id={"checkbox-" + this.props.docIdentifier}
          checked={this.props.isSelected}
          type="checkbox"
          onChange={this.onChange.bind(this)} /> : null}
      </td>
    );
  }

  getAdditionalInfoRow (el) {
    const attachmentCount = Object.keys(el._attachments || {}).length;
    let attachmentIndicator = null;
    let textAttachments = null;

    const conflictCount = Object.keys(el._conflicts || {}).length;
    let conflictIndicator = null;
    let textConflicts = null;


    if (attachmentCount) {
      textAttachments = attachmentCount === 1 ? attachmentCount + ' Attachment' : attachmentCount + ' Attachments';
      attachmentIndicator = (
        <div style={{display: 'inline', marginLeft: '5px'}} title={textAttachments}>
          <i className="icon fonticon-paperclip"></i>{attachmentCount}
        </div>
      );
    }

    if (conflictCount) {
      textConflicts = conflictCount === 1 ? conflictCount + ' Conflict' : conflictCount + ' Conflicts';
      conflictIndicator = (
        <div className="tableview-conflict" data-conflicts-indicator style={{display: 'inline'}} title={textConflicts}>
          <i
            style={{fontSize: '17px'}}
            className="icon icon-code-fork"></i>{conflictCount}
        </div>
      );
    }

    return (
      <td className="tableview-el-last" onClick={this.onClick.bind(this)}>
        {conflictIndicator}
        {attachmentIndicator}
      </td>
    );
  }

  getCopyButton (el) {
    const text = JSON.stringify(el, null, '  ');
    return (
      <td title={text} className="tableview-el-copy">
        <Copy
          title={text}
          text={text}
          uniqueKey={uuidv4()}
          onClipboardClick={this.showCopiedMessage} />
      </td>
    );
  }

  showCopiedMessage () {
    FauxtonAPI.addNotification({
      msg: 'The document content has been copied to the clipboard.',
      type: 'success',
      clear: true
    });
  }

  onClick (e) {
    this.props.onClick(this.props.el._id, this.props.el, e);
  }

  render () {
    const i = this.props.index;
    const docContent = this.props.el.content;
    const el = this.props.el;

    return (
      <tr key={"tableview-content-row-" + i}>
        {this.maybeGetCheckboxCell(el, i)}
        {this.getCopyButton(docContent)}
        {this.getRowContents(el, i)}
        {this.getAdditionalInfoRow(docContent)}
      </tr>
    );
  }
}

TableRow.propTypes = {
  docIdentifier: PropTypes.string.isRequired,
  docChecked: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  textOverflow: PropTypes.string
};
