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
import Base from "../base";
import Auth from "../../../core/auth";
import testUtils from "../../../../test/mocha/testUtils";
import sinon from "sinon";
var assert = testUtils.assert;

var fetchMock = require("fetch-mock");

describe("auth session change", function() {
  afterEach(function() {
    FauxtonAPI.session.getUserFromSession.restore && FauxtonAPI.session.getUserFromSession.restore();
    FauxtonAPI.updateHeaderLink.restore &&
      FauxtonAPI.updateHeaderLink.restore();
    FauxtonAPI.session.isAdminParty.restore &&
      FauxtonAPI.session.isAdminParty.restore();
  });

  it("for admin party changes title to admin party", function() {
    var spy = sinon.spy(FauxtonAPI, "updateHeaderLink");
    // fetchMock.get("*", {userCtx: {name: "hello"}});
    // var userStub = sinon.stub(FauxtonAPI.session, 'getUserFromSession').returns(Promise.resolve({ name: "" }));
    // var stub = sinon.stub(FauxtonAPI.session, "isAdminParty").returns(true);
    FauxtonAPI.session.trigger("change");
    // debugger;
    // assert.ok(sp/y.calledOnce);
    var args = spy.getCall(0).args[0];

    assert.ok(args.title.match(/Admin Party/));
    FauxtonAPI.session.isAdminParty.restore();
  });

  it("for login changes title to login", function() {
    var spy = sinon.spy(FauxtonAPI, "updateHeaderLink");
    // var userStub = sinon
    //   .stub(FauxtonAPI.session, "getUserFromSession")
    //   .returns(Promise.resolve({ name: "test-user" }));
    var stub = sinon.stub(FauxtonAPI.session, "isAdminParty").returns(false);
    sinon.stub(FauxtonAPI.session, "user").returns({ name: "test-user" });
    sinon.stub(FauxtonAPI.session, "isLoggedIn").returns(true);
    FauxtonAPI.session.trigger("change");

    assert.ok(spy.calledOnce);
    var args = spy.getCall(0).args[0];

    assert.equal(args.title, "test-user");
    FauxtonAPI.session.isLoggedIn.restore();
    FauxtonAPI.session.user.restore();
    FauxtonAPI.session.isAdminParty.restore();
  });

  it("for login adds logout link", function() {
    var spy = sinon.spy(FauxtonAPI, "addHeaderLink");
    var stub = sinon.stub(FauxtonAPI.session, "isAdminParty").returns(false);
    sinon.stub(FauxtonAPI.session, "user").returns({ name: "test-user" });
    sinon.stub(FauxtonAPI.session, "isLoggedIn").returns(true);
    FauxtonAPI.session.trigger("change");

    assert.ok(spy.calledOnce);
    var args = spy.getCall(0).args[0];

    assert.equal(args.title, "Logout");
    FauxtonAPI.session.isLoggedIn.restore();
    FauxtonAPI.session.user.restore();
    FauxtonAPI.session.isAdminParty.restore();
  });

  it("for logout, removes logout link", function() {
    var spy = sinon.spy(FauxtonAPI, "removeHeaderLink");
    var stub = sinon.stub(FauxtonAPI.session, "isAdminParty").returns(false);
    sinon.stub(FauxtonAPI.session, "isLoggedIn").returns(false);
    FauxtonAPI.session.trigger("change");

    assert.ok(spy.calledOnce);
    var args = spy.getCall(0).args[0];

    assert.equal(args.id, "logout");
    FauxtonAPI.session.isLoggedIn.restore();
    FauxtonAPI.session.isAdminParty.restore();
  });
});
