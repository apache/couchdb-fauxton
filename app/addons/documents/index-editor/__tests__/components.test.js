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

import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import FauxtonAPI from '../../../../core/api';
import Views from '../components';
import '../../base';

FauxtonAPI.router = new FauxtonAPI.Router([]);

describe('ReduceEditor', () => {
  describe('getReduceValue', () => {
    const defaultProps = {
      reduceOptions: [],
      hasReduce: false,
      hasCustomReduce: false,
      reduce: null,
      reduceSelectedOption: 'NONE',
      updateReduceCode: () => {},
      selectReduceChanged: () => {}
    };

    it('returns null for none', () => {
      const reduceEl = mount(<Views.ReduceEditor
        {...defaultProps}
      />);
      expect(reduceEl.instance().getReduceValue()).toBeNull();
    });

    it('returns built in for built in reduce', () => {
      const reduceEl = mount(<Views.ReduceEditor
        {...defaultProps}
        reduce='_sum'
        hasReduce={true}
      />);
      expect(reduceEl.instance().getReduceValue()).toBe('_sum');
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
    sinon.assert.calledOnce(spy);
  });

  it('shows new design doc field when set to new-doc', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);

    expect(selectorEl.find('#new-ddoc-section').length).toBe(1);
  });

  it('hides new design doc field when design doc selected', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'_design/test-doc'}
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);

    expect(selectorEl.find('#new-ddoc-section').length).toBe(0);
  });

  it('always passes validation when design doc selected', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'_design/test-doc'}
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);

    expect(selectorEl.instance().validate()).toBe(true);
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
    expect(selectorEl.instance().validate()).toBe(false);
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
    expect(selectorEl.instance().validate()).toBe(true);
  });


  it('omits doc URL when not supplied', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        designDocList={['_design/test-doc']}
        selectedDesignDocName={'new-doc'}
        onSelectDesignDoc={() => { }}
        onChangeNewDesignDocName={() => {}}
      />);
    expect(selectorEl.find('.help-link').length).toBe(0);
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
    expect(selectorEl.find('.help-link').length).toBe(1);
    expect(selectorEl.find('.help-link').prop('href')).toBe(docLink);
  });
});

describe('IndexEditor', () => {
  const defaultProps = {
    isLoading: false,
    isNewView: false,
    isNewDesignDoc: false,
    viewName: '',
    database: {},
    originalViewName: '',
    originalDesignDocName: '',
    designDoc: {},
    designDocId: '',
    designDocList: [],
    map: '',
    reduce: '',
    designDocs: {},
    updateNewDesignDocName: () => {},
    updateMapCode: () => {},
    selectDesignDoc: () => {},
    onChangeNewDesignDocName: () => {},
    reduceOptions: [],
    reduceSelectedOption: 'NONE',
    hasReduce: false,
    hasCustomReduce: false,
    updateReduceCode: () => {},
    selectReduceChanged: () => {}
  };

  it('calls changeViewName on view name change', () => {
    const spy = sinon.spy();
    const editorEl = mount(<Views.IndexEditor
      {...defaultProps}
      viewName='new-name'
      changeViewName={spy}
    />);

    editorEl.find('#index-name').simulate('change', {
      target: {
        value: 'newViewName'
      }
    });
    sinon.assert.calledWith(spy, 'newViewName');
  });
});
