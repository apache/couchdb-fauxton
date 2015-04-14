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
  'addons/documents/index-editor/components.react',
  'addons/documents/index-editor/stores',
  'addons/documents/index-editor/actions',
  'addons/documents/resources',
  'testUtils',
  "react"
], function (FauxtonAPI, Views, Stores, Actions, Documents, utils, React) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var restore = utils.restore;

  var resetStore = function (designDocs) {
    designDocs = designDocs.map(function (doc) {
      return Documents.Doc.prototype.parse(doc);
    });

    var ddocs = new Documents.AllDocs(designDocs, {
      params: { limit: 10 },
      database: {
        safeID: function () { return 'id';}
      }
    });

    Actions.editIndex({
      database: {id: 'rockos-db'},
      newView: false,
      viewName: 'test-view',
      designDocs: ddocs,
      designDocId: designDocs[0]._id
    });
  };

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

        resetStore([designDoc]);

        reduceEl = TestUtils.renderIntoDocument(<Views.ReduceEditor/>, container);
        assert.ok(_.isNull(reduceEl.getReduceValue()));
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

        resetStore([designDoc]);

        reduceEl = TestUtils.renderIntoDocument(<Views.ReduceEditor/>, container);
        assert.equal(reduceEl.getReduceValue(), '_sum');
      });

    });
  });

  describe('design Doc Selector', function () {
    var container, selectorEl;

    beforeEach(function () {
      container = document.createElement('div');
      $('body').append('<div id="map-function"></div>');
      $('body').append('<div id="editor"></div>');
      var designDoc = {
        "id": "_design/test-doc",
        "key": "_design/test-doc",
        "value": {
          "rev": "20-9e4bc8b76fd7d752d620bbe6e0ea9a80"
        },
        "doc": {
          "_id": "_design/test-doc",
          "_rev": "20-9e4bc8b76fd7d752d620bbe6e0ea9a80",
          "views": {
            "test-view": {
              "map": "function(doc) {\n  emit(doc._id, 2);\n}"
            },
            "new-view": {
              "map": "function(doc) {\n  if (doc.class === \"mammal\" && doc.diet === \"herbivore\")\n    emit(doc._id, 1);\n}",
              "reduce": "_sum"
            }
          },
          "language": "javascript",
          "indexes": {
            "newSearch": {
              "analyzer": "standard",
              "index": "function(doc){\n index(\"default\", doc._id);\n}"
            }
          }
        }
      };
      var mangodoc = {
        "id": "_design/123mango",
        "key": "_design/123mango",
        "value": {
          "rev": "20-9e4bc8b76fd7d752d620bbe6e0ea9a80"
        },
        "doc": {
          "_id": "_design/123mango",
          "_rev": "20-9e4bc8b76fd7d752d620bbe6e0ea9a80",
          "views": {
            "test-view": {
              "map": "function(doc) {\n  emit(doc._id, 2);\n}"
            },
            "new-view": {
              "map": "function(doc) {\n  if (doc.class === \"mammal\" && doc.diet === \"herbivore\")\n    emit(doc._id, 1);\n}",
              "reduce": "_sum"
            }
          },
          "language": "query",
          "indexes": {
            "newSearch": {
              "analyzer": "standard",
              "index": "function(doc){\n index(\"default\", doc._id);\n}"
            }
          }
        }
      };
      resetStore([designDoc, mangodoc]);
      selectorEl = TestUtils.renderIntoDocument(<Views.DesignDocSelector/>, container);
    });


    afterEach(function () {
      restore(Actions.newDesignDoc);
      restore(Actions.designDocChange);
      React.unmountComponentAtNode(container);
    });

    /*it('calls new design doc on new selected', function () {
      var spy = sinon.spy(Actions, 'newDesignDoc');
      TestUtils.Simulate.change($(selectorEl.getDOMNode()).find('#ddoc')[0], {
        target: {
          value: 'new'
        }
      });

      assert.ok(spy.calledOnce);
    });

    it('calls design doc changed on a different design doc selected', function () {
      var spy = sinon.spy(Actions, 'designDocChange');
      TestUtils.Simulate.change($(selectorEl.getDOMNode()).find('#ddoc')[0], {
        target: {
          value: 'another-doc'
        }
      });

      assert.ok(spy.calledWith('another-doc', false));
    });

    it('calls design doc changed on new design doc entered', function () {
      var spy = sinon.spy(Actions, 'designDocChange');
      Actions.newDesignDoc();
      TestUtils.Simulate.change($(selectorEl.getDOMNode()).find('#new-ddoc')[0], {
        target: {
          value: 'new-doc-entered'
        }
      });

      assert.ok(spy.calledWith('_design/new-doc-entered', true));
    });

    it('does not filter usual design docs', function () {
      assert.ok(/_design\/test-doc/.test($(selectorEl.getDOMNode()).text()));
    });*/

    it('filters mango docs', function () {
      selectorEl = TestUtils.renderIntoDocument(<Views.DesignDocSelector/>, container);
      assert.notOk(/_design\/123mango/.test($(selectorEl.getDOMNode()).text()));
    });
  });

/*  describe('Editor', function () {
    var container, editorEl, reduceStub;

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
      var stub = sinon.stub(editorEl.refs.mapEditor.aceEditor, 'hadValidCode');
      stub.returns(false);
      assert.notOk(editorEl.hasValidCode());
    });

    it('returns true on valid map editor code', function () {
      var stub = sinon.stub(editorEl.refs.mapEditor.aceEditor, 'hadValidCode');
      stub.returns(true);
      assert.ok(editorEl.hasValidCode());
    });

    it('returns true on non-custom reduce', function () {
      var stub = sinon.stub(Stores.indexEditorStore, 'hasCustomReduce');
      stub.returns(false);
      assert.ok(editorEl.hasValidCode());
    });

    it('calls changeViewName on view name change', function () {
      var viewName = 'new-name';
      var spy = sinon.spy(Actions, 'changeViewName');
      var el = $(editorEl.getDOMNode()).find('#index-name')[0];
      TestUtils.Simulate.change(el, {
        target: {
          value: viewName
        }
      });
      assert.ok(spy.calledWith(viewName));
    });
  });*/
});
