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

import FauxtonAPI from "../../../../core/api";
import Documents from "../../resources";
import ActionTypes from "../actiontypes";
import reducer from "../reducers";

FauxtonAPI.router = new FauxtonAPI.Router([]);

const doc = new Documents.Doc({id: 'foo'}, {database: 'bar'});

describe('DocEditor Reducer', function () {

  it('defines sensible defaults', function () {
    const newState = reducer(undefined, { type: 'do_nothing'});

    expect(newState.isLoading).toBe(true);
    expect(newState.isSaving).toBe(false);
    expect(newState.cloneDocModalVisible).toBe(false);
    expect(newState.deleteDocModalVisible).toBe(false);
    expect(newState.uploadModalVisible).toBe(false);
    expect(newState.numFilesUploaded).toBe(0);
    expect(newState.uploadInProgress).toBe(false);
    expect(newState.uploadPercentage).toBe(0);
  });

  it('marks loading as complete after doc is loaded', function () {
    const newState = reducer(undefined, {
      type: ActionTypes.DOC_LOADED,
      options: { doc: doc }
    });
    expect(newState.isLoading).toBe(false);
  });

  it('showCloneDocModal / hideCloneDocModal', function () {
    const newStateShow = reducer(undefined, { type: ActionTypes.SHOW_CLONE_DOC_MODAL });
    expect(newStateShow.cloneDocModalVisible).toBe(true);

    const newStateHide = reducer(undefined, { type: ActionTypes.HIDE_CLONE_DOC_MODAL });
    expect(newStateHide.cloneDocModalVisible).toBe(false);
  });

  it('showDeleteDocModal / hideDeleteDocModal', function () {
    const newStateShow = reducer(undefined, { type: ActionTypes.SHOW_DELETE_DOC_CONFIRMATION_MODAL });
    expect(newStateShow.deleteDocModalVisible).toBe(true);

    const newStateHide = reducer(undefined, { type: ActionTypes.HIDE_DELETE_DOC_CONFIRMATION_MODAL });
    expect(newStateHide.deleteDocModalVisible).toBe(false);
  });

  it('showUploadModal / hideUploadModal', function () {
    const newStateShow = reducer(undefined, { type: ActionTypes.SHOW_UPLOAD_MODAL });
    expect(newStateShow.uploadModalVisible).toBe(true);

    const newStateHide = reducer(undefined, { type: ActionTypes.HIDE_UPLOAD_MODAL });
    expect(newStateHide.uploadModalVisible).toBe(false);
  });

  it('saving document in-progress / completed', function () {
    const newStateSaving = reducer(undefined, { type: ActionTypes.SAVING_DOCUMENT });
    expect(newStateSaving.isSaving).toBe(true);

    const newStateSavingDone = reducer(undefined, { type: ActionTypes.SAVING_DOCUMENT_COMPLETED });
    expect(newStateSavingDone.isSaving).toBe(false);
  });

});
