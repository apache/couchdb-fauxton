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
import Actions from "../actions";
import Documents from "../../resources";
import Databases from "../../../databases/base";
import utils from "../../../../../test/mocha/testUtils";
import sinon from "sinon";

const { restore } = utils;

describe('DocEditorActions', () => {
  const database = new Databases.Model({ id: 'db1' });
  const doc = new Documents.Doc({ _id: 'foo' }, { database: database });
  let fakeXMLHttpRequest, fakeOpen;

  beforeEach(() => {
    fakeXMLHttpRequest = sinon.stub(global, 'XMLHttpRequest');
    fakeOpen = sinon.stub();
    fakeXMLHttpRequest.returns({
      send: sinon.stub(),
      setRequestHeader: sinon.stub(),
      open: fakeOpen
    });
  });

  afterEach(() => {
    restore(FauxtonAPI.addNotification);
    restore(FauxtonAPI.navigate);
    restore(FauxtonAPI.urls);
    fakeXMLHttpRequest.restore();
  });

  it('uploadAttachment handles filenames with special chars', () => {
    sinon.stub(FauxtonAPI, 'addNotification');
    sinon.stub(FauxtonAPI, 'urls').callsFake((p1, p2, p3, p4, p5, p6) => {
      return [p1, p2, p3, p4, p5, p6].join('/');
    });
    const params = {
      rev: 'rev-num',
      doc: doc,
      files: [
        {
          name: 'file-#?&-123.txt',
          length: 100
        }
      ]
    };
    const mockDispatch = () => {};

    Actions.uploadAttachment(params)(mockDispatch);
    sinon.assert.calledWithExactly(
      fakeOpen,
      'PUT',
      'document/attachment/db1/foo/' + encodeURIComponent(params.files[0].name) + '/?rev=rev-num'
    );
  });

});
