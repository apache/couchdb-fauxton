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
import Views from "../components";
import Actions from "../actions";
import utils from "../../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";
import sinon from "sinon";
FauxtonAPI.router = new FauxtonAPI.Router([]);

const { assert } = utils;


const resetStore = function (designDocs) {
  Actions.editIndex({
    database: { id: 'rockos-db' },
    newView: false,
    viewName: 'test-view',
    designDocs: getDesignDocsCollection(designDocs),
    designDocId: designDocs[0]._id
  });
};

const getDesignDocsCollection = function (designDocs) {
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
  let container, reduceEl;

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });

  describe('getReduceValue', function () {
    let container;

    beforeEach(function () {
      container = document.createElement('div');
      $('body').append('<div id="reduce-function"></div>');
    });

    it('returns null for none', function () {
      const designDoc = {
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
      const designDoc = {
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
  let container, selectorEl;

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });


  it('calls onSelectDesignDoc on change', function () {
    const spy = sinon.spy();
    selectorEl = TestUtils.renderIntoDocument(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc', '_design/test-doc2']}
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
    const docLink = 'http://docs.com';
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
  let container, editorEl, sandbox;

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
    const viewName = 'new-name';
    const spy = sandbox.spy(Actions, 'changeViewName');
    const el = $(ReactDOM.findDOMNode(editorEl)).find('#index-name')[0];
    TestUtils.Simulate.change(el, {
      target: {
        value: viewName
      }
    });
    assert.ok(spy.calledWith(viewName));
  });
});
