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
import React from "react";
import ReactDOM from "react-dom";
import Documents from "../../resources";
import Components from "../components";
import Actions from "../actions";
import ActionTypes from "../actiontypes";
import Databases from "../../../databases/base";
import utils from "../../../../../test/mocha/testUtils";
import {mount} from 'enzyme';
import '../../base';

FauxtonAPI.router = new FauxtonAPI.Router([]);
const assert = utils.assert;
const docJSON = {
  _id: '_design/test-doc',
  views: {
    'test-view': {
      map: '() => {};'
    }
  }
};

const docWithAttachmentsJSON = {
  _id: '_design/test-doc',
  _rev: '12345',
  blah: {
    whatever: {
      something: 1
    }
  },
  _attachments: {
    "one.png": {
      "content-type": "images/png",
      "length": 100
    },
    "one.zip": {
      "content-type": "application/zip",
      "length": 111100
    }
  }
};

const database = new Databases.Model({ id: 'id' });


describe('DocEditorController', () => {
  it('loading indicator appears on load', () => {
    const el = mount(<Components.DocEditorController />);
    assert.equal(el.find('.loading-lines').length, 1);
  });

  it('new docs do not show the button row', () => {
    const el = mount(<Components.DocEditorController isNewDoc={true} database={database} />);

    const doc = new Documents.Doc(docJSON, { database: database });
    FauxtonAPI.dispatch({
      type: ActionTypes.DOC_LOADED,
      options: {
        doc: doc
      }
    });

    assert.equal(el.find('.loading-lines').length, 0);
    assert.equal(el.find('.icon-circle-arrow-up').length, 0);
    assert.equal(el.find('.icon-repeat').length, 0);
    assert.equal(el.find('.icon-trash').length, 0);
  });

  it('view attachments button does not appear with no attachments', () => {
    const el = mount(<Components.DocEditorController database={database} />);

    const doc = new Documents.Doc(docJSON, { database: database });
    FauxtonAPI.dispatch({
      type: ActionTypes.DOC_LOADED,
      options: {
        doc: doc
      }
    });
    assert.equal(el.find('.view-attachments-section').length, 0);
  });

  it('view attachments button shows up when the doc has attachments', () => {
    const el = mount(<Components.DocEditorController database={database} />);

    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    FauxtonAPI.dispatch({
      type: ActionTypes.DOC_LOADED,
      options: {
        doc: doc
      }
    });
    assert.equal(el.find('.view-attachments-section').length, 1);
  });

  it('view attachments dropdown contains right number of docs', () => {
    const el = mount(<Components.DocEditorController database={database} />);

    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    FauxtonAPI.dispatch({
      type: ActionTypes.DOC_LOADED,
      options: {
        doc: doc
      }
    });
    assert.equal(el.find('.view-attachments-section .dropdown-menu li').length, 2);
  });

  it('view attachments dropdown contains correct urls', () => {
    const el = mount(
      <Components.DocEditorController database={database} />
    );

    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    FauxtonAPI.dispatch({
      type: ActionTypes.DOC_LOADED,
      options: {
        doc: doc
      }
    });

    const $attachmentNode = el.find('.view-attachments-section .dropdown-menu li');
    const attachmentURLactual = $attachmentNode.find('a').first().prop('href');

    assert.equal(attachmentURLactual, '../../id/_design/test-doc/one.png');
  });

  it.skip('setting deleteDocModal=true in store shows modal', () => {
    mount(<Components.DocEditorController database={database} />);
    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    FauxtonAPI.dispatch({
      type: ActionTypes.DOC_LOADED,
      options: {
        doc: doc
      }
    });

    // uber-kludgy, but the delete doc modal is a generic dialog used multiple times, so this test first checks
    // no modal is open, then confirms the open modal contains the delete dialog message
    assert.equal($('body').find('.confirmation-modal').length, 0);

    Actions.showDeleteDocModal();

    const modalContent = $('body').find('.confirmation-modal .modal-body p')[0];
    assert.ok(/Are you sure you want to delete this document\?/.test(modalContent.innerHTML));
  });

  it.skip('setting uploadDocModal=true in store shows modal', () => {
    mount(<Components.DocEditorController database={database} />);
    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    FauxtonAPI.dispatch({
      type: ActionTypes.DOC_LOADED,
      options: {
        doc: doc
      }
    });

    assert.equal($('body').find('.upload-file-modal').length, 0);
    Actions.showUploadModal();
    assert.notEqual($('body').find('.upload-file-modal').length, 0);
  });
});


describe("AttachmentsPanelButton", () => {
  let doc;

  beforeEach(() => {
    doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
  });

  it('does not show up when loading', () => {
    const el = mount(<Components.AttachmentsPanelButton isLoading={true} doc={doc} />);
    assert.equal(el.find('.panel-button').length, 0);
  });

  it('shows up after loading', () => {
    const el = mount(<Components.AttachmentsPanelButton isLoading={false} doc={doc} />);
    assert.equal(el.find('.panel-button').length, 1);
  });
});


describe("Custom Extension Buttons", () => {
  it('supports buttons', () => {
    class CustomButton extends React.Component {
      render() {
        return (
          <div>
            <button>Oh no she di'n't!</button>
            <span id="testDatabaseName">{this.props.database.id}</span>
          </div>
        );
      }
    }

    FauxtonAPI.registerExtension('DocEditor:icons', CustomButton);

    const el = mount(<Components.DocEditorController database={database} />);
    assert.isTrue(/Oh\sno\sshe\sdi'n't!/.test(el.html()));

    // confirm the database name was also included
    assert.equal(el.find("#testDatabaseName").text(), database.id);
  });
});
