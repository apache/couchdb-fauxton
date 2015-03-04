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
  'addons/documents/pagination/pagination.react',
  'testUtils',
  "react"
], function (FauxtonAPI, Views, utils, React) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('All Docs Number', function () {

    describe('PerPageSelector', function () {
      var container, selectorEl, perPageChange;

      beforeEach(function () {
        perPageChange = sinon.spy();
        container = document.createElement('div');
        selectorEl = TestUtils.renderIntoDocument(
          <Views.PerPageSelector
            perPageChange={perPageChange}
            perPage={10}
          />,
          container
        );
      });

      afterEach(function () {
        React.unmountComponentAtNode(container);
      });

      it('on new select calls callback with new page size', function () {
        var selectEl = $(selectorEl.getDOMNode()).find('#select-per-page')[0];
        var perPage = 5;
        TestUtils.Simulate.change(selectEl, {
          target: {
            value: perPage
          }
        });

        assert.ok(perPageChange.calledWith(perPage));
      });

    });
  });
});
