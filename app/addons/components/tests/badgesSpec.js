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

var assert = utils.assert;

describe('Badges', function () {
  var container, instance;
  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(instance).parentNode);
  });

  it('renders a list of badges', function () {
    instance = TestUtils.renderIntoDocument(
      <ReactComponents.BadgeList elements={['foo', 'bar']} removeBadge={function () {}} />,
      container
    );

    var $el = $(ReactDOM.findDOMNode(instance));

    assert.equal($el.find('.component-badge').length, 2);
  });

  it('supports custom label formatters', function () {
    instance = TestUtils.renderIntoDocument(
      <ReactComponents.BadgeList elements={['foo', 'bar']} removeBadge={function () {}} getLabel={function (el) { return el + 'foo'; }} />,
      container
    );

    var $el = $(ReactDOM.findDOMNode(instance));

    assert.equal($el.find('.component-badge').text(), 'foofoo×barfoo×');
  });

});
