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
import FauxtonAPI from "../../../core/api";
import Auth from "../../../core/auth";
import Base from "../base";
import sinon from "sinon";


describe("Auth", function () {
  FauxtonAPI.auth = new Auth();
  Base.initialize();

  describe("failed login", function () {

    it("redirects with replace: true set", function () {
      const navigateSpy = sinon.spy(FauxtonAPI, 'navigate');
      FauxtonAPI.router.trigger = () => {};
      FauxtonAPI.session.isLoggedIn = function () { return false; };
      FauxtonAPI.auth.authDeniedCb();
      expect(navigateSpy.withArgs('/login?urlback=', {replace: true}).calledOnce).toBeTruthy();
      FauxtonAPI.navigate.restore();
    });
  });

  describe('auth session change', function () {

    afterEach(function () {
      FauxtonAPI.addHeaderLink.restore && FauxtonAPI.addHeaderLink.restore();
      FauxtonAPI.session.isLoggedIn.restore && FauxtonAPI.session.isLoggedIn.restore();
      FauxtonAPI.session.isAdminParty.restore();
    });

    it('for admin party changes title to admin party', function () {
      const spy = sinon.spy(FauxtonAPI, 'addHeaderLink');
      sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(true);
      FauxtonAPI.session.trigger('change');

      expect(spy.calledOnce).toBeTruthy();
      const args = spy.getCall(0).args[0];
      expect(args.title).toMatch("Admin Party!");
    });

    it('for login changes title to Your Account', function () {
      var spy = sinon.spy(FauxtonAPI, 'addHeaderLink');
      sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(false);
      sinon.stub(FauxtonAPI.session, 'isLoggedIn').returns(true);
      FauxtonAPI.session.trigger('change');

      expect(spy.calledOnce).toBeTruthy();
      var args = spy.getCall(0).args[0];
      expect(args.title).toMatch("Your Account");
    });

    it('for login adds logout link', function () {
      var spy = sinon.spy(FauxtonAPI, 'showLogout');
      sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(false);
      sinon.stub(FauxtonAPI.session, 'isLoggedIn').returns(true);
      FauxtonAPI.session.trigger('change');

      expect(spy.calledOnce).toBeTruthy();
      FauxtonAPI.showLogout.restore();
    });

    it('for logout, removes logout link', function () {
      var spy = sinon.spy(FauxtonAPI, 'showLogin');
      sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(false);
      sinon.stub(FauxtonAPI.session, 'isLoggedIn').returns(false);
      FauxtonAPI.session.trigger('change');

      expect(spy.calledOnce).toBeTruthy();
      FauxtonAPI.showLogin.restore();
    });
  });
});
