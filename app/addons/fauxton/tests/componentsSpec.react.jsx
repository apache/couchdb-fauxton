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
  'react',
  'react-dom'
], function (FauxtonAPI, Views, utils, React, ReactDOM) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;


  describe('Tray', function () {

    var container, trayEl, oldToggleSpeed;

    beforeEach(function () {
      container = document.createElement('div');

      // when we want to control the diff, we have to render directly
      trayEl = TestUtils.renderIntoDocument(<Views.Tray className="traytest" />, container);

      oldToggleSpeed = FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED;

      // makes velocity toggle immediately
      FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED = 0;
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
      FauxtonAPI.constants.MISC.TRAY_TOGGLE_SPEED = oldToggleSpeed;
    });

    it('renders trayid and custom classes', function () {
      assert(trayEl.getDOMNode().getAttribute('class').indexOf('traytest') >= 0);
    });

    it('is initially closed', function () {
      assert.equal('none', trayEl.getDOMNode().style.display);
    });

    it('shows when requested', function () {
      trayEl.setVisible(true, function () {
        assert.equal('block', trayEl.getDOMNode().style.display);
      });
    });

    it('hides when requested', function () {
      trayEl.show(function () {
        trayEl.setVisible(false, function () {
          assert.equal('none', trayEl.getDOMNode().style.display);
        });
      });
    });

    it('does nothing when already hidden', function () {
      trayEl.setVisible(false, function () {
        throw new Error('should do nothing');
      });
    });

    it('toggles open with callback', function () {
      trayEl.toggle(function () {
        assert.equal('block', trayEl.getDOMNode().style.display);
      });
    });

    it('toggles close again with callback', function () {
      trayEl.show(function () {
        trayEl.toggle(function () {
          assert.equal('none', trayEl.getDOMNode().style.display);
        });
      });
    });

    it('calls props.onAutoHide when closing tray by clicking outside of it', function () {
      var container = document.createElement('div');
      var onClose = function () { };
      var spy = sinon.spy();

      var wrapper = React.createClass({

        runTest: function () {
          var trayEl = this.refs.tray;
          var externalEl = this.refs.externalElement;
          trayEl.show(function () {
            TestUtils.Simulate.click(ReactDOM.findDOMNode(externalEl));
            assert.ok(spy.calledOnce);
          });
        },

        render: function () {
          return (
            <div>
              <p ref="externalElement">Click me!</p>
              <Views.Tray ref="tray" onAutoHide={onClose} />
            </div>
          );
        }
      });

      var reactEl = TestUtils.renderIntoDocument(React.createElement(wrapper), container);
      reactEl.runTest();

      ReactDOM.unmountComponentAtNode(container);
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
      ReactDOM.unmountComponentAtNode(container);
    });

    it('renders 20-wise pages per default', function () {
      var pageEl = TestUtils.renderIntoDocument(
        <Views.Pagination page={3} total={55} urlPrefix="?prefix=" urlSuffix="&suffix=88" />,
        container
      );

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
      var pageEl = TestUtils.renderIntoDocument(
        <Views.Pagination perPage={10} page={3} total={55} urlPrefix="?prefix=" urlSuffix="&suffix=88" />,
        container
      );

      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + 6 + 1, lis.length);
    });

    it("handles large collections properly - beginning", function () {
      var pageEl = TestUtils.renderIntoDocument(
        <Views.Pagination page={3} total={600} />,
        container
      );
      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + 10 + 1, lis.length);
      assert(nvl(lis[3].getAttribute("class")).indexOf("active") >= 0);
      assert.equal("3", lis[3].innerText);
      assert.equal("7", lis[7].innerText);
      assert.equal("10", lis[10].innerText);
    });

    it("handles large collections properly - middle", function () {
      var pageEl = TestUtils.renderIntoDocument(
        <Views.Pagination page={10} total={600} />,
        container
      );

      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + 10 + 1, lis.length);
      assert(nvl(lis[6].getAttribute("class")).indexOf("active") >= 0);
      assert.equal("7", lis[3].innerText);
      assert.equal("11", lis[7].innerText);
      assert.equal("14", lis[10].innerText);
    });

    it("handles large collections properly - end", function () {
      var pageEl = TestUtils.renderIntoDocument(
        <Views.Pagination page={29} total={600} />,
        container
      );

      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + 10 + 1, lis.length);
      assert(nvl(lis[9].getAttribute("class")).indexOf("active") >= 0);
      assert.equal("23", lis[3].innerText);
      assert.equal("27", lis[7].innerText);
      assert.equal("30", lis[10].innerText);
    });

    it('limits the number of total pages when customized', function () {
      var maxNavPages = 15;
      var pageEl = TestUtils.renderIntoDocument(
        <Views.Pagination page={1} total={1000} maxNavPages={maxNavPages} />,
        container
      );
      var lis = pageEl.getDOMNode().getElementsByTagName("li");
      assert.equal(1 + maxNavPages + 1, lis.length);
    });

    it('calls callback method when supplied', function () {
      var spy = sinon.spy();
      var pageEl = TestUtils.renderIntoDocument(
        <Views.Pagination page={1} total={100} onClick={spy} />,
        container
      );
      var links = ReactDOM.findDOMNode(pageEl).getElementsByTagName("a");

      TestUtils.Simulate.click(links[3]);

      // confirm it gets called
      assert.ok(spy.calledOnce);

      // confirm it's called with the pagination number (3)
      assert.ok(spy.calledWith(3));
    });

    it('calls callback method with correct values for prev and next', function () {
      var spy = sinon.spy();

      var currentPage = 5;
      var pageEl = TestUtils.renderIntoDocument(
        <Views.Pagination page={currentPage} total={200} onClick={spy} />,
        container
      );
      var links = ReactDOM.findDOMNode(pageEl).getElementsByTagName("a");

      TestUtils.Simulate.click(links[0]);
      assert.ok(spy.calledWith(currentPage - 1));

      TestUtils.Simulate.click(links[11]); // last index
      assert.ok(spy.calledWith(currentPage + 1));
    });

  });


  describe('Clipboard', function () {
    var container;
    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    it('shows a clipboard icon by default', function () {
      var clipboard = TestUtils.renderIntoDocument(<Views.Clipboard text="copy me" />, container);
      assert.equal($(ReactDOM.findDOMNode(clipboard)).find('.icon-paste').length, 1);
    });

    it('shows text if specified', function () {
      var clipboard = TestUtils.renderIntoDocument(<Views.Clipboard displayType="text" text="copy me" />, container);
      assert.equal($(ReactDOM.findDOMNode(clipboard)).find('.icon-paste').length, 0);
    });

    it('shows custom text if specified ', function () {
      var clipboard = TestUtils.renderIntoDocument(<Views.Clipboard displayType="text" textDisplay='booyah!' text="copy me" />, container);
      assert.ok(/booyah!/.test($(ReactDOM.findDOMNode(clipboard))[0].outerHTML));
    });

  });

});
