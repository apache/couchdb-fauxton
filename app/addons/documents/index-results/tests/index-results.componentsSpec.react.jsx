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
  'addons/documents/index-results/index-results.components.react',
  'addons/documents/index-results/actions',
  'addons/documents/resources',
  'addons/databases/resources',
  'testUtils',
  "react"
], function (FauxtonAPI, Views, IndexResultsActions, Resources, Databases, utils, React) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('Index Results', function () {
    var container, el;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it('renders a default text', function () {
      IndexResultsActions.newResultsList({
        collection: [],
        deleteable: true
      });
      IndexResultsActions.resultsListReset();

      el = TestUtils.renderIntoDocument(<Views.List />, container);
      var $el = $(el.getDOMNode());
      assert.equal($el.text(), 'No Index Created Yet!');
    });

    it('you can change the default text', function () {
      IndexResultsActions.newResultsList({
        collection: [],
        deleteable: true,
        textEmptyIndex: 'No Document Created Yet!'
      });
      IndexResultsActions.resultsListReset();

      el = TestUtils.renderIntoDocument(<Views.List />, container);
      var $el = $(el.getDOMNode());
      assert.equal($el.text(), 'No Document Created Yet!');
    });

    describe('loading', function () {
      beforeEach(function () {
        container = document.createElement('div');
      });

      afterEach(function () {
        React.unmountComponentAtNode(container);
      });
      it('should show loading component', function () {
        var resultsEl = TestUtils.renderIntoDocument(<Views.ResultsScreen
          isLoading={true}
          />, container);

        var $el = $(resultsEl.getDOMNode());

        assert.ok($el.find('.loading-lines').length === 1);
      });

      it('should not show loading component', function () {
        var resultsEl = TestUtils.renderIntoDocument(<Views.ResultsScreen
          isLoading={false}
          />, container);

        var $el = $(resultsEl.getDOMNode());

        assert.ok($el.find('.loading-lines').length === 0);
      });
    });
  });
});
