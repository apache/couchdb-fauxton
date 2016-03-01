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
  '../../../../app',
  '../../../../core/api',
  'react',
  'react-dom',
  '../../resources',
  '../components.react',
  '../stores',
  '../actions',
  '../actiontypes',
  '../../../databases/base',
  '../../../../../test/mocha/testUtils',
  'react-bootstrap',
  'react-addons-test-utils',
  'sinon'
], function (app, FauxtonAPI, React, ReactDOM, Documents, Components, Stores, Actions, ActionTypes, Databases, utils,
  ReactBoostrap, TestUtils, sinon) {

  var assert = utils.assert;
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

  var database = new Databases.Model({ id: 'id' });


  describe('DocEditorController', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('loading indicator appears on load', function () {
      var el = TestUtils.renderIntoDocument(<Components.DocEditorController />, container);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.loading-lines').length, 1);
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

      assert.equal($(ReactDOM.findDOMNode(el)).find('.loading-lines').length, 0);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.icon-circle-arrow-up').length, 0);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.icon-repeat').length, 0);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.icon-trash').length, 0);
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
      assert.equal($(ReactDOM.findDOMNode(el)).find('.view-attachments-section').length, 0);
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
      assert.equal($(ReactDOM.findDOMNode(el)).find('.view-attachments-section').length, 1);
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
      assert.equal($(ReactDOM.findDOMNode(el)).find('.view-attachments-section .dropdown-menu li').length, 2);
    });

    //issues with this test running with all other tests. It passes on its own
    it('view attachments dropdown contains correct urls', function () {
      var el = TestUtils.renderIntoDocument(
        <Components.DocEditorController database={database} />, container
      );

      var doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
      FauxtonAPI.dispatch({
        type: ActionTypes.DOC_LOADED,
        options: {
          doc: doc
        }
      });

      var $attachmentNode = $(ReactDOM.findDOMNode(el)).find('.view-attachments-section .dropdown-menu li');
      var attachmentURLactual = $attachmentNode.find('a').attr('href');

      assert.equal(attachmentURLactual, '../../id/_design/test-doc/one.png');
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

      // uber-kludgy, but the delete doc modal is a generic dialog used multiple times, so this test first checks
      // no modal is open, then confirms the open modal contains the delete dialog message
      assert.equal($('body').find('.confirmation-modal').length, 0);

      Actions.showDeleteDocModal();

      var modalContent = $('body').find('.confirmation-modal .modal-body p')[0];
      assert.ok(/Are you sure you want to delete this document\?/.test(modalContent.innerHTML));
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

      assert.equal($('body').find('.upload-file-modal').length, 0);
      Actions.showUploadModal();
      assert.notEqual($('body').find('.upload-file-modal').length, 0);
    });
  });


  describe("AttachmentsPanelButton", function () {
    var container, doc;

    beforeEach(function () {
      doc = new Documents.Doc(docWithAttachmentsJSON, { database: database });
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('does not show up when loading', function () {
      var el = TestUtils.renderIntoDocument(<Components.AttachmentsPanelButton isLoading={true} doc={doc} />, container);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.panel-button').length, 0);
    });

    it('shows up after loading', function () {
      var el = TestUtils.renderIntoDocument(<Components.AttachmentsPanelButton isLoading={false} doc={doc} />, container);
      assert.equal($(ReactDOM.findDOMNode(el)).find('.panel-button').length, 1);
    });
  });


  describe("Custom Extension Buttons", function () {
    it('supports buttons', function () {
      var CustomButton = React.createClass({
        render: function () {
          return (
            <div>
              <button>Oh no she di'n't!</button>
              <span id="testDatabaseName">{this.props.database.id}</span>
            </div>
          );
        }
      });
      FauxtonAPI.registerExtension('DocEditor:icons', CustomButton);

      var container = document.createElement('div');
      var el = TestUtils.renderIntoDocument(<Components.DocEditorController database={database} />, container);
      assert.isTrue(/Oh\sno\sshe\sdi'n't!/.test(ReactDOM.findDOMNode(el).outerHTML));

      // confirm the database name was also included
      assert.equal($(ReactDOM.findDOMNode(el)).find("#testDatabaseName").html(), database.id);

      ReactDOM.unmountComponentAtNode(container);
    });
  });

});
