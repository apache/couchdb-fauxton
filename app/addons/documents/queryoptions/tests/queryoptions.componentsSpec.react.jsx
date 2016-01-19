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
  'addons/documents/queryoptions/queryoptions.react',
  'addons/documents/queryoptions/stores',
  'addons/documents/queryoptions/actions',
  'addons/documents/resources',
  'testUtils',
  "react",
  'react-dom'
], function (FauxtonAPI, Views, Stores, Actions, Documents, utils, React, ReactDOM) {
  FauxtonAPI.router = new FauxtonAPI.Router([]);

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;
  var restore = utils.restore;

  describe('Query Options', function () {
    var container, El;

    beforeEach(function () {
      container = document.createElement('div');
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(container);
    });

    describe('MainFieldsView', function () {
      var mainFieldsEl;

      it('returns null no reduce', function () {
        mainFieldsEl = TestUtils.renderIntoDocument(<Views.MainFieldsView reduce={false} includeDocs={false} showReduce={false}/>, container);
        assert.ok(_.isNull(mainFieldsEl.reduce()));
      });

      it('shows reduce and group level', function () {
        mainFieldsEl = TestUtils.renderIntoDocument(<Views.MainFieldsView reduce={true} includeDocs={false} showReduce={true}/>, container);
        assert.ok(!_.isNull(mainFieldsEl.reduce()));
        assert.ok(!_.isNull(mainFieldsEl.groupLevel()));
      });

      it('updates group level', function () {
        var spy = sinon.spy();
        mainFieldsEl = TestUtils.renderIntoDocument(<Views.MainFieldsView updateGroupLevel={spy} reduce={true} includeDocs={false} showReduce={true}/>, container);
        var el = $(ReactDOM.findDOMNode(mainFieldsEl)).find('#qoGroupLevel')[0];
        TestUtils.Simulate.change(el, {target: {value: 'exact'}});

        assert.ok(spy.calledOnce);
      });

      it('toggles include docs on change', function () {
        var spy = sinon.spy();
        mainFieldsEl = TestUtils.renderIntoDocument(<Views.MainFieldsView toggleIncludeDocs={spy} reduce={false} includeDocs={false} showReduce={false}/>, container);
        var el = $(ReactDOM.findDOMNode(mainFieldsEl)).find('#qoIncludeDocs')[0];
        TestUtils.Simulate.change(el);

        assert.ok(spy.calledOnce);
      });

      it('uses overridden URL prop if defined', function () {
        var customDocURL = 'http://whatever.com';
        mainFieldsEl = TestUtils.renderIntoDocument(
          <Views.MainFieldsView reduce={false} includeDocs={false} showReduce={false} docURL={customDocURL} />,
          container);
        assert.equal($(ReactDOM.findDOMNode(mainFieldsEl)).find('.help-link').attr('href'), customDocURL);
      });

    });

    describe('KeySearchFields', function () {

      it('toggles keys', function () {
        var spy = sinon.spy();
        var keysEl = TestUtils.renderIntoDocument(<Views.KeySearchFields
          showByKeys={false}
          showBetweenKeys={false}
          betweenKeys={{}}
          toggleByKeys={spy}
          />, container);

        var el = $(ReactDOM.findDOMNode(keysEl)).find('#byKeys')[0];
        TestUtils.Simulate.click(el);
        assert.ok(spy.calledOnce);
      });

      it('toggles between keys', function () {
        var spy = sinon.spy();
        var keysEl = TestUtils.renderIntoDocument(<Views.KeySearchFields
          showByKeys={false}
          showBetweenKeys={false}
          toggleBetweenKeys={spy}
          betweenKeys={{}}
          />, container);

        var el = $(ReactDOM.findDOMNode(keysEl)).find('#betweenKeys')[0];
        TestUtils.Simulate.click(el);
        assert.ok(spy.calledOnce);
      });

      it('updates byKeys', function () {
        var spy = sinon.spy();
        var keysEl = TestUtils.renderIntoDocument(<Views.KeySearchFields
          showByKeys={false}
          showBetweenKeys={false}
          updateByKeys={spy}
          betweenKeys={{}}
          />, container);

        var el = $(ReactDOM.findDOMNode(keysEl)).find('#keys-input')[0];
        TestUtils.Simulate.change(el, {target: {value: 'boom'}});
        assert.ok(spy.calledWith('boom'));
      });

      it('updates betweenKeys', function () {
        var spy = sinon.spy();
        var betweenKeys = {
          startkey: '',
          endkey: '',
          inclusive_end: true
        };
        var keysEl = TestUtils.renderIntoDocument(<Views.KeySearchFields
          showByKeys={false}
          showBetweenKeys={false}
          updateBetweenKeys={spy}
          betweenKeys={betweenKeys}
          />, container);

        var el = $(ReactDOM.findDOMNode(keysEl)).find('#endkey')[0];
        TestUtils.Simulate.change(el, {target: {value: 'boom'}});
        assert.ok(spy.calledOnce);
      });
    });

    describe('AdditionalParams', function () {
      afterEach(function () {
        restore(FauxtonAPI.addNotification);
      });

      it('only updates skip with numbers', function () {
        var paramsEl = TestUtils.renderIntoDocument(<Views.AdditionalParams
          updateSkip={function () {}}
           />, container);

        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        paramsEl.updateSkip({target: {value: 'b'}, preventDefault: function () {}});

        assert.ok(spy.calledOnce);
      });

      it('updates skip if a number', function () {
        var val = 0;
        var paramsEl = TestUtils.renderIntoDocument(<Views.AdditionalParams
          updateSkip={function (a) {
            val = a;
          }}
           />, container);

        paramsEl.updateSkip({target: {value: '3'}, preventDefault: function () {}});
        assert.equal(val, '3');
      });
    });
  });

});
