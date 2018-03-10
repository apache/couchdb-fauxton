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

import React from "react";
import TestUtils from 'react-dom/test-utils';
import utils  from "../../../../test/mocha/testUtils";
import sinon from "sinon";
import configureMockStore from 'redux-mock-store';
import {Provider} from "react-redux";
import {mount} from "enzyme";
import CompactionContainer from '../containers/CompactionContainer';
import CompactionController from '../components/CompactionController';
import {CleanView} from "../components/CleanView";
import {CompactDatabase} from "../components/CompactDatabase";

const store = configureMockStore()({
  compaction: {
    isCompacting: false,
    isCleaningView: false,
    isCompactingView: false
  }
});

const {assert} = utils;

describe('Compaction Controller', function () {
  let instance, container;

  beforeEach(() => {
    spyOn(store, 'dispatch');
    instance = TestUtils.renderIntoDocument(
      <Provider store={store}>
        <CompactionContainer database="my-database"/>
      </Provider>
    );
  });

  it('triggers compact database action', function () {
    container = TestUtils.findRenderedComponentWithType(instance, CompactionController);
    container.props.compactDatabase('test');
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('triggers clean up view action', function () {
    container = TestUtils.findRenderedComponentWithType(instance, CompactionController);
    container.props.cleanupViews('test');
    expect(store.dispatch).toHaveBeenCalled();
  });
});

describe('CleanView', function () {
  let spy, cleanupViewEl;

  beforeEach(function () {
    spy = sinon.spy();
    cleanupViewEl = mount(<CleanView cleanupViews={spy}/>);
  });

  it('calls cleanupView on button click', function () {
    cleanupViewEl.find('button').first().simulate('click');
    assert.ok(spy.calledOnce);

  });
});

describe('CompactDatabase', function () {
  let spy, compactViewEl;

  beforeEach(function () {
    spy = sinon.spy();
    compactViewEl = mount(<CompactDatabase compactDatabase={spy}/>);
  });

  it('calls compact database on button click', function () {
    compactViewEl.find('button').first().simulate('click');
    assert.ok(spy.calledOnce);
  });
});

