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

/* global FormData */

import FauxtonAPI from "../../../core/api";
import ActionTypes from "./rev-browser.actiontypes";
import getTree from "visualizeRevTree/lib/getTree";
import PouchDB from "pouchdb-core";
import PouchHttpAdapter from 'pouchdb-adapter-http';
PouchDB.plugin(PouchHttpAdapter);

let db;

function initDiffEditor (dbName, docId) {
  const url = FauxtonAPI.urls('databaseBaseURL', 'server', dbName);
  db = PouchDB(url);

  // XXX: we need spec compliant promise support and get rid of jQ "deferreds"
  const d1 = $.Deferred();
  const d2 = $.Deferred();
  $.when(d1, d2).done((tree, doc) => {
    const conflictingRevs = getConflictingRevs(tree.paths, tree.winner, Object.keys(tree.deleted));
    const initialRev = conflictingRevs[0];

    if (!initialRev) {
      return dispatchData(tree, doc, conflictingRevs, null, dbName);
    }

    db.get(doc._id, {rev: initialRev})
      .then((conflictDoc) => {
        dispatchData(tree, doc, conflictingRevs, conflictDoc, dbName);
      });
  });

  db.get(docId)
    .then(d2.resolve);

  getTree(db, docId)
    .then(d1.resolve);
}

function getConflictingRevs (paths, winner, deleted) {

  return paths.reduce((acc, el) => {
    if (el[0] !== winner) {
      acc.push(el[0]);
    }

    return acc;
  }, [])
  .filter((el) => {
    return deleted.indexOf(el) === -1;
  });
}

function dispatchData (tree, doc, conflictingRevs, conflictDoc, databaseName) {
  FauxtonAPI.dispatch({
    type: ActionTypes.REV_BROWSER_REV_TREE_LOADED,
    options: {
      tree: tree,
      doc: doc,
      conflictDoc: conflictDoc,
      conflictingRevs: conflictingRevs,
      databaseName: databaseName
    }
  });
}

function toggleDiffView (enableDiff) {
  FauxtonAPI.dispatch({
    type: ActionTypes.REV_BROWSER_DIFF_ENABLE_DIFF_VIEW,
    options: {
      enableDiff: enableDiff
    }
  });
}

function chooseLeaves (doc, revTheirs) {
  db.get(doc._id, {rev: revTheirs})
    .then((res) => {
      dispatchDocsToDiff(doc, res);
    });
}

function dispatchDocsToDiff (doc, theirs) {
  FauxtonAPI.dispatch({
    type: ActionTypes.REV_BROWSER_DIFF_DOCS_READY,
    options: {
      theirs: theirs,
      ours: doc
    }
  });
}

function showConfirmModal (show, docToWin) {
  FauxtonAPI.dispatch({
    type: ActionTypes.REV_BROWSER_SHOW_CONFIRM_MODAL,
    options: {
      show: show,
      docToWin: docToWin
    }
  });
}

function selectRevAsWinner (databaseName, docId, paths, revToWin) {
  const revsToDelete = getConflictingRevs(paths, revToWin, []);
  const payload = buildBulkDeletePayload(docId, revsToDelete);

  $.ajax({
    url: FauxtonAPI.urls('bulk_docs', 'server', databaseName, ''),
    type: 'POST',
    contentType: 'application/json; charset=UTF-8',
    data: JSON.stringify(payload),
    success: () => {
      FauxtonAPI.addNotification({
        msg: 'Conflicts successfully solved.',
        clear: true
      });
      showConfirmModal(false, null);
      FauxtonAPI.navigate(FauxtonAPI.urls('allDocs', 'app', databaseName, ''));
    },
    error: () => {
      FauxtonAPI.addNotification({
        msg: 'Failed to delete clean up conflicts!',
        type: 'error',
        clear: true
      });
    }
  });
}

function buildBulkDeletePayload (docId, revs) {
  const list = revs.map((rev) => {
    return {
      "_id": docId,
      "_rev": rev,
      "_deleted": true
    };
  });

  return { "docs": list };
}

export default {
  getConflictingRevs: getConflictingRevs,
  selectRevAsWinner: selectRevAsWinner,
  buildBulkDeletePayload: buildBulkDeletePayload,
  chooseLeaves: chooseLeaves,
  dispatchDocsToDiff: dispatchDocsToDiff,
  initDiffEditor: initDiffEditor,
  dispatchData: dispatchData,
  toggleDiffView: toggleDiffView,
  showConfirmModal: showConfirmModal
};
