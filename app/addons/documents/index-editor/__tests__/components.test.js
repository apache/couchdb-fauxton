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
import {mount, shallow} from 'enzyme';
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
      customReducerSupported: true,
      updateReduceCode: () => {},
      selectReduceChanged: () => {}
    };

    it('returns null for none', () => {
      const reduceEl = shallow(<Views.ReduceEditor
        {...defaultProps}
      />);
      expect(reduceEl.instance().getReduceValue()).toBeNull();
    });

    it('returns built in for built in reduce', () => {
      const reduceEl = shallow(<Views.ReduceEditor
        {...defaultProps}
        reduce='_sum'
        hasReduce={true}
      />);
      expect(reduceEl.instance().getReduceValue()).toBe('_sum');
    });

    it('shows warning when custom reduce is not supported', () => {
      const reduceEl = shallow(<Views.ReduceEditor
        {...defaultProps}
        reduce='function() {}'
        hasReduce={true}
        customReducerSupported={false}
      />);
      expect(reduceEl.find('div.reduce-editor-warning').exists()).toBe(true);
    });

  });
});

describe('DesignDocSelector component', () => {
  const defaultProps = {
    designDocList: ['_design/test-doc', '_design/test-doc2'],
    newDesignDocName: '',
    selectedDesignDocPartitioned: false,
    isDbPartitioned: false,
    newDesignDocPartitioned: false,
    onChangeNewDesignDocName: () => {},
    onSelectDesignDoc: () => {}
  };
  let selectorEl;

  it('calls onSelectDesignDoc on change', () => {
    const spy = sinon.spy();
    selectorEl = mount(
      <Views.DesignDocSelector
        {...defaultProps}
        selectedDDocName={'new-doc'}
        onSelectDesignDoc={spy}
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
        {...defaultProps}
        selectedDesignDocName={'new-doc'}
      />);

    expect(selectorEl.find('#new-ddoc-section').length).toBe(1);
  });

  it('hides new design doc field when design doc selected', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        {...defaultProps}
        selectedDesignDocName={'_design/test-doc'}
      />);

    expect(selectorEl.find('#new-ddoc-section').length).toBe(0);
  });

  it('always passes validation when design doc selected', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        {...defaultProps}
        selectedDesignDocName={'_design/test-doc'}
      />);

    expect(selectorEl.instance().validate()).toBe(true);
  });

  it('fails validation if new doc name entered/not entered', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        {...defaultProps}
        selectedDesignDocName={'new-doc'}
        newDesignDocName=''
      />);

    // it shouldn't validate at this point: no new design doc name has been entered
    expect(selectorEl.instance().validate()).toBe(false);
  });

  it('passes validation if new doc name entered/not entered', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        {...defaultProps}
        selectedDesignDocName={'new-doc'}
        newDesignDocName='new-doc-name'
      />);
    expect(selectorEl.instance().validate()).toBe(true);
  });


  it('omits doc URL when not supplied', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        {...defaultProps}
        selectedDesignDocName={'new-doc'}
      />);
    expect(selectorEl.find('.help-link').length).toBe(0);
  });

  it('includes help doc link when supplied', () => {
    const docLink = 'http://docs.com';
    selectorEl = mount(
      <Views.DesignDocSelector
        {...defaultProps}
        selectedDesignDocName={'new-doc'}
        docLink={docLink}
      />);
    expect(selectorEl.find('.help-link').length).toBe(1);
    expect(selectorEl.find('.help-link').prop('href')).toBe(docLink);
  });

  it('shows Partitioned checkbox only when db is partitioned', () => {
    selectorEl = mount(
      <Views.DesignDocSelector
        {...defaultProps}
        selectedDesignDocName={'new-doc'}
      />);

    expect(selectorEl.find('div.ddoc-selector-partitioned').exists()).toBe(false);

    selectorEl.setProps({isDbPartitioned: true});
    expect(selectorEl.find('div.ddoc-selector-partitioned').exists()).toBe(true);
  });

  it('calls onChangeNewDesignDocPartitioned when partitioned option changes', () => {
    const spy = sinon.stub();
    selectorEl = mount(
      <Views.DesignDocSelector
        {...defaultProps}
        selectedDesignDocName={'new-doc'}
        isDbPartitioned={true}
        onChangeNewDesignDocPartitioned={spy}
      />);
    selectorEl.find('input#js-ddoc-selector-partitioned').simulate('change');
    sinon.assert.called(spy);
  });
});

describe('IndexEditor', () => {
  const defaultProps = {
    isLoading: false,
    isNewView: false,
    isNewDesignDoc: false,
    isDbPartitioned: false,
    viewName: '',
    database: { safeID: () => 'test_db' },
    newDesignDocName: '',
    newDesignDocPartitioned: false,
    originalViewName: '',
    originalDesignDocName: '',
    designDoc: {},
    designDocId: '',
    designDocPartitioned: false,
    designDocList: [],
    map: '',
    reduce: '',
    designDocs: {},
    updateNewDesignDocName: () => {},
    updateMapCode: () => {},
    selectDesignDoc: () => {},
    onChangeNewDesignDocName: () => {},
    changeViewName: () => {},
    reduceOptions: [],
    reduceSelectedOption: 'NONE',
    hasReduce: false,
    hasCustomReduce: false,
    updateReduceCode: () => {},
    selectReduceChanged: () => {}
  };

  afterEach(() => {
    sinon.restore();
  });

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

  it('generates the correct cancel link when db, ddoc and views have special chars', () => {
    const editorEl = mount(<Views.IndexEditor
      {...defaultProps}
      database={{ id: 'db%$1' }}
      designDocId={'_design/doc/1$2'}
      viewName={'v?abc/123'}
    />);
    const expectedUrl = `/${encodeURIComponent('db%$1')}/_design/${encodeURIComponent('doc/1$2')}/_view/${encodeURIComponent('v?abc/123')}`;
    expect(editorEl.find('a.index-cancel-link').prop('href')).toMatch(expectedUrl);
  });

  it('shows warning when trying to save a partitioned view with custom reduce', () => {
    sinon.stub(FauxtonAPI, 'addNotification');
    const editorEl = mount(<Views.IndexEditor
      {...defaultProps}
      viewName='new-name'
      designDocId='new-doc'
      newDesignDocName='test_ddoc'
      newDesignDocPartitioned={true}
      isDbPartitioned={true}
      reduce='function() { /*custom reduce*/ }'
    />);

    editorEl.find('form.view-query-save').simulate('submit', {
      preventDefault: () => {}
    });
    sinon.assert.calledWithMatch(FauxtonAPI.addNotification, { msg: 'Partitioned views do not support custom reduce functions.' });
  });

});
