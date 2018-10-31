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
import utils from "../../../../../test/mocha/testUtils";
import Documents from "../../resources";
import ActionTypes from "../actiontypes";
import reducer from "../reducers";

FauxtonAPI.router = new FauxtonAPI.Router([]);

const assert = utils.assert;
const doc = new Documents.Doc({id: 'foo'}, {database: 'bar'});

describe('DocEditor Reducer', function () {

  it('defines sensible defaults', function () {
    const newState = reducer(undefined, { type: 'do_nothing'});

    assert.equal(newState.isLoading, true);
    assert.equal(newState.cloneDocModalVisible, false);
    assert.equal(newState.deleteDocModalVisible, false);
    assert.equal(newState.uploadModalVisible, false);
    assert.equal(newState.numFilesUploaded, 0);
    assert.equal(newState.uploadInProgress, false);
    assert.equal(newState.uploadPercentage, 0);
  });

  it('marks loading as complete after doc is loaded', function () {
    const newState = reducer(undefined, {
      type: ActionTypes.DOC_LOADED,
      options: { doc: doc }
    });
    assert.equal(newState.isLoading, false);
  });

  it('showCloneDocModal / hideCloneDocModal', function () {
    const newStateShow = reducer(undefined, { type: ActionTypes.SHOW_CLONE_DOC_MODAL });
    assert.equal(newStateShow.cloneDocModalVisible, true);

    const newStateHide = reducer(undefined, { type: ActionTypes.HIDE_CLONE_DOC_MODAL });
    assert.equal(newStateHide.cloneDocModalVisible, false);
  });

  it('showDeleteDocModal / hideDeleteDocModal', function () {
    const newStateShow = reducer(undefined, { type: ActionTypes.SHOW_DELETE_DOC_CONFIRMATION_MODAL });
    assert.equal(newStateShow.deleteDocModalVisible, true);

    const newStateHide = reducer(undefined, { type: ActionTypes.HIDE_DELETE_DOC_CONFIRMATION_MODAL });
    assert.equal(newStateHide.deleteDocModalVisible, false);
  });

  it('showUploadModal / hideUploadModal', function () {
    const newStateShow = reducer(undefined, { type: ActionTypes.SHOW_UPLOAD_MODAL });
    assert.equal(newStateShow.uploadModalVisible, true);

    const newStateHide = reducer(undefined, { type: ActionTypes.HIDE_UPLOAD_MODAL });
    assert.equal(newStateHide.uploadModalVisible, false);
  });

});
