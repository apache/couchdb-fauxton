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
  'addons/fauxton/components.react',
  'testUtils',
  "react"
], function (FauxtonAPI, Views, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('Tray', function () {

    var container, anotherContainer, trayEl, done, old$;
    // trace registrations
    var handlersOn, handlersOff, velocities;

    beforeEach(function () {
      handlersOn = [];
      handlersOff = [];
      velocities = [];
      done = sinon.spy();
      // simulate $ to test registration
      old$ = $;
      $ = function (what) {
        this.on = function (id, handler) {
          handlersOn.push([what, id]);
        };
        this.off = function (id) {
          handlersOff.push([what, id]);
        };
        this.velocity = function (trans, speed, callback) {
          velocities.push([what, trans]);
          callback();
        };
        return this;
      };
      container = document.createElement('div');
      // when we want to control the diff, we have to render directly
      trayEl = React.renderComponent(React.createElement(Views.Tray, {className: "traytest"}), container);
    });

    afterEach(function () {
      $ = old$;
      React.unmountComponentAtNode(container);
      if (anotherContainer) {
        React.unmountComponentAtNode(anotherContainer);
      }
    });

    it('renders trayid and custom classes', function () {
      assert(trayEl.getDOMNode().getAttribute("class").indexOf("traytest") >= 0);
    });

    it('registers handler with body', function () {
      assert.equal(1, handlersOn.length);
      assert.equal("body", handlersOn[0][0]);
      assert.equal("click.Tray-", handlersOn[0][1].substring(0, "click.Tray-".length));
      assert.equal(0, handlersOff.length);
      // also a 2nd time
      anotherContainer = document.createElement('div');
      React.renderComponent(React.createElement(Views.Tray, {className: "traytest"}), anotherContainer);
      assert.equal(2, handlersOn.length);
      assert.equal("body", handlersOn[1][0]);
      assert.equal("click.Tray-", handlersOn[1][1].substring(0, "click.Tray-".length));
      assert.equal(0, handlersOff.length);
      // (we have different IDs)
      assert(handlersOn[0][1] != handlersOn[1][1]);
      // and we also unregister properly
      var unmountSuccess = React.unmountComponentAtNode(anotherContainer);
      assert(unmountSuccess);
      assert.equal(1, handlersOff.length);
      assert.equal("body", handlersOff[0][0]);
      assert.equal("click.Tray-", handlersOff[0][1].substring(0, "click.Tray-".length));
      // (the ID of the 2nd element)
      assert(handlersOn[1][1] == handlersOff[0][1]);
    });

    it('is initially closed', function () {
      assert.equal("none", trayEl.getDOMNode().style.display);
    });

    it('shows when requested', function () {
      trayEl.setVisible(true);
      assert.equal(1, velocities.length);
      assert.equal("block", trayEl.getDOMNode().style.display);
    });

    it('hides when requested', function () {
      trayEl.show();
      trayEl.setVisible(false);
      assert.equal(2, velocities.length);
      assert.equal("none", trayEl.getDOMNode().style.display);
    });

    it('does nothing when already hidden', function () {
      trayEl.setVisible(false);
      assert.equal(0, velocities.length);
    });

    it('toggles open with callback', function () {
      trayEl.toggle(done);
      assert.ok(done.calledOnce);
      assert.equal(1, velocities.length);
      assert.equal("block", trayEl.getDOMNode().style.display);
    });

    it('toggles close again with callback', function () {
      trayEl.show();
      trayEl.toggle(done);
      assert.ok(done.calledOnce);
      assert.equal(2, velocities.length);
      assert.equal("none", trayEl.getDOMNode().style.display);
    });

  });

  describe('Pagination', function () {

    var nvl, container;

    beforeEach(function () {
      // helper for empty strings
      nvl = function (str) {
        return str === null ? "" : str;
      };
      container = document.createElement('div');
      // create element individually to parameterize
    });

    afterEach(function () {
      React.unmountComponentAtNode(container);
    });

    it("renders 20-wise pages per default", function () {
      var pageEl = React.renderComponent(React.createElement(Views.Pagination, {page: 3, total: 55, urlPrefix: "?prefix=", urlSuffix: "&suffix=88"}), container);
      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + 3 + 1, lis.length);
      assert(nvl(lis[0].getAttribute("class")).indexOf("disabled") < 0);
      assert(nvl(lis[1].getAttribute("class")).indexOf("active") < 0);
      assert(nvl(lis[2].getAttribute("class")).indexOf("active") < 0);
      assert(nvl(lis[3].getAttribute("class")).indexOf("active") >= 0);
      assert(nvl(lis[4].getAttribute("class")).indexOf("disabled") >= 0);
      assert.equal("2", lis[2].innerText);
      assert.equal("?prefix=2&suffix=88", lis[2].getElementsByTagName("a")[0].getAttribute("href"));
    });

    it("can overwrite collection size", function () {
      var pageEl = React.renderComponent(React.createElement(Views.Pagination, {perPage: 10, page: 3, total: 55}), container);
      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + 6 + 1, lis.length);
    });

    it("handles large collections properly - beginning", function () {
      var pageEl = React.renderComponent(React.createElement(Views.Pagination, {page: 3, total: 600}), container);
      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + 10 + 1, lis.length);
      assert(nvl(lis[3].getAttribute("class")).indexOf("active") >= 0);
      assert.equal("3", lis[3].innerText);
      assert.equal("7", lis[7].innerText);
      assert.equal("10", lis[10].innerText);
    });

    it("handles large collections properly - middle", function () {
      var pageEl = React.renderComponent(React.createElement(Views.Pagination, {page: 10, total: 600}), container);
      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + 10 + 1, lis.length);
      assert(nvl(lis[6].getAttribute("class")).indexOf("active") >= 0);
      assert.equal("7", lis[3].innerText);
      assert.equal("11", lis[7].innerText);
      assert.equal("14", lis[10].innerText);
    });

    it("handles large collections properly - end", function () {
      var pageEl = React.renderComponent(React.createElement(Views.Pagination, {page: 29, total: 600}), container);
      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + 10 + 1, lis.length);
      assert(nvl(lis[9].getAttribute("class")).indexOf("active") >= 0);
      assert.equal("23", lis[3].innerText);
      assert.equal("27", lis[7].innerText);
      assert.equal("30", lis[10].innerText);
    });

  });

});

