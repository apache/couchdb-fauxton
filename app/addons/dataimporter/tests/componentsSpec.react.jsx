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
  'api',
  'addons/dataimporter/components.react',
  'addons/dataimporter/stores',
  'addons/dataimporter/actions',
  'testUtils',
  'react'
], function (FauxtonAPI, Components, Stores, Actions, utils, React) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var restore = utils.restore;
  var maxSize = 50000000;

  describe('Data Importer -- Components', function () {
    var spy, startContainer, previewContainer, El, dataImportStore, importer, previewScreen, actions;

    beforeEach(function () {
      startContainer = document.createElement('div');
      previewContainer = document.createElement('div');
      dataImportStore = Stores.dataImporterStore;
      dataImportStore.init(true);
      importer = TestUtils.renderIntoDocument(React.createElement(Components.DataImporterDropZone, {maxSize: maxSize}), startContainer);
    });

    afterEach(function () {
      importer.getInitialState();
      if (spy) restore(spy);
      React.unmountComponentAtNode(startContainer);
      React.unmountComponentAtNode(previewContainer);
    });

    it('should change dropbox state on file drag', function () {
      assert.ok(importer.state.draggingOver === false);
      var dragNDropBox = TestUtils.findRenderedDOMComponentWithClass(importer, 'dropzone');
      TestUtils.Simulate.dragOver(dragNDropBox, {preventDefault: function () {}});
      assert.ok(importer.state.draggingOver === true);
    });

    it('should show uploader info when clicking on Info Link on Start page', function () {
      assert.ok(importer.state.showLimitInfo === false);
      var infoLink = TestUtils.findRenderedDOMComponentWithClass(importer, 'import-data-limit-info-link');
      TestUtils.Simulate.click(infoLink);
      assert.ok(importer.state.showLimitInfo === true);
    });

    it('should show Loading file page', function () {
      var stub = sinon.stub(Actions, 'papaparse');

      var dragNDropBox = TestUtils.findRenderedDOMComponentWithClass(importer, 'dropzone');
      TestUtils.Simulate.drop(dragNDropBox, {
        preventDefault: function () {},
        nativeEvent: {
          dataTransfer: {
            files: [{
              size: maxSize - 1
            }]
          }
        }
      });

      Actions.papaparse();
      assert.ok(importer.state.loading === true);
      restore(stub);
    });

    it('should prevent uploading files that are too big', function () {
      var stub = sinon.stub(Actions, 'papaparse');
      var dragNDropBox = TestUtils.findRenderedDOMComponentWithClass(importer, 'dropzone');
      TestUtils.Simulate.drop(dragNDropBox, {
        preventDefault: function () {},
        nativeEvent: {
          dataTransfer: {
            files: [{
              size: maxSize + 1
            }]
          }
        }
      });
      Actions.papaparse();
      assert.ok(importer.state.fileTooBig === true);
      restore(stub);
    });

    it('should show a limited preview if the file is larger than 200000 ', function () {
      var stub = sinon.stub(Actions, 'papaparse');

      var dragNDropBox = TestUtils.findRenderedDOMComponentWithClass(importer, 'dropzone');
      TestUtils.Simulate.drop(dragNDropBox, {
        preventDefault: function () {},
        nativeEvent: {
          dataTransfer: {
            files: [{
              size: 200000 + 1
            }]
          }
        }
      });
      Actions.papaparse();
      assert.ok(dataImportStore.isThisABigFile() === true);
      restore(stub);
    });

  });

});
