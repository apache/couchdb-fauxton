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
  '../../../../core/api',
  '../pagination.react',
  '../../../../../test/mocha/testUtils',
  'react',
  'react-dom',
  'react-addons-test-utils',
  'sinon'
], function (FauxtonAPI, Views, utils, React, ReactDOM, TestUtils, sinon) {

  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;

  describe('All Docs Number', function () {

    describe('PerPageSelector', function () {
      var container, selectorEl, perPageChange;

      beforeEach(function () {
        perPageChange = sinon.spy();
        container = document.createElement('div');
      });

      afterEach(function () {
        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(selectorEl).parentNode);
      });

      it('on new select calls callback with new page size', function () {
        selectorEl = TestUtils.renderIntoDocument(
          <Views.PerPageSelector
            perPageChange={perPageChange}
            perPage={10} />,
          container
        );
        var selectEl = $(ReactDOM.findDOMNode(selectorEl)).find('#select-per-page')[0];
        var perPage = 5;
        TestUtils.Simulate.change(selectEl, {
          target: {
            value: perPage
          }
        });

        assert.ok(perPageChange.calledWith(perPage));
      });

      it('applies custom label', function () {
        var customLabel = 'alphabet soup';
        selectorEl = TestUtils.renderIntoDocument(
          <Views.PerPageSelector
            label={customLabel}
            perPageChange={perPageChange}
            perPage={10} />,
          container
        );
        var regexp = new RegExp(customLabel);
        assert.ok(regexp.test(React.findDOMNode(selectorEl).outerHTML));
      });

      it('applies custom options', function () {
        selectorEl = TestUtils.renderIntoDocument(
          <Views.PerPageSelector
            options={[1, 2, 3]}
            perPageChange={perPageChange}
            perPage={10} />,
          container
        );
        var options = $(React.findDOMNode(selectorEl)).find('option');
        assert.equal(options.length, 3);
        assert.equal(options[0].innerHTML, "1");
        assert.equal(options[1].innerHTML, "2");
        assert.equal(options[2].innerHTML, "3");
      });

    });

    describe('TableControls', function () {
      var container, selectorEl;

      beforeEach(function () {
        container = document.createElement('div');
      });

      afterEach(function () {
        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(selectorEl).parentNode);
      });

      it('shows the amount of fields, none hidden', function () {

        selectorEl = TestUtils.renderIntoDocument(
          <Views.TableControls prioritizedEnabled={true} displayedFields={{shown: 7, allFieldCount: 7}} />,
          container
        );

        var text = $(ReactDOM.findDOMNode(selectorEl)).find('.shown-fields').text();

        assert.equal('Showing 7 columns.', text);
      });

      it('shows the amount of fields, some hidden', function () {

        selectorEl = TestUtils.renderIntoDocument(
          <Views.TableControls prioritizedEnabled={true} displayedFields={{shown: 5, allFieldCount: 7}} />,
          container
        );

        var text = $(ReactDOM.findDOMNode(selectorEl)).find('.shown-fields').text();

        assert.equal('Showing 5 of 7 columns.', text);
      });
    });
  });
});
