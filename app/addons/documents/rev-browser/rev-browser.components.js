import app from "../../../app";

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
import RevActions from "./rev-browser.actions";
import RevStores from "./rev-browser.stores";
import ReactComponents from "../../components/react-components";
import { ButtonGroup, Button, Modal } from "react-bootstrap";
import ReactSelect from "react-select";
import jdp from "jsondiffpatch";
import jdpformatters from "jsondiffpatch/src/formatters/html";
import ace from "brace";
import "jsondiffpatch/public/formatters-styles/html.css";

const storageKeyDeleteConflictsModal = 'deleteConflictsHideModal';

const store = RevStores.revBrowserStore;
const ConfirmButton = ReactComponents.ConfirmButton;

require('brace/ext/static_highlight');
const highlight = ace.acequire('ace/ext/static_highlight');

require('brace/mode/json');
const JavaScriptMode = ace.acequire('ace/mode/json').Mode;

require('brace/theme/idle_fingers');
const theme = ace.acequire('ace/theme/idle_fingers');


class DiffyController extends React.Component {

  constructor (props) {
    super(props);

    this.state = this.getStoreState();
  }

  getStoreState () {

    return {
      tree: store.getRevTree(),
      ours: store.getOurs(),
      theirs: store.getTheirs(),
      conflictingRevs: store.getConflictingRevs(),
      dropdownData: store.getDropdownData(),
      isDiffViewEnabled: store.getIsDiffViewEnabled(),
      databaseName: store.getDatabaseName()
    };
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onChange);
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  toggleDiffView (enableDiff) {
    RevActions.toggleDiffView(enableDiff);
  }

  render () {
    const {tree, ours, theirs, conflictingRevs, isDiffViewEnabled} = this.state;

    if (!tree) {
      return null;
    }

    // no conflicts happened for this doc
    if (!theirs || !conflictingRevs.length) {
      return <div style={{textAlign: 'center', color: '#fff'}}><h2>No conflicts</h2></div>;
    }

    return (
      <div className="revision-wrapper scrollable">
        <RevisionBrowserControls {...this.state} />
        <div className="revision-view-controls">
          <ButtonGroup className="two-sides-toggle-button">
            <Button
              style={{width: '120px'}}
              className={isDiffViewEnabled ? 'active' : ''}
              onClick={this.toggleDiffView.bind(this, true)}
            >
              <i className="icon-columns" /> Diff
            </Button>
            <Button
              style={{width: '120px'}}
              className={isDiffViewEnabled ? '' : 'active'}
              onClick={this.toggleDiffView.bind(this, false)}
            >
              <i className="icon-file-text" /> Document
            </Button>
          </ButtonGroup>
        </div>

        {isDiffViewEnabled ?
          <RevisionDiffArea ours={ours} theirs={theirs} /> :
          <SplitScreenArea ours={ours} theirs={theirs} /> }
      </div>
    );
  }
}


class SplitScreenArea extends React.Component {

  constructor (props) {
    super(props);
  }

  componentDidUpdate () {
    this.hightlightAfterRender();
  }

  componentDidMount () {
    this.hightlightAfterRender();
  }

  hightlightAfterRender () {
    const format = (input) => { return JSON.stringify(input, null, '  '); };

    const jsmode = new JavaScriptMode();
    const left = this.revLeftOurs;
    const right = this.revRightTheirs;

    const leftRes = highlight.render(format(this.props.ours), jsmode, theme, 0, true);
    left.innerHTML = leftRes.html;
    const rightRes = highlight.render(format(this.props.theirs), jsmode, theme, 0, true);
    right.innerHTML = rightRes.html;
  }

  render () {
    const {ours, theirs} = this.props;

    if (!ours || !theirs) {
      return <div></div>;
    }

    return (
      <div className="revision-split-area">
        <div data-id="ours" style={{width: '50%'}}>
          <div style={{marginBottom: '20px'}}>{ours._rev} (Server-Selected Rev)</div>
          <pre ref={node => this.revLeftOurs = node}></pre>
        </div>

        <div data-id="theirs" style={{width: '50%'}}>
          <div style={{marginBottom: '20px'}}>{theirs._rev}</div>
          <pre ref={node => this.revRightTheirs = node}></pre>
        </div>
      </div>
    );
  }
}

const RevisionDiffArea = ({ours, theirs}) => {
  if (!ours || !theirs) {
    return <div></div>;
  }

  const delta = jdp.diff(ours, theirs);
  const html = jdpformatters.format(delta, ours);

  return (
    <div className="revision-diff-area">
      <div
        style={{marginTop: '30px'}}
        dangerouslySetInnerHTML={{__html: html}}
      ></div>
    </div>
  );
};
RevisionDiffArea.propTypes = {
  ours: PropTypes.object,
  theirs: PropTypes.object,
  currentRev: PropTypes.string
};


