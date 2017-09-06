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

import {
  nowLoading,
  resetState,
  newResultsAvailable,
  newSelectedDocs,
  selectDoc,
  bulkCheckOrUncheck,
  changeLayout,
  changeTableHeaderAttribute
} from '../index-results/actions/base';
import ActionTypes from '../index-results/actiontypes';
import Constants from '../constants';

describe('Docs Base API', () => {
  let docs;
  beforeEach(() => {
    docs = [
      {
        _id: 'test1',
        _rev: 'foo'
      },
      {
        _id: 'test2',
        _rev: 'bar'
      }
    ];
  });

  it('nowLoading returns the proper event to dispatch', () => {
    expect(nowLoading()).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_IS_LOADING
    });
  });

  it('resetState returns the proper event to dispatch', () => {
    expect(resetState()).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_RESET_STATE
    });
  });

  it('newResultsAvailable returns the proper event to dispatch', () => {
    const params = {
      skip: 0,
      limit: 21
    };
    const canShowNext = true;
    const docType = Constants.INDEX_RESULTS_DOC_TYPE.VIEW;

    expect(newResultsAvailable(docs, params, canShowNext, docType)).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_NEW_RESULTS,
      docs: docs,
      params: params,
      canShowNext: canShowNext,
      docType: docType
    });
  });

  it('newSelectedDocs returns the proper event to dispatch', () => {
    const selectedDocs = [
      {
        _id: 'test1',
        _rev: 'foo',
        _deleted: true
      }
    ];

    expect(newSelectedDocs(selectedDocs)).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
      selectedDocs: selectedDocs
    });
  });

  it('selectDoc returns the proper event to dispatch', () => {
    const doc = {
      _id: 'apple',
      _rev: 'pie',
      _deleted: true
    };

    const selectedDocs = [
      {
        _id: 'test1',
        _rev: 'foo',
        _deleted: true
      }
    ];

    expect(selectDoc(doc, selectedDocs)).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
      selectedDocs: [
        {
          _id: 'test1',
          _rev: 'foo',
          _deleted: true
        },
        {
          _id: 'apple',
          _rev: 'pie',
          _deleted: true
        }
      ]
    });
  });

  describe('bulkCheckOrUncheck', () => {
    it('returns the proper event to dispatch when allDocumentsSelected false', () => {
      const selectedDocs = [];
      const allDocumentsSelected = false;
      expect(bulkCheckOrUncheck(docs, selectedDocs, allDocumentsSelected, Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY)).toEqual({
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
        selectedDocs: [
          {
            _id: 'test1',
            _rev: 'foo',
            _deleted: true
          },
          {
            _id: 'test2',
            _rev: 'bar',
            _deleted: true
          }
        ]
      });
    });

    it('returns the proper event to dispatch when allDocumentsSelected true', () => {
      const selectedDocs = [
        {
          _id: 'test1',
          _rev: 'foo',
          _deleted: true
        },
        {
          _id: 'test2',
          _rev: 'bar',
          _deleted: true
        }
      ];
      const allDocumentsSelected = true;
      expect(bulkCheckOrUncheck(docs, selectedDocs, allDocumentsSelected)).toEqual({
        type: ActionTypes.INDEX_RESULTS_REDUX_NEW_SELECTED_DOCS,
        selectedDocs: []
      });
    });
  });

  it('changeLayout returns the proper event to dispatch', () => {
    expect(changeLayout(Constants.LAYOUT_ORIENTATION.JSON)).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_CHANGE_LAYOUT,
      layout: Constants.LAYOUT_ORIENTATION.JSON
    });
  });

  it('changeTableHeaderAttribute returns the proper event to dispatch', () => {
    const selectedFields = ['_id', '_rev', 'foo'];
    const newField = {
      index: 1,
      newSelectedRow: 'bar'
    };
    expect(changeTableHeaderAttribute(newField, selectedFields)).toEqual({
      type: ActionTypes.INDEX_RESULTS_REDUX_CHANGE_TABLE_HEADER_ATTRIBUTE,
      selectedFieldsTableView: ['_id', 'bar', 'foo']
    });
  });
});
