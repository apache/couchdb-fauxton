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
  'addons/compaction/components.react',
  'addons/compaction/actions',
  'testUtils',
  'react',
  'react-dom'
], function (FauxtonAPI, Views, Actions, utils, React, ReactDOM) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('Compaction Controller', function () {
    var container, controllerEl;

    beforeEach(function () {
      Actions.setCompactionFor({
        id: 'my-database'
      });

      container = document.createElement('div');
      controllerEl = TestUtils.renderIntoDocument(
        <Views.CompactionController />,
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('triggers compact database action', function () {
      var spy = sinon.spy(Actions, 'compactDatabase');

      controllerEl.compactDatabase();
      assert.ok(spy.calledOnce);
    });

    it('triggers clean up view action', function () {
      var spy = sinon.spy(Actions, 'cleanupViews');

      controllerEl.cleanupView();
      assert.ok(spy.calledOnce);
    });

  });

  describe('CleanView', function () {
    var spy, container, cleanupViewEl;

    beforeEach(function () {
      spy = sinon.spy();
      container = document.createElement('div');
      cleanupViewEl = TestUtils.renderIntoDocument(
        <Views.CleanView cleanupView={spy} />,
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('calls cleanupView on button click', function () {
      var el = $(ReactDOM.findDOMNode(cleanupViewEl)).find('button')[0];
      TestUtils.Simulate.click(el, {});

      assert.ok(spy.calledOnce);

    });

  });

  describe('CompactDatabase', function () {
    var spy, container, compactViewEl;

    beforeEach(function () {
      spy = sinon.spy();
      container = document.createElement('div');
      compactViewEl = TestUtils.renderIntoDocument(
        <Views.CompactDatabase compactDatabase={spy} />,
        container
      );
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('calls compact database on button click', function () {
      var el = $(ReactDOM.findDOMNode(compactViewEl)).find('button')[0];
      TestUtils.Simulate.click(el, {});

      assert.ok(spy.calledOnce);

    });

  });
});
