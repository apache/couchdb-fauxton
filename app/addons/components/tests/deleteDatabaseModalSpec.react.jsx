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
import ReactComponents from "../react-components.react";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";

var assert = utils.assert;

function noop () {}

describe('DeleteDatabaseModal', function () {
  var container;
  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('submitting is disabled when initially rendered', function () {
    TestUtils.renderIntoDocument(
      <ReactComponents.DeleteDatabaseModal
        showHide={noop}
        modalProps={{isSystemDatabase: false, showDeleteModal: true, dbId: 'fooo'}} />,
      container
    );

    assert.ok($('body').find('.modal').find('button.delete').prop('disabled'));
  });

  it('submitting is disabled when garbage entered', function () {
    TestUtils.renderIntoDocument(
      <ReactComponents.DeleteDatabaseModal
        showHide={noop}
        modalProps={{isSystemDatabase: false, showDeleteModal: true, dbId: 'fooo'}} />,
      container
    );

    var input = $('body').find('.modal').find('input')[0];

    TestUtils.Simulate.change(input, {target: {value: 'Hello, world'}});
    assert.ok($('body').find('.modal').find('button.delete').prop('disabled'));
  });

  it('submitting is enabled when same db name entered', function () {
    TestUtils.renderIntoDocument(
      <ReactComponents.DeleteDatabaseModal
        showHide={noop}
        modalProps={{isSystemDatabase: false, showDeleteModal: true, dbId: 'fooo'}} />,
      container
    );

    var input = $('body').find('.modal').find('input')[0];

    TestUtils.Simulate.change(input, {target: {value: 'fooo'}});
    assert.notOk($('body').find('.modal').find('button.delete').prop('disabled'));
  });


});
