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
define([
  'api',
  'addons/components/react-components.react',
  'testUtils',
  'react',
  'react-dom'
], function (FauxtonAPI, ReactComponents, utils, React, ReactDOM) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('styled select', function () {
    var container, selectorEl, spy = sinon.spy();

    beforeEach(function () {
      container = document.createElement('div');

      var selectContent = (
        <optgroup label="Select a document">
          <option value="new">New Design Document</option>
          <option value="foo">New Design Document</option>
        </optgroup>
      );

      selectorEl = TestUtils.renderIntoDocument(
        <ReactComponents.StyledSelect
          selectId="new-ddoc"
          selectClass=""
          selectContent={selectContent}
          selectChange={spy} />,
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('calls the callback on select', function () {
      TestUtils.Simulate.change($(ReactDOM.findDOMNode(selectorEl)).find('#new-ddoc')[0], {
        target: {
          value: 'new'
        }
      });
      assert.ok(spy.calledOnce);
    });

  });
});
