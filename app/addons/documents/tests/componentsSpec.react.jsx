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
  'addons/documents/components.react',
  'addons/documents/stores',
  'addons/documents/actions',
  'addons/documents/resources',
  'testUtils',
  "react"
], function (FauxtonAPI, Views, Stores, Actions, Documents, utils, React) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var expect = utils.chai.expect;
  var TestUtils = React.addons.TestUtils;

  var resetStore = function (designDoc) {
    var designDocs = new Documents.AllDocs([designDoc], {
      params: { limit: 10 },
      database: {
        safeID: function () { return 'id';}
      }
    });

    Actions.editIndex({
      newView: false,
      viewName: 'test-view',
      designDocs: designDocs,
      designDocId: designDoc._id
    });
  };

  describe('View editor', function () {

    describe('Toggle button', function () {
      var container, toggleEl;

      beforeEach(function () {
        container = document.createElement('div');
        toggleEl = TestUtils.renderIntoDocument(<Views.ToggleButton />, container);
      });

      afterEach(function () {
        React.unmountComponentAtNode(container);
      });


      it('should toggle editor on click', function () {
        var spy = sinon.spy(Actions, 'toggleEditor');
        //TestUtils.Simulate.click(toggleEl.refs.toggle.getDOMNode());
        TestUtils.Simulate.click($(toggleEl.getDOMNode()).find('a')[0]);
        expect(spy.calledOnce).to.be.true;
      });

    });

  });

  describe('reduce editor', function () {
    var container, reduceEl;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    describe('getReduceValue', function () {
      var container;

      beforeEach(function () {
        container = document.createElement('div');
        $('body').append('<div id="reduce-function"></div>');
      });

      it('returns null for none', function () {
        var store = Stores.indexEditorStore;

        var designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: 'function () {};',
              //reduce: 'function (reduce) { reduce(); }'
            }
          }
        };

        resetStore(designDoc);

        reduceEl = TestUtils.renderIntoDocument(<Views.ReduceEditor/>, container);
        expect(reduceEl.getReduceValue()).to.be.null;
      });

      it('returns built in for built in reduce', function () {
        var store = Stores.indexEditorStore;

        var designDoc = {
          _id: '_design/test-doc',
          views: {
            'test-view': {
              map: 'function () {};',
              reduce: '_sum'
            }
          }
        };

        resetStore(designDoc);

        reduceEl = TestUtils.renderIntoDocument(<Views.ReduceEditor/>, container);
        expect(reduceEl.getReduceValue()).to.equal('_sum');
      });

    });
  });

  describe('design Doc Selector', function () {
    var container, selectorEl;

    beforeEach(function () {
      container = document.createElement('div');
      $('body').append('<div id="map-function"></div>');
      $('body').append('<div id="editor"></div>');
      selectorEl = TestUtils.renderIntoDocument(<Views.DesignDocSelector/>, container);
    });


    afterEach(function () {
      Actions.newDesignDoc.restore && Actions.newDesignDoc.restore();
      Actions.designDocChange.restore && Actions.designDocChange.restore();
      React.unmountComponentAtNode(container);
    });

    it('calls new design doc on new selected', function () {
      var spy = sinon.spy(Actions, 'newDesignDoc');
      TestUtils.Simulate.change($(selectorEl.getDOMNode()).find('#ddoc')[0], {
        target: {
          value: 'new'
        }
      });

      expect(spy.calledOnce).to.be.true;
    });

    it('calls design doc changed on a different design doc selected', function () {
      var spy = sinon.spy(Actions, 'designDocChange');
      TestUtils.Simulate.change($(selectorEl.getDOMNode()).find('#ddoc')[0], {
        target: {
          value: 'another-doc'
        }
      });

      expect(spy.calledWith('another-doc', false)).to.be.true;
    });

    it('calls design doc changed on new design doc entered', function () {
      var spy = sinon.spy(Actions, 'designDocChange');
      Actions.newDesignDoc();
      TestUtils.Simulate.change($(selectorEl.getDOMNode()).find('#new-ddoc')[0], {
        target: {
          value: 'new-doc-entered'
        }
      });
      
      expect(spy.calledWith('_design/new-doc-entered', true)).to.be.true;
    });

  });

  describe('Editor', function () {
    var container, editorEl;

    beforeEach(function () {
      container = document.createElement('div');
      $('body').append('<div id="map-function"></div>');
      $('body').append('<div id="editor"></div>');
      editorEl = TestUtils.renderIntoDocument(<Views.Editor/>, container);
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('returns false on invalid map editor code', function () {
      var stub = sinon.stub(editorEl.refs.mapEditor.mapEditor, 'hadValidCode');
      stub.returns(false);
      expect(editorEl.hasValidCode()).to.be.false;
    });

    it('returns true on valid map editor code', function () {
      var stub = sinon.stub(editorEl.refs.mapEditor.mapEditor, 'hadValidCode');
      stub.returns(true);
      expect(editorEl.hasValidCode()).to.be.true;
    });

    it('returns true on non-custom reduce', function () {
      var stub = sinon.stub(Stores.indexEditorStore, 'hasCustomReduce');
      stub.returns(false);
      expect(editorEl.hasValidCode()).to.be.true;
    });

  });
});
