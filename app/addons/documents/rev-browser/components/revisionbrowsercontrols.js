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

import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import app from '../../../../app';
import ReactComponents from "../../../components/react-components";
import ConflictingRevisionsDropDown from './conflictingrevisiondropdown';
import ConfirmModal from './confirmmodal';

const ConfirmButton = ReactComponents.ConfirmButton;
const storageKeyDeleteConflictsModal = 'deleteConflictsHideModal';

export default class RevisionBrowserControls extends React.Component {

  constructor (props) {
    super(props);

    this.state = {showModal: false};
    this.selectAsWinner = this.selectAsWinner.bind(this);
    this.onSelectAsWinnerClickOurs = this.onSelectAsWinnerClick.bind(this, this.props.ours);
    this.onSelectAsWinnerClickTheirs = this.onSelectAsWinnerClick.bind(this, this.props.theirs);
    this.onRevisionClick = this.onRevisionClick.bind(this);
    this.onForwardClick = this.onForwardClick.bind(this);
    this.onBackwardClick = this.onBackwardClick.bind(this);
  }

  onRevisionClick (revTheirs) {
    this.props.chooseLeaves(this.props.ours, revTheirs.value);
  }

  onForwardClick () {
    const conflictingRevs = this.props.conflictingRevs;
    const index = conflictingRevs.indexOf(this.props.theirs._rev);

    const next = conflictingRevs[index + 1];

    if (!next) {
      return;
    }

    this.props.chooseLeaves(this.props.ours, next);
  }

  onBackwardClick () {
    const conflictingRevs = this.props.conflictingRevs;
    const index = conflictingRevs.indexOf(this.props.theirs._rev);

    const next = conflictingRevs[index - 1];

    if (!next) {
      return;
    }

    this.props.chooseLeaves(this.props.ours, next);
  }

  selectAsWinner (docToWin, doNotShowModalAgain) {
    if (doNotShowModalAgain) {
      app.utils.localStorageSet(storageKeyDeleteConflictsModal, true);
    }

    this.props.selectRevAsWinner(docToWin._id, docToWin._rev, this.props.tree);
  }

  onSelectAsWinnerClick (docToWin) {
    if (app.utils.localStorageGet(storageKeyDeleteConflictsModal) !== true) {
      this.props.toggleConfirmModal(true, docToWin);
      return;
    }

    this.selectAsWinner(docToWin);
  }

  render () {
    const {tree} = this.props;
    const cellStyle = {paddingRight: '30px'};

    return (
      <div className="revision-browser-controls">
        <ConfirmModal
          toggleConfirmModal={this.props.toggleConfirmModal}
          onConfirm={this.selectAsWinner}
          docToWin={this.props.docToWin}
          show={this.props.showConfirmModal}
        />
        <table style={{margin: '10px 60px', width: '100%'}}>
          <tbody>
            <tr style={{height: '60px'}}>
              <td style={cellStyle}>Server-Selected Rev: </td>
              <td style={cellStyle}>
                <div style={{lineHeight: '36px', height: '36px', width: '337px', color: '#000', backgroundColor: '#ffbbbb'}}>
                  <b style={{paddingLeft: '10px'}}>{tree.winner}</b>
                </div>
              </td>
              <td>
                <ConfirmButton
                  onClick={this.onSelectAsWinnerClickOurs}
                  style={{marginRight: '10px', width: '220px'}}
                  text="Delete Other Conflicts"
                  buttonType="btn-secondary"
                  customIcon="icon-trophy" />
              </td>
            </tr>
            <tr style={{height: '60px'}}>
              <td style={cellStyle}>Conflicting Revisions: </td>
              <td style={cellStyle}>
                <ConflictingRevisionsDropDown
                  onRevisionClick={this.onRevisionClick}
                  onForwardClick={this.onForwardClick}
                  onBackwardClick={this.onBackwardClick}
                  options={this.props.dropdownData}
                  selected={this.props.theirs._rev} />
              </td>
              <td>
                <ConfirmButton
                  data-id="button-select-theirs"
                  onClick={this.onSelectAsWinnerClickTheirs}
                  style={{marginRight: '10px', width: '220px'}}
                  text="Select as Winner"
                  buttonType="btn-secondary"
                  customIcon="icon-trophy" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    );
  }
}
RevisionBrowserControls.propTypes = {
  tree: PropTypes.object.isRequired,
  ours: PropTypes.object.isRequired,
  conflictingRevs: PropTypes.array.isRequired,
};
