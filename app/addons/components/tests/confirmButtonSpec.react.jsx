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
import FauxtonAPI from "../../../core/api";
import ReactComponents from "../react-components.react";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";
import sinon from "sinon";

var assert = utils.assert;

describe('ConfirmButton', function () {
  var container, button;
  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('should render text properties', function () {
    button = TestUtils.renderIntoDocument(
      <ReactComponents.ConfirmButton text="Click here to render Rocko Artischocko" />,
      container
    );
    assert.equal($(ReactDOM.findDOMNode(button)).text(), 'Click here to render Rocko Artischocko');
  });

  it('should use onClick handler if provided', function () {
    var spy = sinon.spy();

    button = TestUtils.renderIntoDocument(
      <ReactComponents.ConfirmButton text="Click here" onClick={spy} />,
      container
    );

    TestUtils.Simulate.click(ReactDOM.findDOMNode(button));
    assert.ok(spy.calledOnce);
  });

  it('shows icon by default', function () {
    button = TestUtils.renderIntoDocument(
      <ReactComponents.ConfirmButton text="Click here" onClick={function () { }} />,
      container
    );
    assert.equal($(ReactDOM.findDOMNode(button)).find('.icon').length, 1);
  });

  it('optionally omits the icon', function () {
    button = TestUtils.renderIntoDocument(
      <ReactComponents.ConfirmButton text="Click here" onClick={function () { }} showIcon={false} />,
      container
    );
    assert.equal($(ReactDOM.findDOMNode(button)).find('.icon').length, 0);
  });

});
