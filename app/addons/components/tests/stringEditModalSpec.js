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
import ReactComponents from "../react-components";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";
import sinon from "sinon";

var assert = utils.assert;

describe('String Edit Modal', function () {
  var container;
  var stub = function () { };

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });

  describe('onSave', function () {
    it('ensures same content returns on saving', function () {
      var string = "a string!";
      var spy = sinon.spy();
      TestUtils.renderIntoDocument(
        <ReactComponents.StringEditModal visible={true} onClose={stub} onSave={spy} value={string} />,
        container
      );
      TestUtils.Simulate.click($('body').find('#string-edit-save-btn')[0]);
      assert.ok(spy.calledOnce);
      assert.ok(spy.calledWith(string));
    });
  });
});
