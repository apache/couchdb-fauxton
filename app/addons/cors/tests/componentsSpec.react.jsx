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
  'addons/cors/components.react',
  'addons/cors/actions',
  'addons/cors/resources',
  'testUtils',
  "react"
], function (FauxtonAPI, Views, Actions, Resources, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('CORS Components', function () {

    describe('OriginInput', function () {
      var container, inputEl, addOrigin;
      var newOrigin = 'http://new-site.com';

      beforeEach(function () {
        addOrigin = sinon.spy();
        container = document.createElement('div');
        inputEl = TestUtils.renderIntoDocument(<Views.OriginInput isVisible={true} addOrigin={addOrigin}/>, container);
      });

      afterEach(function () {
        Resources.validateCORSDomain.restore && Resources.validateCORSDomain.restore();
        React.unmountComponentAtNode(container);
      });

      it('calls validates each domain', function () {
        var spy = sinon.spy(Resources, 'validateCORSDomain');
        TestUtils.Simulate.change($(inputEl.getDOMNode()).find('input')[0],{target: {value: newOrigin}});
        TestUtils.Simulate.click($(inputEl.getDOMNode()).find('.btn')[0]);
        assert.ok(spy.calledWith(newOrigin));
      });

      it('calls addOrogin AddOrigin on add click with valid domain', function () {
        TestUtils.Simulate.change($(inputEl.getDOMNode()).find('input')[0],{target: {value: newOrigin}});
        TestUtils.Simulate.click($(inputEl.getDOMNode()).find('.btn')[0]);
        assert.ok(addOrigin.calledWith(newOrigin));
      });

      it('shows notification if origin is not valid', function () {
        var spy = sinon.spy(FauxtonAPI, 'addNotification');
        TestUtils.Simulate.change($(inputEl.getDOMNode()).find('input')[0],{target: {value: 'badOrigin'}});
        TestUtils.Simulate.click($(inputEl.getDOMNode()).find('.btn')[0]);
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
        React.unmountComponentAtNode(container);
      });

      /*it('calls change Origin on add radio button change', function () {
        TestUtils.Simulate.click($(originEl.getDOMNode()).find('input[type="radio"]')[1]);
        console.log(changeOrigin.calledOnce, $(originEl.getDOMNode()).html());
        assert.ok(changeOrigin.calledWith(false));
      });*/
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
        React.unmountComponentAtNode(container);
      });

      it('should confirm on delete', function () {
        var spy = sinon.spy(window, 'confirm');
        TestUtils.Simulate.click($(originTableEl.getDOMNode()).find('.fonticon-trash')[0]);
        assert.ok(spy.calledOnce);
      });

      it('should deleteOrigin on confirm true', function () {
        var stub = sinon.stub(window, 'confirm');
        stub.returns(true);
        TestUtils.Simulate.click($(originTableEl.getDOMNode()).find('.fonticon-trash')[0]);
        assert.ok(deleteOrigin.calledWith(origin));
      });

      it('should not deleteOrigin on confirm false', function () {
        var stub = sinon.stub(window, 'confirm');
        stub.returns(false);
        TestUtils.Simulate.click($(originTableEl.getDOMNode()).find('.fonticon-trash')[0]);
        assert.notOk(deleteOrigin.calledOnce);
      });

      it('should change origin to input on edit click', function () {
        TestUtils.Simulate.click($(originTableEl.getDOMNode()).find('.fonticon-pencil')[0]);
        assert.ok($(originTableEl.getDOMNode()).find('input').length === 1);
      });

      it('should update origin on update clicked', function () {
        var updatedOrigin = 'https://updated-origin.com';
        TestUtils.Simulate.click($(originTableEl.getDOMNode()).find('.fonticon-pencil')[0]);
        TestUtils.Simulate.change($(originTableEl.getDOMNode()).find('input')[0], {
          target: {
            value: updatedOrigin
          }
        });
        TestUtils.Simulate.click($(originTableEl.getDOMNode()).find('.btn')[0]);
        assert.ok(updateOrigin.calledWith(updatedOrigin));
      });

      it('should not update origin on update clicked with bad origin', function () {
        var updatedOrigin = 'updated-origin';
        TestUtils.Simulate.click($(originTableEl.getDOMNode()).find('.fonticon-pencil')[0]);
        TestUtils.Simulate.change($(originTableEl.getDOMNode()).find('input')[0], {
          target: {
            value: updatedOrigin
          }
        });
        TestUtils.Simulate.click($(originTableEl.getDOMNode()).find('.btn')[0]);
        assert.notOk(updateOrigin.calledOnce);
      });

    });

  });

});
