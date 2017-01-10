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
import Stores from "../stores";
import Documents from "../../resources";
import utils from "../../../../../test/mocha/testUtils";
FauxtonAPI.router = new FauxtonAPI.Router([]);

const assert = utils.assert;
const store = Stores.docEditorStore;

const doc = new Documents.Doc({id: 'foo'}, {database: 'bar'});

describe('DocEditorStore', function () {
  afterEach(function () {
    store.reset();
  });

  it('defines sensible defaults', function () {
    assert.equal(store.isLoading(), true);
    assert.equal(store.isCloneDocModalVisible(), false);
    assert.equal(store.isDeleteDocModalVisible(), false);
    assert.equal(store.isUploadModalVisible(), false);
    assert.equal(store.getNumFilesUploaded(), 0);
    assert.equal(store.isUploadInProgress(), false);
    assert.equal(store.getUploadLoadPercentage(), 0);
  });

  it('docLoaded() marks loading as complete', function () {
    store.docLoaded({ doc: doc });
    assert.equal(store.isLoading(), false);
  });

  it('showCloneDocModal / hideCloneDocModal', function () {
    store.showCloneDocModal();
    assert.equal(store.isCloneDocModalVisible(), true);
    store.hideCloneDocModal();
    assert.equal(store.isCloneDocModalVisible(), false);
  });

  it('showDeleteDocModal / hideCloneDocModal', function () {
    store.showDeleteDocModal();
    assert.equal(store.isDeleteDocModalVisible(), true);
    store.hideDeleteDocModal();
    assert.equal(store.isDeleteDocModalVisible(), false);
  });

  it('showCloneDocModal / hideCloneDocModal', function () {
    store.showUploadModal();
    assert.equal(store.isUploadModalVisible(), true);
    store.hideUploadModal();
    assert.equal(store.isUploadModalVisible(), false);
  });

  it('reset() resets all values', function () {
    store.docLoaded({ doc: doc });
    store.showCloneDocModal();
    store.showDeleteDocModal();
    store.showUploadModal();

    store.reset();
    assert.equal(store.isLoading(), true);
    assert.equal(store.isCloneDocModalVisible(), false);
    assert.equal(store.isDeleteDocModalVisible(), false);
    assert.equal(store.isUploadModalVisible(), false);
  });

});
