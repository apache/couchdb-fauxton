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
  '../../../core/api',
  '../components.react',
  '../actions',
  '../resources',
  '../stores',
  '../../../../test/mocha/testUtils',
  "react",
  'react-dom',
  'react-addons-test-utils',
  'sinon'
], function (FauxtonAPI, Views, Actions, Resources, Stores, utils, React, ReactDOM, TestUtils, sinon) {

  FauxtonAPI.router = new FauxtonAPI.Router([]);
  var assert = utils.assert;
  var corsStore = Stores.corsStore;

  describe('CORS Components', function () {


    describe('CorsController', function () {
      var container, corsEl, saveStub;

      beforeEach(function () {
        container = document.createElement('div');
        corsStore._origins = ['http://hello.com'];
        corsStore._node = 'node2@127.0.0.1';
        corsStore._isEnabled = true;
        corsStore._configChanged = true;
        corsEl = TestUtils.renderIntoDocument(<Views.CORSController />, container);
        //stub this out so it doesn't keep trying to save cors and crash phantomjs
        saveStub = sinon.stub(corsEl, 'save');
      });

      afterEach(function () {
        utils.restore(Actions.toggleLoadingBarsToEnabled);
        utils.restore(corsEl.save);

        ReactDOM.unmountComponentAtNode(container);
        window.confirm.restore && window.confirm.restore();
      });

      it('confirms user change from restricted origin to disabled cors', function () {
        var spy = sinon.stub(window, 'confirm');
        spy.returns(false);
        corsEl.state.isAllOrigins = false;
        corsEl.state.corsEnabled = true;
        corsEl.enableCorsChange();
        assert.ok(spy.calledOnce);
      });

      it('does not confirm for selected origins are emtpy for disabled cors change', function () {
        var spy = sinon.stub(window, 'confirm');
        sinon.stub(Actions, 'toggleLoadingBarsToEnabled');
        spy.returns(false);
        corsEl.state.corsEnabled = true;
        corsEl.state.isAllOrigins = false;
        corsEl.state.origins = [];
        corsEl.enableCorsChange();
        assert.notOk(spy.calledOnce);
      });

      it('confirms user change when moving from selected origins to all origins', function () {
        var spy = sinon.stub(window, 'confirm');
        spy.returns(false);
        corsEl.state.corsEnabled = true;
        corsEl.state.isAllOrigins = false;
        corsEl.originChange(true);
        assert.ok(spy.calledOnce);
      });

      it('does not confirm all origins change if selected origins are emtpy', function () {
        var spy = sinon.stub(window, 'confirm');
        sinon.stub(Actions, 'toggleLoadingBarsToEnabled');
        spy.returns(false);
        corsEl.state.corsEnabled = true;
        corsEl.state.isAllOrigins = false;
        corsEl.state.origins = [];
        corsEl.originChange(true);

        assert.notOk(spy.calledOnce);
      });

      it('shows loading bars', function () {
        Actions.toggleLoadingBarsToEnabled(true);
        assert.equal($(ReactDOM.findDOMNode(corsEl)).find('.loading-lines').length, 1);
      });

      it('hides loading bars', function () {
        Actions.toggleLoadingBarsToEnabled(false);

        assert.equal($(ReactDOM.findDOMNode(corsEl)).find('.loading-lines').length, 0);
      });
    });

    describe('OriginInput', function () {
      var container, inputEl, addOrigin;
      var newOrigin = 'http://new-site.com';

      beforeEach(function () {
        addOrigin = sinon.spy();
        container = document.createElement('div');
        inputEl = TestUtils.renderIntoDocument(<Views.OriginInput isVisible={true} addOrigin={addOrigin}/>, container);
      });

      afterEach(function () {
        utils.restore(Resources.validateCORSDomain);
        utils.restore(FauxtonAPI.addNotification);
        ReactDOM.unmountComponentAtNode(container);
      });

      it('calls validates each domain', function () {
        var spy = sinon.spy(Resources, 'validateCORSDomain');
        TestUtils.Simulate.change($(ReactDOM.findDOMNode(inputEl)).find('input')[0], {target: {value: newOrigin}});
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(inputEl)).find('.btn')[0]);
        assert.ok(spy.calledWith(newOrigin));
      });

      it('calls addOrigin on add click with valid domain', function () {
        TestUtils.Simulate.change($(ReactDOM.findDOMNode(inputEl)).find('input')[0], {target: {value: newOrigin}});
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(inputEl)).find('.btn')[0]);
        assert.ok(addOrigin.calledWith(newOrigin));
      });

      it('shows notification if origin is not valid', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        TestUtils.Simulate.change($(ReactDOM.findDOMNode(inputEl)).find('input')[0], {target: {value: 'badOrigin'}});
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(inputEl)).find('.btn')[0]);
        assert.ok(spy.calledOnce);
      });
    });

    describe('Origins', function () {
      var container, originEl, changeOrigin;

      beforeEach(function () {
        changeOrigin = sinon.spy();
        container = document.createElement('div');
        originEl = TestUtils.renderIntoDocument(<Views.Origins corsEnabled={true} isAllOrigins={false} originChange={changeOrigin}/>, container);
      });

      afterEach(function () {
        ReactDOM.unmountComponentAtNode(container);
      });

      it('calls change Origin on all origins selected', function () {
        TestUtils.Simulate.change($(ReactDOM.findDOMNode(originEl)).find('input[value="all"]')[0]);
        assert.ok(changeOrigin.calledWith(true));
      });

      it('calls changeOrigin() when you switch from "Allow All Origins" to "Select List of Origins"', function () {
        //changeOrigin(true) = sets origins to ['*']
        //changeOrigin(false) = sets origins to [] (an empty array which user can populate with URLs)

        //this test begins with 'select origins' checked,
        //1. render radio buttons with 'all origins'
        originEl = TestUtils.renderIntoDocument(<Views.Origins corsEnabled={true} isAllOrigins={true} originChange={changeOrigin}/>, container);
        //2. switch back to 'select origins'
        TestUtils.Simulate.change($(ReactDOM.findDOMNode(originEl)).find('input[value="selected"]')[0]);
        assert.ok(changeOrigin.calledWith(false));
      });
    });

    describe('OriginRow', function () {
      var container, originTableEl, origin, deleteOrigin, updateOrigin;

      beforeEach(function () {
        deleteOrigin = sinon.spy();
        updateOrigin = sinon.spy();
        container = document.createElement('div');
        origin = 'https://hello.com';
        //because OriginRow is inside a table have to render the whole table to test
        originTableEl = TestUtils.renderIntoDocument(<Views.OriginTable updateOrigin={updateOrigin} deleteOrigin={deleteOrigin} isVisible={true} origins={[origin]}/>, container);
      });

      afterEach(function () {
        window.confirm.restore && window.confirm.restore();
        Actions.deleteOrigin.restore && Actions.deleteOrigin.restore();
        ReactDOM.unmountComponentAtNode(container);
      });

      it('should confirm on delete', function () {
        var stub = sinon.stub(window, 'confirm');
        stub.returns(true);

        TestUtils.Simulate.click($(ReactDOM.findDOMNode(originTableEl)).find('.fonticon-trash')[0]);
        assert.ok(stub.calledOnce);
      });

      it('does not throw on origins being undefined', function () {
        TestUtils.renderIntoDocument(
          <Views.OriginTable
            updateOrigin={updateOrigin}
            deleteOrigin={deleteOrigin}
            isVisible={true}
            origins={false} />,
          container
        );
      });

      it('should deleteOrigin on confirm true', function () {
        var stub = sinon.stub(window, 'confirm');
        stub.returns(true);
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(originTableEl)).find('.fonticon-trash')[0]);
        assert.ok(deleteOrigin.calledWith(origin));
      });

      it('should not deleteOrigin on confirm false', function () {
        var stub = sinon.stub(window, 'confirm');
        stub.returns(false);
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(originTableEl)).find('.fonticon-trash')[0]);
        assert.notOk(deleteOrigin.calledOnce);
      });

      it('should change origin to input on edit click', function () {
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(originTableEl)).find('.fonticon-pencil')[0]);
        assert.ok($(ReactDOM.findDOMNode(originTableEl)).find('input').length === 1);
      });

      it('should update origin on update clicked', function () {
        var updatedOrigin = 'https://updated-origin.com';
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(originTableEl)).find('.fonticon-pencil')[0]);
        TestUtils.Simulate.change($(ReactDOM.findDOMNode(originTableEl)).find('input')[0], {
          target: {
            value: updatedOrigin
          }
        });
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(originTableEl)).find('.btn')[0]);
        assert.ok(updateOrigin.calledWith(updatedOrigin));
      });

      it('should not update origin on update clicked with bad origin', function () {
        var updatedOrigin = 'updated-origin';
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(originTableEl)).find('.fonticon-pencil')[0]);
        TestUtils.Simulate.change($(ReactDOM.findDOMNode(originTableEl)).find('input')[0], {
          target: {
            value: updatedOrigin
          }
        });
        TestUtils.Simulate.click($(ReactDOM.findDOMNode(originTableEl)).find('.btn')[0]);
        assert.notOk(updateOrigin.calledOnce);
      });

    });

  });

});
