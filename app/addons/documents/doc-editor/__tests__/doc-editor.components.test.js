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
import Helpers from '../../../../helpers';
import React from 'react';
import sinon from 'sinon';
import Documents from '../../resources';
import AttachmentsPanelButton from '../components/AttachmentsPanelButton';
import CloneDocModal from '../components/CloneDocModal';
import DocEditorScreen from '../components/DocEditorScreen';
import DocEditorContainer from '../components/DocEditorContainer';
import Databases from '../../../databases/base';
import databasesReducer from '../../../databases/reducers';
import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import actiontypes from '../actiontypes';
import docEditorReducer from '../reducers';

import '../../base';

FauxtonAPI.router = new FauxtonAPI.Router([]);
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
  isDbPartitioned: false,
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
    expect(el.find('.loading-lines').length).toBe(1);
  });

  it('new docs do not show the button row', () => {
    const doc = new Documents.Doc(docJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={true}
      database={database}
      doc={doc} />);

    expect(el.find('.loading-lines').length).toBe(0);
    expect(el.find('.icon-circle-arrow-up').length).toBe(0);
    expect(el.find('.icon-repeat').length).toBe(0);
    expect(el.find('.icon-trash').length).toBe(0);
  });

  it('view attachments button does not appear with no attachments', () => {
    const doc = new Documents.Doc(docJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={false}
      database={database}
      doc={doc} />);

    expect(el.find('.view-attachments-section').length).toBe(0);
  });

  it('view attachments button shows up when the doc has attachments', () => {
    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={false}
      database={database}
      doc={doc} />);

    expect(el.find('.view-attachments-section').length).toBe(1);
  });

  it('view attachments dropdown contains right number of docs', () => {
    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={false}
      database={database}
      doc={doc} />);

    expect(el.find('.view-attachments-section .dropdown-menu li').length).toBe(2);
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

    expect(attachmentURLactual).toBe('./a%2Fspecial%3Fdb/_design%2Ftest%23doc/one%252F.png');
  });

  it('auto-generated ID for new docs starts with colon for partitioned databases', () => {
    const doc = { database: database, attributes: { _id: 'new_doc_id'} };
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={true}
      isDbPartitioned={true}
      database={database}
      doc={doc} />);

    const editor = el.find('CodeEditor');
    expect(editor.prop('defaultCode')).toMatch(/":new_doc_id"/);
  });

  it('cancel button navigates to all docs by default', () => {
    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={true}
      isDbPartitioned={true}
      database={database}
      doc={doc} />);

    const linkUrl = el.find('a.cancel-button').prop('href');
    expect(linkUrl).toBe('#/database/' + encodeURIComponent(database.id) + '/_all_docs');
  });

  it('cancel button navigates to previousUrl', () => {
    const doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
    const el = mount(<DocEditorScreen
      {...defaultProps}
      isLoading={false}
      isNewDoc={true}
      isDbPartitioned={true}
      database={database}
      previousUrl='something/else'
      doc={doc} />);

    const linkUrl = el.find('a.cancel-button').prop('href');
    expect(linkUrl).toBe('#/something/else');
  });

});

describe('DocEditorContainer', () => {
  const middlewares = [thunk];
  const store = createStore(
    combineReducers({ docEditor: docEditorReducer, databases: databasesReducer }),
    applyMiddleware(...middlewares)
  );
  const loadDummyDocAction = {
    type: actiontypes.DOC_LOADED,
    options: {
      doc: {
        get: () => {},
        unset: () => {},
        hasChanged: () => false,
      }
    }
  };

  afterEach(() => {
    store.dispatch({
      type: actiontypes.RESET_DOC
    });
  });

  it('clicking Delete button shows the confirmation modal', () => {
    store.dispatch(loadDummyDocAction);
    const wrapper = mount(
      <Provider store={store}>
        <DocEditorContainer
          isNewDoc={false}
          database={database} />
      </Provider>
    );
    expect(wrapper.find(DocEditorScreen).prop('isDeleteDocModalVisible')).toBe(false);
    wrapper.find('button[title="Delete"]').simulate('click');
    expect(wrapper.find(DocEditorScreen).prop('isDeleteDocModalVisible')).toBe(true);
  });

  it('clicking Upload button shows the upload dialog', () => {
    store.dispatch(loadDummyDocAction);
    const wrapper = mount(
      <Provider store={store}>
        <DocEditorContainer
          isNewDoc={false}
          database={database} />
      </Provider>
    );
    expect(wrapper.find(DocEditorScreen).prop('isUploadModalVisible')).toBe(false);
    wrapper.find('button[title="Upload Attachment"]').simulate('click');
    expect(wrapper.find(DocEditorScreen).prop('isUploadModalVisible')).toBe(true);
  });

  it('clicking Clone button shows the clone doc dialog', () => {
    store.dispatch(loadDummyDocAction);
    const wrapper = mount(
      <Provider store={store}>
        <DocEditorContainer
          isNewDoc={false}
          database={database} />
      </Provider>
    );
    expect(wrapper.find(DocEditorScreen).prop('isCloneDocModalVisible')).toBe(false);
    wrapper.find('button[title="Clone Document"]').simulate('click');
    expect(wrapper.find(DocEditorScreen).prop('isCloneDocModalVisible')).toBe(true);
  });

});


describe("AttachmentsPanelButton", () => {
  let doc;

  beforeEach(() => {
    doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
  });

  it('does not show up when loading', () => {
    const el = mount(<AttachmentsPanelButton isLoading={true} doc={doc} />);
    expect(el.find('.panel-button').length).toBe(0);
  });

  it('shows up after loading', () => {
    const el = mount(<AttachmentsPanelButton isLoading={false} doc={doc} />);
    expect(el.find('button.panel-button').length).toBe(1);
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
    expect(/Oh\sno\sshe\sdi'n't!/.test(el.html())).toBe(true);
    // confirm the database name was also included
    expect(el.find("#testDatabaseName").text()).toBe(database.id);
  });
});

describe("CloneDocModal", () => {
  const defaultProps = {
    visible: false,
    doc: { attributes: {_id: 'my_doc_id', hey: 'there'} },
    database: {},
    onSubmit: () => {},
    hideCloneDocModal: () => {},
    cloneDoc: () => {}
  };

  let getUUID;

  afterEach(() => {
    if (getUUID) {
      getUUID.restore();
    }
  });

  it('sets random UUID by default', () => {
    const promise = FauxtonAPI.Promise.resolve({ uuids: ['abc9876'] });
    getUUID = sinon.stub(Helpers, 'getUUID').returns(promise);
    const el = mount(
      <CloneDocModal {...defaultProps} />
    );
    el.setProps({visible: true});
    return promise.then(() => {
      expect(el.state().uuid).toBe('abc9876');
    });
  });

  it('adds partition key from original doc to the auto-generated ID when it exists', () => {
    const promise = FauxtonAPI.Promise.resolve({ uuids: ['abc9876'] });
    getUUID = sinon.stub(Helpers, 'getUUID').returns(promise);
    const el = mount(
      <CloneDocModal
        {...defaultProps}
        doc={{ attributes: {_id: 'part1:my_doc_id', hey: 'there'} }}/>
    );
    el.setProps({visible: true});
    return promise.then(() => {
      expect(el.state().uuid).toBe('part1:abc9876');
    });
  });


});

