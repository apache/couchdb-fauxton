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
import Resources from "../../resources";
import Views from "../components.react";
import Actions from "../actions";
import utils from "../../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";
import sinon from "sinon";
FauxtonAPI.router = new FauxtonAPI.Router([]);

var assert = utils.assert;


var resetStore = function (designDocs) {
  Actions.editIndex({
    database: { id: 'rockos-db' },
    newView: false,
    viewName: 'test-view',
    designDocs: getDesignDocsCollection(designDocs),
    designDocId: designDocs[0]._id
  });
};

var getDesignDocsCollection = function (designDocs) {
  designDocs = designDocs.map(function (doc) {
    return Resources.Doc.prototype.parse(doc);
  });

  return new Resources.AllDocs(designDocs, {
    params: { limit: 10 },
    database: {
      safeID: function () { return 'id'; }
    }
  });
};


describe('reduce editor', function () {
  var container, reduceEl;

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });

  describe('getReduceValue', function () {
    var container;

    beforeEach(function () {
      container = document.createElement('div');
      $('body').append('<div id="reduce-function"></div>');
    });

    it('returns null for none', function () {
      var designDoc = {
        _id: '_design/test-doc',
        views: {
          'test-view': {
            map: 'function () {};'
          }
        }
      };

      resetStore([designDoc]);

      reduceEl = TestUtils.renderIntoDocument(<Views.ReduceEditor/>, container);
      assert.ok(_.isNull(reduceEl.getReduceValue()));
    });

    it('returns built in for built in reduce', function () {
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

describe('DesignDocSelector component', function () {
  var container, selectorEl;
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

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });


  it('calls onSelectDesignDoc on change', function () {
    var spy = sinon.spy();
    selectorEl = TestUtils.renderIntoDocument(
      <Views.DesignDocSelector
        designDocList={getDesignDocsCollection([designDoc])}
        selectedDDocName={'new-doc'}
        onSelectDesignDoc={spy}
      />, container);

    TestUtils.Simulate.change($(ReactDOM.findDOMNode(selectorEl)).find('.styled-select select')[0], {
      target: {
        value: '_design/test-doc'
      }
    });
    assert.ok(spy.calledOnce);
  });

  it('shows new design doc field when set to new-doc', function () {
    selectorEl = TestUtils.renderIntoDocument(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        onSelectDesignDoc={function () { }}
      />, container);

    assert.equal($(ReactDOM.findDOMNode(selectorEl)).find('#new-ddoc-section').length, 1);
  });

  it('hides new design doc field when design doc selected', function () {
    selectorEl = TestUtils.renderIntoDocument(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'_design/test-doc'}
        onSelectDesignDoc={function () { }}
      />, container);

    assert.equal($(ReactDOM.findDOMNode(selectorEl)).find('#new-ddoc-section').length, 0);
  });

  it('always passes validation when design doc selected', function () {
    selectorEl = TestUtils.renderIntoDocument(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'_design/test-doc'}
        onSelectDesignDoc={function () { }}
      />, container);

    assert.equal(selectorEl.validate(), true);
  });

  it('fails validation if new doc name entered/not entered', function () {
    selectorEl = TestUtils.renderIntoDocument(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        newDesignDocName=''
        onSelectDesignDoc={function () { }}
      />, container);

    // it shouldn't validate at this point: no new design doc name has been entered
    assert.equal(selectorEl.validate(), false);
  });

  it('passes validation if new doc name entered/not entered', function () {
    selectorEl = TestUtils.renderIntoDocument(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        newDesignDocName='new-doc-name'
        onSelectDesignDoc={function () { }}
      />, container);
    assert.equal(selectorEl.validate(), true);
  });


  it('omits doc URL when not supplied', function () {
    selectorEl = TestUtils.renderIntoDocument(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        onSelectDesignDoc={function () { }}
      />, container);
    assert.equal($(ReactDOM.findDOMNode(selectorEl)).find('.help-link').length, 0);
  });

  it('includes help doc link when supplied', function () {
    var docLink = 'http://docs.com';
    selectorEl = TestUtils.renderIntoDocument(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        onSelectDesignDoc={function () { }}
        docLink={docLink}
      />, container);
    assert.equal($(ReactDOM.findDOMNode(selectorEl)).find('.help-link').length, 1);
    assert.equal($(ReactDOM.findDOMNode(selectorEl)).find('.help-link').attr('href'), docLink);
  });
});


describe('Editor', function () {
  var container, editorEl, sandbox;

  beforeEach(function () {
    container = document.createElement('div');
    $('body').append('<div id="map-function"></div>');
    $('body').append('<div id="editor"></div>');
    editorEl = TestUtils.renderIntoDocument(<Views.EditorController />, container);
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
    sandbox.restore();
  });

  it('calls changeViewName on view name change', function () {
    var viewName = 'new-name';
    var spy = sandbox.spy(Actions, 'changeViewName');
    var el = $(ReactDOM.findDOMNode(editorEl)).find('#index-name')[0];
    TestUtils.Simulate.change(el, {
      target: {
        value: viewName
      }
    });
    assert.ok(spy.calledWith(viewName));
  });
});
