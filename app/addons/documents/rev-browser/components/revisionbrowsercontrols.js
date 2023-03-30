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
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import app from '../../../../app';
import ReactComponents from '../../../components/react-components';
import ConflictingRevisionsDropDown from './conflictingrevisiondropdown';
import ConfirmModal from './confirmmodal';

const ConfirmButton = ReactComponents.ConfirmButton;
const storageKeyDeleteConflictsModal = 'deleteConflictsHideModal';

export default class RevisionBrowserControls extends React.Component {
  constructor(props) {
    super(props);

    this.state = { showModal: false };
    this.selectAsWinner = this.selectAsWinner.bind(this);
    this.onSelectAsWinnerClickOurs = this.onSelectAsWinnerClick.bind(
      this,
      this.props.ours
    );
    this.onSelectAsWinnerClickTheirs = this.onSelectAsWinnerClick.bind(
      this,
      this.props.theirs
    );
    this.onRevisionClick = this.onRevisionClick.bind(this);
    this.onForwardClick = this.onForwardClick.bind(this);
    this.onBackwardClick = this.onBackwardClick.bind(this);
  }

  onRevisionClick(revTheirs) {
    this.props.chooseLeaves(this.props.ours, revTheirs.value);
  }

  onForwardClick() {
    const conflictingRevs = this.props.conflictingRevs;
    const index = conflictingRevs.indexOf(this.props.theirs._rev);

    const next = conflictingRevs[index + 1];

    if (!next) {
      return;
    }

    this.props.chooseLeaves(this.props.ours, next);
  }

  onBackwardClick() {
    const conflictingRevs = this.props.conflictingRevs;
    const index = conflictingRevs.indexOf(this.props.theirs._rev);

    const next = conflictingRevs[index - 1];

    if (!next) {
      return;
    }

    this.props.chooseLeaves(this.props.ours, next);
  }

  selectAsWinner(docToWin, doNotShowModalAgain) {
    if (doNotShowModalAgain) {
      app.utils.localStorageSet(storageKeyDeleteConflictsModal, true);
    }

    this.props.selectRevAsWinner(docToWin._id, docToWin._rev, this.props.tree);
  }

  onSelectAsWinnerClick(docToWin) {
    if (app.utils.localStorageGet(storageKeyDeleteConflictsModal) !== true) {
      this.props.toggleConfirmModal(true, docToWin);
      return;
    }

    this.selectAsWinner(docToWin);
  }

  render() {
    const { tree } = this.props;

    return (
      <div className="revision-browser-controls">
        <ConfirmModal
          toggleConfirmModal={this.props.toggleConfirmModal}
          onConfirm={this.selectAsWinner}
          docToWin={this.props.docToWin}
          show={this.props.showConfirmModal}
        />

        <div className="row align-items-center mb-3">
          <div className="revision-browser-controls-label-col col-auto">Server-Selected Rev:</div>
          <div className="col-5 col-xl-4">
            <Form.Control type="text" placeholder={tree.winner} readOnly /></div>
          <div className="col">
            <ConfirmButton
              onClick={this.onSelectAsWinnerClickOurs}
              text="Delete Other Conflicts"
              variant="secondary"
              customIcon="fonticon-trophy"
            />
          </div>
        </div>

        <div className="row">
          <div className="revision-browser-controls-label-col col-auto">Conflicting Revisions:</div>
          <div className="col-5 col-xl-4">
            <ConflictingRevisionsDropDown
              onRevisionClick={this.onRevisionClick}
              onForwardClick={this.onForwardClick}
              onBackwardClick={this.onBackwardClick}
              options={this.props.dropdownData}
              selected={this.props.theirs._rev}
            />
          </div>
          <div className="col-3">
            <ConfirmButton
              data-id="button-select-theirs"
              onClick={this.onSelectAsWinnerClickTheirs}
              text="Select as Winner"
              variant="secondary"
              customIcon="fonticon-trophy"
            />
          </div>
        </div>
      </div>
    );
  }
}
RevisionBrowserControls.propTypes = {
  tree: PropTypes.object.isRequired,
  ours: PropTypes.object.isRequired,
  conflictingRevs: PropTypes.array.isRequired,
};
