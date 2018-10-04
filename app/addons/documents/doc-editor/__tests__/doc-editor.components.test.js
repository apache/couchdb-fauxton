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

import FauxtonAPI from '../../../../core/api';
import React from 'react';
import ReactDOM from 'react-dom';
import Documents from '../../resources';
import AttachmentsPanelButton from '../components/AttachmentsPanelButton';
import DocEditorScreen from '../components/DocEditorScreen';
import DocEditorContainer from '../components/DocEditorContainer';
import Actions from '../actions';
import ActionTypes from '../actiontypes';
import Databases from '../../../databases/base';
import utils from '../../../../../test/mocha/testUtils';
import {mount, shallow} from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import docEditorReducer from '../reducers';

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
  _id: '_design/test#doc',
  _rev: '12345',
  blah: {
    whatever: {
      something: 1
    }
  },
  _attachments: {
    "one%2F.png": {
      "content-type": "images/png",
      "length": 100
    },
    "one.zip": {
      "content-type": "application/zip",
      "length": 111100
    }
  }
};

const database = new Databases.Model({ id: 'a/special?db' });
const defaultProps = {
  isLoading: true,
  isNewDoc: true,
  database: database,
  doc: new Documents.NewDoc(null, { database: database }),
  conflictCount: 0,
  saveDoc: () => {},

  isCloneDocModalVisible: false,
  showCloneDocModal: () => {},
  hideCloneDocModal: () => {},
  cloneDoc: () => {},

  isDeleteDocModalVisible: false,
  showDeleteDocModal: () => {},
  hideDeleteDocModal: () => {},
  deleteDoc: () => {},

  isUploadModalVisible: false,
  uploadInProgress: false,
  uploadPercentage: 0,
  uploadErrorMessage: '',
  numFilesUploaded: 0,
  showUploadModal: () => {},
  hideUploadModal: () => {},
  cancelUpload: () => {},
  resetUploadModal: () => {},
  uploadAttachment: () => {}
};

describe('DocEditorScreen', () => {

  it('loading indicator appears on load', () => {
    const el = mount(<DocEditorScreen {...defaultProps} />);
    assert.equal(el.find('.loading-lines').length, 1);
  });

  it('new docs do not show the button row', () => {
    const doc = new Documents.Doc(docJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={true}
      database={database}
      doc={doc} />);

    assert.equal(el.find('.loading-lines').length, 0);
    assert.equal(el.find('.icon-circle-arrow-up').length, 0);
    assert.equal(el.find('.icon-repeat').length, 0);
    assert.equal(el.find('.icon-trash').length, 0);
  });

  it('view attachments button does not appear with no attachments', () => {
    const doc = new Documents.Doc(docJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={false}
      database={database}
      doc={doc} />);

    assert.equal(el.find('.view-attachments-section').length, 0);
  });

  it('view attachments button shows up when the doc has attachments', () => {
    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={false}
      database={database}
      doc={doc} />);

    assert.equal(el.find('.view-attachments-section').length, 1);
  });

  it('view attachments dropdown contains right number of docs', () => {
    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={false}
      database={database}
      doc={doc} />);

    assert.equal(el.find('.view-attachments-section .dropdown-menu li').length, 2);
  });

  it('view attachments dropdown contains correct urls', () => {
    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={false}
      database={database}
      doc={doc} />);

    const $attachmentNode = el.find('.view-attachments-section .dropdown-menu li');
    const attachmentURLactual = $attachmentNode.find('a').first().prop('href');

    assert.equal(attachmentURLactual, './a%2Fspecial%3Fdb/_design%2Ftest%23doc/one%252F.png');
  });

});

describe('DocEditorContainer', () => {
  const middlewares = [thunk];
  const store = createStore(
    combineReducers({ docEditor: docEditorReducer }),
    applyMiddleware(...middlewares)
  );

  it('clicking Delete button shows the confirmation modal', () => {
    const wrapper = mount(
      <Provider store={store}>
        <DocEditorContainer
          isNewDoc={false}
          database={database} />
      </Provider>
    );
    assert.equal(wrapper.find(DocEditorScreen).prop('isDeleteDocModalVisible'), false);
    wrapper.find('button[title="Delete"]').simulate('click');
    assert.equal(wrapper.find(DocEditorScreen).prop('isDeleteDocModalVisible'), true);
  });

  it('clicking Upload button shows the upload dialog', () => {
    const wrapper = mount(
      <Provider store={store}>
        <DocEditorContainer
          isNewDoc={false}
          database={database} />
      </Provider>
    );
    assert.equal(wrapper.find(DocEditorScreen).prop('isUploadModalVisible'), false);
    wrapper.find('button[title="Upload Attachment"]').simulate('click');
    assert.equal(wrapper.find(DocEditorScreen).prop('isUploadModalVisible'), true);
  });

  it('clicking Clone button shows the clone doc dialog', () => {
    const wrapper = mount(
      <Provider store={store}>
        <DocEditorContainer
          isNewDoc={false}
          database={database} />
      </Provider>
    );
    assert.equal(wrapper.find(DocEditorScreen).prop('isCloneDocModalVisible'), false);
    wrapper.find('button[title="Clone Document"]').simulate('click');
    assert.equal(wrapper.find(DocEditorScreen).prop('isCloneDocModalVisible'), true);
  });

});


describe("AttachmentsPanelButton", () => {
  let doc;

  beforeEach(() => {
    doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
  });

  it('does not show up when loading', () => {
    const el = mount(<AttachmentsPanelButton isLoading={true} doc={doc} />);
    assert.equal(el.find('.panel-button').length, 0);
  });

  it('shows up after loading', () => {
    const el = mount(<AttachmentsPanelButton isLoading={false} doc={doc} />);
    assert.equal(el.find('button.panel-button').length, 1);
  });
});


describe("Custom Extension Buttons", () => {
  it('supports buttons', () => {
    class CustomButton extends React.Component {
      render() {
        return (
          <div>
            <button>Oh no she di&apos;n&apos;t!</button>
            <span id="testDatabaseName">{this.props.database.id}</span>
          </div>
        );
      }
    }

    FauxtonAPI.registerExtension('DocEditor:icons', CustomButton);

    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={false}
      database={database} />);
    assert.isTrue(/Oh\sno\sshe\sdi'n't!/.test(el.html()));
    // confirm the database name was also included
    assert.equal(el.find("#testDatabaseName").text(), database.id);
  });
});
