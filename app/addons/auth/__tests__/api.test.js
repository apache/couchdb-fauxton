import FauxtonJwt from "../fauxtonjwt";
import Helpers from "../../../helpers";
import utils from "../../../../test/mocha/testUtils";
import sinon, {stub} from "sinon";
import {loginJwt, logout} from "../api";
import * as ajax from "../../../core/ajax";

const {restore} = utils;

jest.mock("../../../core/ajax");

describe('Api -- Actions', () => {

  const sessionUrl = "http://testurl/_session";

  describe('loginJwt', () => {

    let setJwtCookieStub;
    let deleteJwtCookieStub;
    let getServerUrlStub;

    beforeEach(() => {
      setJwtCookieStub = stub(FauxtonJwt, "setJwtCookie");
      deleteJwtCookieStub = stub(FauxtonJwt, "deleteJwtCookie");
      getServerUrlStub = stub(Helpers, "getServerUrl");
      ajax.get.mockReturnValue(Promise.resolve({}));
      ajax.deleteFormEncoded.mockReturnValue(Promise.resolve({}));
    });

    afterEach(() => {
      restore(setJwtCookieStub);
      restore(deleteJwtCookieStub);
      restore(getServerUrlStub);
    });

    it('loginJwt sets jwt auth as token and calls _session endpoint using global get method', async () => {
      const mockToken = "mockToken";
      getServerUrlStub.returns(sessionUrl);
      await loginJwt(mockToken);
      expect(setJwtCookieStub.calledOnce).toBeTruthy();
      expect(getServerUrlStub.calledOnce).toBeTruthy();
      sinon.assert.calledWithExactly(
        setJwtCookieStub,
        mockToken);
      sinon.assert.calledWithExactly(
        getServerUrlStub,
        '/_session');
    });


    it('logout deletes cookie from browser and calls global delete _session endpoint', async () => {
      getServerUrlStub.returns(sessionUrl);
      await logout();
      expect(deleteJwtCookieStub.calledOnce).toBeTruthy();
      expect(getServerUrlStub.calledOnce).toBeTruthy();
      sinon.assert.calledWithExactly(
        getServerUrlStub,
        '/_session');
    });
  });
});
