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
      'addons/auth/base',
      'core/auth',
      'testUtils'
], function (FauxtonAPI, Base, Auth, testUtils) {
  var assert = testUtils.assert;
  var expect = testUtils.chai.expect;


  describe("Auth: Login", function () {

    describe("failed login", function () {

      it("redirects with replace: true set", function () {
        var navigateSpy = sinon.spy(FauxtonAPI, 'navigate');
        FauxtonAPI.auth = new Auth();
        FauxtonAPI.session.isLoggedIn = function () { return false; };
        Base.initialize();
        FauxtonAPI.auth.authDeniedCb();
        assert.ok(navigateSpy.withArgs('/login?urlback=', {replace: true}).calledOnce);
      });
    });
  });

  describe('auth session change', function () {

    afterEach(function () {
      FauxtonAPI.updateHeaderLink.restore && FauxtonAPI.updateHeaderLink.restore();
    });

    it('for admin party changes title to admin party', function () {
      var spy = sinon.spy(FauxtonAPI, 'updateHeaderLink');
      var stub = sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(true);
      FauxtonAPI.session.trigger('change');

      expect(spy.calledOnce).to.be.true;
      var args = spy.getCall(0).args[0];

      expect(args.title).to.match(/Admin Party/);
      FauxtonAPI.session.isAdminParty.restore();
    });

    it('for login changes title to login', function () {
      var spy = sinon.spy(FauxtonAPI, 'updateHeaderLink');
      var stub = sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(false);
      sinon.stub(FauxtonAPI.session, 'user').returns({name: 'test-user'});
      sinon.stub(FauxtonAPI.session, 'isLoggedIn').returns(true);
      FauxtonAPI.session.trigger('change');

      expect(spy.calledOnce).to.be.true;
      var args = spy.getCall(0).args[0];

      expect(args.title).to.equal('test-user');
      FauxtonAPI.session.isLoggedIn.restore();
      FauxtonAPI.session.user.restore();
      FauxtonAPI.session.isAdminParty.restore();
    });

    it('for login adds logout link', function () {
      var spy = sinon.spy(FauxtonAPI, 'addHeaderLink');
      var stub = sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(false);
      sinon.stub(FauxtonAPI.session, 'user').returns({name: 'test-user'});
      sinon.stub(FauxtonAPI.session, 'isLoggedIn').returns(true);
      FauxtonAPI.session.trigger('change');

      expect(spy.calledOnce).to.be.true;
      var args = spy.getCall(0).args[0];

      expect(args.title).to.equal('Logout');
      FauxtonAPI.session.isLoggedIn.restore();
      FauxtonAPI.session.user.restore();
      FauxtonAPI.session.isAdminParty.restore();
    });

    it('for logout, removes logout link', function () {
      var spy = sinon.spy(FauxtonAPI, 'removeHeaderLink');
      var stub = sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(false);
      sinon.stub(FauxtonAPI.session, 'isLoggedIn').returns(false);
      FauxtonAPI.session.trigger('change');

      expect(spy.calledOnce).to.be.true;
      var args = spy.getCall(0).args[0];

      expect(args.id).to.equal('logout');
      FauxtonAPI.session.isLoggedIn.restore();
      FauxtonAPI.session.isAdminParty.restore();
    });


  });
});
