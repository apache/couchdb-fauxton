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
import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import FauxtonAPI from '../../../core/api';
import AnalyzerDropdown from '../components/AnalyzerDropdown';
import SearchForm from '../components/SearchForm';
import SearchIndexEditor from '../components/SearchIndexEditor';
import '../base';

describe('SearchIndexEditor', () => {
  const defaultProps = {
    isLoading: false,
    isCreatingIndex: false,
    database: { id: 'my_db' },
    lastSavedDesignDocName: 'last_ddoc',
    lastSavedSearchIndexName: 'last_idx',
    searchIndexFunction: '',
    saveDoc: {},
    designDocs: [],
    searchIndexName: '',
    ddocPartitioned: false,
    newDesignDocPartitioned: false,
    analyzerType: '',
    singleAnalyzer: '',
    defaultAnalyzer: '',
    defaultMultipleAnalyzer: '',
    analyzerFields: [],
    setAnalyzerType: () => {},
    setDefaultMultipleAnalyzer: () => {},
    setSingleAnalyzer: () => {},
    addAnalyzerRow: () => {},
    setSearchIndexName: () => {},
    saveSearchIndex: () => {},
    selectDesignDoc: () => {},
    updateNewDesignDocName: () => {}
  };

  it('generates the correct cancel link when db, ddoc and views have special chars', () => {
    const editorEl = mount(<SearchIndexEditor
      {...defaultProps}
      database={{ id: 'db%$1' }}
      lastSavedDesignDocName={'_design/doc/1$2'}
      lastSavedSearchIndexName={'search?abc/123'}
    />);
    const expectedUrl = `/${encodeURIComponent('db%$1')}/_design/${encodeURIComponent('doc/1$2')}/_search/${encodeURIComponent('search?abc/123')}`;
    expect(editorEl.find('a.index-cancel-link').prop('href')).toMatch(expectedUrl);
  });

  it('does not save when missing the index name', () => {
    const spy = sinon.stub();
    const editorEl = mount(<SearchIndexEditor
      {...defaultProps}
      database={{ id: 'test_db' }}
      designDocs={[{id: '_design/d1'}, {id: '_design/d2'}]}
      ddocName='_design/d1'
      searchIndexName={''}
      saveSearchIndex={spy}
      saveDoc={{id: '_design/d'}}
    />);

    editorEl.find('button#save-index').simulate('click', {preventDefault: () => {}});
    sinon.assert.notCalled(spy);
  });
});

describe('AnalyzerDropdown', () => {

  it('check default values and settings', () => {
    const el = mount(<AnalyzerDropdown />);

    // confirm default label
    expect(el.find('label').length).toBe(2);
    expect(el.find('label').first().text()).toBe('Type');

    // confirm default value
    expect(el.find('select').hasClass('standard')).toBeTruthy();
  });

  it('omits label element if empty label passed', () => {
    const el = mount(<AnalyzerDropdown label="" />);

    // (1, because there are normally 2 labels, see prev test)
    expect(el.find('label').length).toBe(1);
  });

  it('custom ID works', () => {
    const customID = 'myCustomID';
    const el = mount(<AnalyzerDropdown id={customID} />);
    expect(el.find('select').prop('id')).toBe(customID);
  });

  it('sets default value', () => {
    const defaultSelected = 'russian';
    const el = mount(
      <AnalyzerDropdown defaultSelected={defaultSelected} />
    );

    expect(el.find('select').hasClass(defaultSelected)).toBeTruthy();
  });

  it('custom classes get applied', () => {
    const el = mount(<AnalyzerDropdown classes="nuthatch vulture" />);
    expect(el.find('.nuthatch').exists()).toBeTruthy();
    expect(el.find('.vulture').exists()).toBeTruthy();
  });

  it('custom change handler gets called', () => {
    const spy = sinon.spy();
    const el = mount(<AnalyzerDropdown onChange={spy} />);
    const newVal = 'whitespace';
    el.find('select').simulate('change', { target: { value: newVal }});
    expect(spy.calledOnce).toBeTruthy();
  });

});

describe('SearchForm', () => {
  const defaultProps = {
    searchResults: [{id: 'elephant'}],
    searchPerformed: true,
    hasActiveQuery: false,
    searchQuery: 'a_search',
    database: { id: 'foo' },
    querySearch: () => {},
    setSearchQuery: () => {}
  };

  beforeEach(() => {
    sinon.stub(FauxtonAPI, 'urls').returns('/fake/url');
  });

  afterEach(() => {
    FauxtonAPI.urls.restore();
  });

  it('renders docs from the search results', () => {
    const el = mount(<SearchForm
      {...defaultProps}
    />);
    expect(el.find('pre').first().text('elephant')).toBeTruthy();
  });

  it('renders with links', () => {
    const el = mount(<SearchForm
      {...defaultProps}
    />);
    expect(el.find('a')).toBeTruthy();
  });
});
