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

define([
  'app',
  'api',
  'react',
  'addons/documents/resources',
  'addons/documents/doc-editor/components.react',
  'addons/documents/doc-editor/stores',
  'addons/documents/doc-editor/actions',
  'addons/documents/doc-editor/actiontypes',
  'testUtils'
], function (app, FauxtonAPI, React, Documents, Components, Stores, Actions, ActionTypes, utils) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var docJSON = {
    _id: '_design/test-doc',
    views: {
      'test-view': {
        map: 'function () {};'
      }
    }
  };

  var docWithAttachmentsJSON = {
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

  var database = {
    safeID: function () { return 'id'; }
  };


  describe('DocEditorController', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('loading indicator appears on load', function () {
      var el = TestUtils.renderIntoDocument(<Components.DocEditorController />, container);
      assert.equal($(el.getDOMNode()).find('.loading-lines').length, 1);
    });

    it('new docs do not show the button row', function () {
      var el = TestUtils.renderIntoDocument(<Components.DocEditorController isNewDoc={true} database={database} />, container);

      var doc = new Documents.Doc(docJSON, { database: database });
      FauxtonAPI.dispatch({
        type: ActionTypes.DOC_LOADED,
        options: {
          doc: doc
        }
      });

      assert.equal($(el.getDOMNode()).find('.loading-lines').length, 0);
      assert.equal($(el.getDOMNode()).find('.icon-circle-arrow-up').length, 0);
      assert.equal($(el.getDOMNode()).find('.icon-repeat').length, 0);
      assert.equal($(el.getDOMNode()).find('.icon-trash').length, 0);
    });

    it('view attachments button does not appear with no attachments', function () {
      var el = TestUtils.renderIntoDocument(<Components.DocEditorController database={database} />, container);

      var doc = new Documents.Doc(docJSON, { database: database });
      FauxtonAPI.dispatch({
        type: ActionTypes.DOC_LOADED,
        options: {
          doc: doc
        }
      });
      assert.equal($(el.getDOMNode()).find('.view-attachments-section').length, 0);
    });

    it('view attachments button shows up when the doc has attachments', function () {
      var el = TestUtils.renderIntoDocument(<Components.DocEditorController database={database} />, container);

      var doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
      FauxtonAPI.dispatch({
        type: ActionTypes.DOC_LOADED,
        options: {
          doc: doc
        }
      });
      assert.equal($(el.getDOMNode()).find('.view-attachments-section').length, 1);
    });

    it('view attachments dropdown contains right number of docs', function () {
      var el = TestUtils.renderIntoDocument(<Components.DocEditorController database={database} />, container);

      var doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
      FauxtonAPI.dispatch({
        type: ActionTypes.DOC_LOADED,
        options: {
          doc: doc
        }
      });
      assert.equal($(el.getDOMNode()).find('.view-attachments-section .dropdown-menu li').length, 2);
    });

    it('setting deleteDocModal=true in store shows modal', function () {
      var el = TestUtils.renderIntoDocument(<Components.DocEditorController database={database} />, container);
      var doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
      FauxtonAPI.dispatch({
        type: ActionTypes.DOC_LOADED,
        options: {
          doc: doc
        }
      });
      assert.ok($(el.getDOMNode()).find('.confirmation-modal')[0].getAttribute('data-js-visible') == 'false');
      Actions.showDeleteDocModal();
      assert.ok($(el.getDOMNode()).find('.confirmation-modal')[0].getAttribute('data-js-visible') == 'true');
    });

    it('setting uploadDocModal=true in store shows modal', function () {
      var el = TestUtils.renderIntoDocument(<Components.DocEditorController database={database} />, container);
      var doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
      FauxtonAPI.dispatch({
        type: ActionTypes.DOC_LOADED,
        options: {
          doc: doc
        }
      });
      assert.ok($(el.getDOMNode()).find('.upload-file-modal')[0].getAttribute('data-js-visible') == 'false');
      Actions.showUploadModal();
      assert.ok($(el.getDOMNode()).find('.upload-file-modal')[0].getAttribute('data-js-visible') == 'true');
    });

  });

  describe("AttachmentsPanelButton", function () {
    var container, doc;

    beforeEach(function () {
      doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('does not show up when loading', function () {
      var el = TestUtils.renderIntoDocument(<Components.AttachmentsPanelButton isLoading={true} doc={doc} />, container);
      assert.equal($(el.getDOMNode()).find('.panel-button').length, 0);
    });

    it('shows up after loading', function () {
      var el = TestUtils.renderIntoDocument(<Components.AttachmentsPanelButton isLoading={false} doc={doc} />, container);
      assert.equal($(el.getDOMNode()).find('.panel-button').length, 1);
    });
  });

});
