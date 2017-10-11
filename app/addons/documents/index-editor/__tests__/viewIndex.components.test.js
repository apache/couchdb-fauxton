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
import {mount} from 'enzyme';
import sinon from "sinon";
import '../../base';
FauxtonAPI.router = new FauxtonAPI.Router([]);

const { assert } = utils;


const resetStore = (designDocs) => {
  Actions.editIndex({
    database: { id: 'rockos-db' },
    newView: false,
    viewName: 'test-view',
    designDocs: getDesignDocsCollection(designDocs),
    designDocId: designDocs[0]._id
  });
};

const getDesignDocsCollection = (designDocs) => {
  designDocs = designDocs.map(function (doc) {
    return Resources.Doc.prototype.parse(doc);
  });

  return new Resources.AllDocs(designDocs, {
    params: { limit: 10 },
    database: {
      safeID: () => { return 'id'; }
    }
  });
};


describe('reduce editor', () => {
  let reduceEl;

  describe('getReduceValue', () => {

    it('returns null for none', () => {
      const designDoc = {
        _id: '_design/test-doc',
        views: {
          'test-view': {
            map: '() => {};'
          }
        }
      };

      resetStore([designDoc]);

      reduceEl = mount(<Views.ReduceEditor/>);
      assert.ok(_.isNull(reduceEl.instance().getReduceValue()));
    });

    it('returns built in for built in reduce', () => {
      const designDoc = {
        _id: '_design/test-doc',
        views: {
          'test-view': {
            map: '() => {};',
            reduce: '_sum'
          }
        }
      };

      resetStore([designDoc]);

      reduceEl = mount(<Views.ReduceEditor/>);
      assert.equal(reduceEl.instance().getReduceValue(), '_sum');
    });

  });
});

describe('DesignDocSelector component', () => {
  let selectorEl;

  it('calls onSelectDesignDoc on change', () => {
    const spy = sinon.spy();
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc', '_design/test-doc2']}
        selectedDDocName={'new-doc'}
        onSelectDesignDoc={spy}
        onChangeNewDesignDocName={() => {}}
      />);

    selectorEl.find('.styled-select select').first().simulate('change', {
      target: {
        value: '_design/test-doc'
      }
    });
    assert.ok(spy.calledOnce);
  });

  it('shows new design doc field when set to new-doc', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);

    assert.equal(selectorEl.find('#new-ddoc-section').length, 1);
  });

  it('hides new design doc field when design doc selected', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'_design/test-doc'}
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);

    assert.equal(selectorEl.find('#new-ddoc-section').length, 0);
  });

  it('always passes validation when design doc selected', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'_design/test-doc'}
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);

    assert.equal(selectorEl.instance().validate(), true);
  });

  it('fails validation if new doc name entered/not entered', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        newDesignDocName=''
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);

    // it shouldn't validate at this point: no new design doc name has been entered
    assert.equal(selectorEl.instance().validate(), false);
  });

  it('passes validation if new doc name entered/not entered', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        newDesignDocName='new-doc-name'
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);
    assert.equal(selectorEl.instance().validate(), true);
  });


  it('omits doc URL when not supplied', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);
    assert.equal(selectorEl.find('.help-link').length, 0);
  });

  it('includes help doc link when supplied', () => {
    const docLink = 'http://docs.com';
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        onSelectDesignDoc={() => { }}
        docLink={docLink}
        onChangeNewDesignDocName={() => {}}
      />);
    assert.equal(selectorEl.find('.help-link').length, 1);
    assert.equal(selectorEl.find('.help-link').prop('href'), docLink);
  });
});


describe('Editor', () => {
  let editorEl;

  beforeEach(() => {
    editorEl = mount(<Views.EditorController />);
  });

  it('calls changeViewName on view name change', () => {
    const viewName = 'new-name';
    const spy = sinon.spy(Actions, 'changeViewName');
    editorEl.find('#index-name').simulate('change', {
      target: {
        value: viewName
      }
    });
    assert.ok(spy.calledWith(viewName));
  });
});
