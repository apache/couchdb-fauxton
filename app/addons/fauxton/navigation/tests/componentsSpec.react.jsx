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
  'addons/fauxton/navigation/components.react',
  'addons/fauxton/navigation/actions',
  'core/auth',
  'addons/auth/base',
  'testUtils',
  "react"
], function (FauxtonAPI, Views, Actions, Auth, BaseAuth, utils, React) {

  var assert = utils.assert;
  var TestUtils = React.addons.TestUtils;

  describe('NavBar', function () {

    describe('burger', function () {
      var container, burgerEl, toggleMenu;

      beforeEach(function () {
        toggleMenu = sinon.spy();
        container = document.createElement('div');
        burgerEl = TestUtils.renderIntoDocument(<Views.Burger toggleMenu={toggleMenu} />, container);
      });

      afterEach(function () {
        React.unmountComponentAtNode(container);
      });

      it('dispatch TOGGLE_NAVBAR_MENU on click', function () {
        TestUtils.Simulate.click(burgerEl.getDOMNode());
        assert.ok(toggleMenu.calledOnce);
      });

    });

    it('logout link only ever appears once', function () {
      FauxtonAPI.auth = new Auth();
      sinon.stub(FauxtonAPI.session, 'isLoggedIn').returns(true);
      sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(false);
      sinon.stub(FauxtonAPI.session, 'user').returns({ name: 'test-user' });
      BaseAuth.initialize();

      var container = document.createElement('div');
      var el = TestUtils.renderIntoDocument(<Views.NavBar />, container);

      FauxtonAPI.session.trigger('change');

      // confirm the logout link is present
      var matches = React.findDOMNode(el).outerHTML.match(/Logout/);
      assert.equal(matches.length, 1);

      // now confirm there's still only a single logout link after publishing multiple
      FauxtonAPI.session.trigger('change');
      FauxtonAPI.session.trigger('change');
      matches = React.findDOMNode(el).outerHTML.match(/Logout/);
      assert.equal(matches.length, 1);

      FauxtonAPI.session.isLoggedIn.restore();
      FauxtonAPI.session.user.restore();
      FauxtonAPI.session.isAdminParty.restore();
    });

    describe('CSRF info', function () {
      var container, el, server;

      beforeEach(function () {
        server = sinon.fakeServer.create();
        container = document.createElement('div');
        el = TestUtils.renderIntoDocument(<Views.NavBar />, container);
      });

      afterEach(function () {
        utils.restore(server);
        React.unmountComponentAtNode(container);
      });

      it('hides the info if header is not set in ajax calls', function (done) {
        server.respondWith('GET', 'http://example.com/_cluster_setup',
          [200, { 'Content-Type': 'application/json' },
            '[{ "id": 12, "comment": "yow sprunkmän und uschi" }]']);

        var promise = $.get('http://example.com/_cluster_setup');
        server.respond();
        promise.then(function () {
          el = TestUtils.renderIntoDocument(<Views.NavBar />, container);
          var $el = $(el.getDOMNode());
          assert.equal($el.find('.nav-status-area').length, 0);
          done();
        });
      });

      it('shows the info if header is set in ajax calls', function (done) {
        server.respondWith('GET', 'http://example.com/_cluster_setup',
          [200, { 'Content-Type': 'application/json', 'x-couchdb-csrf-valid': 'true' },
            '[{ "id": 12, "comment": "yow sprunkmän und uschi" }]']);

        var promise = $.get('http://example.com/_cluster_setup');
        server.respond();
        promise.then(function () {
          var $el = $(el.getDOMNode());
          assert.equal($el.find('.nav-status-area').length, 1);
          done();
        });
      });

    });
  });

});