const ConflictingRevisionsDropDown = ({options, selected, onRevisionClick, onBackwardClick, onForwardClick}) => {
  return (
    <div className="conflicting-revs-dropdown">
      <BackForwardControls backward onClick={onBackwardClick} />
      <div style={{width: '345px', margin: '0 5px'}}>
        <ReactSelect
          name="form-field-name"
          value={selected}
          options={options}
          clearable={false}
          onChange={onRevisionClick} />
      </div>
      <BackForwardControls forward onClick={onForwardClick} />
    </div>
  );
};
ConflictingRevisionsDropDown.propTypes = {
  options: PropTypes.array.isRequired,
  selected: PropTypes.string.isRequired,
  onRevisionClick: PropTypes.func.isRequired,
  onBackwardClick: PropTypes.func.isRequired,
  onForwardClick: PropTypes.func.isRequired,
};

class RevisionBrowserControls extends React.Component {

  constructor (props) {
    super(props);

    this.state = {showModal: false};
  }

  onRevisionClick (revTheirs) {

    RevActions.chooseLeaves(this.props.ours, revTheirs.value);
  }

  onForwardClick () {
    const conflictingRevs = this.props.conflictingRevs;
    const index = conflictingRevs.indexOf(this.props.theirs._rev);

    const next = conflictingRevs[index + 1];

    if (!next) {
      return;
    }

    RevActions.chooseLeaves(this.props.ours, next);
  }

  onBackwardClick () {
    const conflictingRevs = this.props.conflictingRevs;
    const index = conflictingRevs.indexOf(this.props.theirs._rev);

    const next = conflictingRevs[index - 1];

    if (!next) {
      return;
    }

    RevActions.chooseLeaves(this.props.ours, next);
  }

  selectAsWinner (docToWin, doNotShowModalAgain) {
    if (doNotShowModalAgain) {
      app.utils.localStorageSet(storageKeyDeleteConflictsModal, true);
    }

    RevActions.selectRevAsWinner(this.props.databaseName, docToWin._id, this.props.tree.paths, docToWin._rev);
  }

  onSelectAsWinnerClick (docToWin) {
    if (app.utils.localStorageGet(storageKeyDeleteConflictsModal) !== true) {
      RevActions.showConfirmModal(true, docToWin);
      return;
    }

    this.selectAsWinner(docToWin);
  }

  render () {
    const {tree} = this.props;
    const cellStyle = {paddingRight: '30px'};

    return (
      <div className="revision-browser-controls">
        <ConfirmModal onConfirm={this.selectAsWinner.bind(this)} />
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
                  onClick={this.onSelectAsWinnerClick.bind(this, this.props.ours)}
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
                  onRevisionClick={this.onRevisionClick.bind(this)}
                  onForwardClick={this.onForwardClick.bind(this)}
                  onBackwardClick={this.onBackwardClick.bind(this)}
                  options={this.props.dropdownData}
                  selected={this.props.theirs._rev} />
              </td>
              <td>
                <ConfirmButton
                  data-id="button-select-theirs"
                  onClick={this.onSelectAsWinnerClick.bind(this, this.props.theirs)}
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

class ConfirmModal extends React.Component {

  constructor (props) {
    super(props);

    this.state = this.getStoreState();
  }

  getStoreState () {
    return {
      show: store.getShowConfirmModal(),
      docToWin: store.getDocToWin(),
      checked: false
    };
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onChange);
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  close () {
    RevActions.showConfirmModal(false, null);
  }

  onDeleteConflicts () {
    const hideModal = this.state.checked;
    this.props.onConfirm(this.state.docToWin, hideModal);
  }

  render () {
    return (
      <Modal dialogClassName="delete-conflicts-modal" show={this.state.show} onHide={this.close}>
        <Modal.Header closeButton={false}>
          <Modal.Title>Solve Conflicts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <i className="icon-warning-sign"></i> Do you want to delete all conflicting revisions for this document?
          </p>


        </Modal.Body>
        <Modal.Footer>
          <div style={{float: 'left', marginTop: '10px'}}>
            <label>
              <input
                style={{margin: '0 5px 3px 0'}}
                onChange={() => { this.setState({checked: !this.state.checked }); }}
                type="checkbox" />
                Do not show this warning message again
            </label>
          </div>
          <a
            style={{marginRight: '10px', cursor: 'pointer'}}
            onClick={this.close}
            data-bypass="true"
          >
            Cancel
          </a>

          <ConfirmButton
            onClick={this.onDeleteConflicts.bind(this)}
            text="Delete Revisions"
            buttonType="btn-danger" />
        </Modal.Footer>
      </Modal>
    );
  }
}
ConfirmModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
};

const BackForwardControls = ({onClick, forward}) => {
  const icon = forward ? 'fonticon-right-open' : 'fonticon-left-open';
  const style = {height: '20px', width: '11px', marginTop: '7px'};

  return <div style={style} className={icon} onClick={onClick}></div>;
};
BackForwardControls.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default {
  DiffyController: DiffyController
};
