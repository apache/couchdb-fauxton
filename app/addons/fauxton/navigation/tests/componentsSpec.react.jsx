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
import FauxtonAPI from "../../../../core/api";
import Burger from "../components/Burger";
import NavBar from "../components/NavBar";
import Actions from "../actions";
import Auth from "../../../../core/auth";
import BaseAuth from "../../../auth/base";
import utils from "../../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import TestUtils from "react-addons-test-utils";
import sinon from "sinon";
import {mount} from 'enzyme';

var assert = utils.assert;

describe('NavBar', function () {

  describe('burger', function () {
    it('dispatch TOGGLE_NAVBAR_MENU on click', function () {
      const toggleMenu = sinon.spy();
      const burgerEl = mount(<Burger toggleMenu={toggleMenu} />);
      burgerEl.simulate('click');
      assert.ok(toggleMenu.calledOnce);
    });

  });

  it('logout link only ever appears once', function () {
    FauxtonAPI.auth = new Auth();
    sinon.stub(FauxtonAPI.session, 'isLoggedIn').returns(true);
    sinon.stub(FauxtonAPI.session, 'isAdminParty').returns(false);
    sinon.stub(FauxtonAPI.session, 'user').returns({ name: 'test-user' });
    BaseAuth.initialize();

    const el = mount(<NavBar />);

    FauxtonAPI.session.trigger('change');

    // confirm the logout link is present
    let matches = el.text().match(/Logout/);
    assert.equal(matches.length, 1);

    // now confirm there's still only a single logout link after publishing multiple
    FauxtonAPI.session.trigger('change');
    FauxtonAPI.session.trigger('change');
    matches = el.text().match(/Logout/);
    assert.equal(matches.length, 1);

    FauxtonAPI.session.isLoggedIn.restore();
    FauxtonAPI.session.user.restore();
    FauxtonAPI.session.isAdminParty.restore();
  });
});
