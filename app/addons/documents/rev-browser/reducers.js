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

import {
  REV_BROWSER_REV_TREE_LOADED,
  REV_BROWSER_DIFF_DOCS_READY,
  REV_BROWSER_DIFF_ENABLE_DIFF_VIEW,
  REV_BROWSER_SHOW_CONFIRM_MODAL
} from './actiontypes';

const initialState = {
  tree: [],
  doc: {},
  conflictDoc: false,
  conflictingRevs: [],
  databaseName: '',
  ours: null,
  theirs: null,
  isDiffViewEnabled: true,
  showConfirmModal: false,
  docToWin: null
};

const revisionConflicts = (state = initialState, {type, options}) => {

  switch (type) {
    case REV_BROWSER_REV_TREE_LOADED:
      const {
        tree,
        doc,
        conflictDoc,
        conflictingRevs,
        databaseName,
      } = options;
      return {
        ...state,
        tree,
        doc,
        conflictDoc,
        conflictingRevs,
        databaseName,
        theirs: conflictDoc,
        ours: doc
      };

    case REV_BROWSER_DIFF_DOCS_READY:
      return {
        ...state,
        theirs: options.theirs
      };

    case REV_BROWSER_DIFF_ENABLE_DIFF_VIEW:
      return {
        ...state,
        isDiffViewEnabled: options.enableDiff
      };

    case REV_BROWSER_SHOW_CONFIRM_MODAL:
      return {
        ...state,
        showConfirmModal: options.show,
        docToWin: options.docToWin
      };

    default:
      return state;
  }

};

export default revisionConflicts;

export const getTree = state => state.tree;
export const getDoc = state => state.doc;
export const getConflictDoc = state => state.conflictDoc;
export const getConflictingRev = state => state.conflictingRevs;
export const getDatabaseName = state => state.databaseName;
export const getOurs = state => state.ours;
export const getTheirs = state => state.theirs;
export const getShowConfirmModal = state => state.showConfirmModal;
export const getDropdownData = state => state.conflictingRevs.map(rev => { return {value: rev, label: rev}; });
export const getIsDiffViewEnabled = state => state.isDiffViewEnabled;
export const getDocToWin = state => state.docToWin;
