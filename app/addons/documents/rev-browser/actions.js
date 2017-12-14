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
import {post} from "../../../core/ajax";
import ActionTypes from "./actiontypes";
import getTree from "visualizeRevTree/lib/getTree";
import PouchDB from "pouchdb-core";
import PouchHttpAdapter from 'pouchdb-adapter-http';
PouchDB.plugin(PouchHttpAdapter);

let db;

export const initDiffEditor = (dbName, docId) => dispatch => {
  const url = FauxtonAPI.urls('databaseBaseURL', 'server', dbName);
  db = PouchDB(url);

  // XXX: we need spec compliant promise support and get rid of jQ "deferreds"
  Promise.all([db.get(docId), getTree(db, docId)])
  .then(([doc, tree]) => {
    const conflictingRevs = getConflictingRevs(tree.paths, tree.winner, Object.keys(tree.deleted));
    const initialRev = conflictingRevs[0];

    if (!initialRev) {
      return dispatch(dispatchData(tree, doc, conflictingRevs, null, dbName));
    }

    db.get(doc._id, {rev: initialRev})
      .then((conflictDoc) => {
        dispatch(dispatchData(tree, doc, conflictingRevs, conflictDoc, dbName));
      });
  });
};

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

const dispatchData = (tree, doc, conflictingRevs, conflictDoc, databaseName) => {
  return {
    type: ActionTypes.REV_BROWSER_REV_TREE_LOADED,
    options: {
      tree,
      doc,
      conflictDoc,
      conflictingRevs,
      databaseName
    }
  };
};

export const toggleDiffView = (enableDiff) => {
  return {
    type: ActionTypes.REV_BROWSER_DIFF_ENABLE_DIFF_VIEW,
    options: {
      enableDiff: enableDiff
    }
  };
};

export const chooseLeaves = (doc, revTheirs) => dispatch => {
  db.get(doc._id, {rev: revTheirs})
    .then((res) => {
      dispatch(dispatchDocsToDiff(doc, res));
    });
};

const dispatchDocsToDiff = (doc, theirs) => {
  return {
    type: ActionTypes.REV_BROWSER_DIFF_DOCS_READY,
    options: {
      theirs: theirs,
      ours: doc
    }
  };
};

export const toggleConfirmModal = (show, docToWin) => {
  return {
    type: ActionTypes.REV_BROWSER_SHOW_CONFIRM_MODAL,
    options: {
      show: show,
      docToWin: docToWin
    }
  };
};

export const selectRevAsWinner = (databaseName, docId, paths, revToWin) => dispatch => {
  const revsToDelete = getConflictingRevs(paths, revToWin, []);
  const payload = buildBulkDeletePayload(docId, revsToDelete);

  post(FauxtonAPI.urls('bulk_docs', 'server', databaseName, ''), payload)
  .then((resp) => {
    if (resp.error) {
      return FauxtonAPI.addNotification({
        msg: 'Failed to delete clean up conflicts!',
        type: 'error',
        clear: true
      });
    }

    FauxtonAPI.addNotification({
      msg: 'Conflicts successfully solved.',
      clear: true
    });
    dispatch(toggleConfirmModal(false, null));
    FauxtonAPI.navigate(FauxtonAPI.urls('allDocs', 'app', databaseName, ''));
  });
};

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

// export default {
//   getConflictingRevs,
//   selectRevAsWinner,
//   buildBulkDeletePayload,
//   chooseLeaves: chooseLeaves,
//   dispatchDocsToDiff: dispatchDocsToDiff,
//   initDiffEditor: initDiffEditor,
//   dispatchData: dispatchData,
//   toggleDiffView: toggleDiffView,
//   showConfirmModal: showConfirmModal
// };
