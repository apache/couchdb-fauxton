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
        'addons/documents/views-changes',
        'addons/databases/base',
        'testUtils'
], function (Views, Databases, testUtils) {
  var assert = testUtils.assert,
      ViewSandbox = testUtils.ViewSandbox,
      viewSandbox;

  describe('Documents Changes', function () {
    var model = new Databases.Model({id: 'foo'}),
        filteredView,
        view,
        handlerSpy;

    model.buildChanges();

    handlerSpy = sinon.spy(Views.Changes.prototype, 'toggleJson');

    beforeEach(function (done) {
      var database = new Databases.Model({id: 'bla'});
      database.buildChanges({descending: 'true', limit: '100', include_docs: 'true'} );
      filteredView = new Views.Changes({
        model: database
      });

      view = new Views.Changes({
        model: model,
        useRAF: false
      });
      viewSandbox = new ViewSandbox();
      viewSandbox.renderView(view, done);
    });

    afterEach(function () {
      viewSandbox.remove();
    });

    it('filter false in case of deleted documents in the changes feed', function () {
      filteredView.filters = [false];
      var res = filteredView.createFilteredData([
        {id: 'LALA', bar: 'ENTE'},
        {id: '1', bar: '1', deleted: true},
        {id: '2', bar: '2'}
      ]);

      assert.equal(res.length, 2);
    });

    it('the toggle-json button calls a handler', function () {
      view.$('.js-toggle-json').trigger('click');
      assert.ok(handlerSpy.calledOnce);
    });

    it('rerenders on the sync event', function () {
      var spy = sinon.spy(view, 'afterRender');
      model.changes.trigger('sync');
      view.afterRender.restore();
      assert.ok(spy.calledOnce);
    });

    it('rerenders on the cachesync event', function () {
      var spy = sinon.spy(view, 'afterRender');
      model.changes.trigger('cachesync');
      assert.ok(spy.calledOnce);
      view.afterRender.restore();
    });
  });
});
