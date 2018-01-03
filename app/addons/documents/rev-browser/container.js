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

import { connect } from 'react-redux';
import RevisionBrowserController from './components/controller';

import {
  getTree,
  getDoc,
  getConflictDoc,
  getConflictingRev,
  getDatabaseName,
  getOurs,
  getTheirs,
  getShowConfirmModal,
  getDropdownData,
  getIsDiffViewEnabled,
  getDocToWin
} from './reducers';

import {
  toggleConfirmModal,
  initDiffEditor,
  chooseLeaves,
  selectRevAsWinner,
  toggleDiffView
} from './actions';

const mapStateToProps = ({revisionBrowser}, ownProps) => {
  return {
    docId: ownProps.docId,
    tree: getTree(revisionBrowser),
    doc: getDoc(revisionBrowser),
    conflictDoc: getConflictDoc(revisionBrowser),
    conflictingRevs: getConflictingRev(revisionBrowser),
    databaseName: getDatabaseName(revisionBrowser),
    ours: getOurs(revisionBrowser),
    theirs: getTheirs(revisionBrowser),
    showConfirmModal: getShowConfirmModal(revisionBrowser),
    dropdownData: getDropdownData(revisionBrowser),
    isDiffViewEnabled: getIsDiffViewEnabled(revisionBrowser),
    docToWin: getDocToWin(revisionBrowser)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    toggleConfirmModal (show, docToWin) {
      dispatch(toggleConfirmModal(show, docToWin));
    },

    initDiffEditor () {
      dispatch(initDiffEditor(ownProps.databaseName, ownProps.docId));
    },

    chooseLeaves (doc, revTheirs) {
      dispatch(chooseLeaves(doc, revTheirs));
    },

    selectRevAsWinner (id, rev, tree) {
      dispatch(selectRevAsWinner(ownProps.databaseName, id, tree.paths, rev));
    },

    toggleDiffView (enableDiff) {
      dispatch(toggleDiffView(enableDiff));
    }
  };
};

const RevisionBrowserContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(RevisionBrowserController);

export default RevisionBrowserContainer;
