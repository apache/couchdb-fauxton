import FauxtonJwt from "../fauxtonjwt";
import Helpers from "../../../helpers";
import sinon, {stub} from "sinon";
import utils from "../../../../test/mocha/testUtils";

const {restore} = utils;

describe('FauxtonJwt Module', () => {
  let deleteCookieStub, getCookieStub;

  beforeEach(() => {
    deleteCookieStub = stub(Helpers, "deleteCookie");
    getCookieStub = stub(Helpers, "getCookie");
  });

  afterEach(() => {
    restore(deleteCookieStub);
    restore(getCookieStub);
  });

  describe('jwtStillValid', () => {
    it('returns false if token is null', () => {
      expect(FauxtonJwt.jwtStillValid(null)).toBe(false);
    });

    it('returns false if token cannot be decoded', () => {
      const invalidToken = "invalid.token";
      expect(FauxtonJwt.jwtStillValid(invalidToken)).toBe(false);
    });

    it('returns true if token is not expired', () => {
      const validToken = btoa(JSON.stringify({exp: Math.floor(Date.now() / 1000) + 3600}));
      const token = `header.${validToken}.signature`;
      expect(FauxtonJwt.jwtStillValid(token)).toBe(true);
    });

    it('returns false if token is expired', () => {
      const expiredToken = btoa(JSON.stringify({exp: Math.floor(Date.now() / 1000) - 3600}));
      const token = `header.${expiredToken}.signature`;
      expect(FauxtonJwt.jwtStillValid(token)).toBe(false);
    });
  });

  describe('decodeToken', () => {
    it('returns null for invalid token', () => {
      const invalidToken = "invalid.token";
      expect(FauxtonJwt.decodeToken(invalidToken)).toBeNull();
    });

    it('returns decoded payload for valid token', () => {
      const payload = {exp: 12345};
      const validToken = `header.${btoa(JSON.stringify(payload))}.signature`;
      expect(FauxtonJwt.decodeToken(validToken)).toEqual(payload);
    });
  });

  describe('getExpiry', () => {
    it('returns 0 if token cannot be decoded', () => {
      const invalidToken = "invalid.token";
      expect(FauxtonJwt.getExpiry(invalidToken)).toBe(0);
    });

    it('returns the exp value from a valid token', () => {
      const payload = {exp: 12345};
      const validToken = `header.${btoa(JSON.stringify(payload))}.signature`;
      expect(FauxtonJwt.getExpiry(validToken)).toBe(12345);
    });
  });


  describe('setJwtCookie', () => {

    beforeEach(() => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        value: ""
      });
    });

    it('sets the JWT cookie', () => {
      const token = "test-token";
      FauxtonJwt.setJwtCookie(token);
      expect(document.cookie).toContain(`${FauxtonJwt.cookieName}=${token}`);
    });
  });

  describe('deleteJwtCookie', () => {
    it('calls Helpers.deleteCookie with the correct cookie name', () => {
      FauxtonJwt.deleteJwtCookie();
      expect(deleteCookieStub.calledWith(FauxtonJwt.cookieName)).toBe(true);
    });
  });

  describe('addAuthToken', () => {
    it('adds Authorization header if token is valid', () => {
      const token = `header.${btoa(JSON.stringify({exp: Math.floor(Date.now() / 1000) + 3600}))}.signature`;
      getCookieStub.returns(token);

      const fetchOptions = {headers: {}};
      const result = FauxtonJwt.addAuthToken(fetchOptions);

      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('deletes cookie if token is invalid', () => {
      const token = "invalid.token";
      getCookieStub.returns(token);

      const fetchOptions = {headers: {}};
      FauxtonJwt.addAuthToken(fetchOptions);

      expect(deleteCookieStub.calledWith(FauxtonJwt.cookieName)).toBe(true);
    });
  });

  describe('addAuthHeader', () => {
    it('sets Authorization header on the HTTP request if token is valid', () => {
      const token = `header.${btoa(JSON.stringify({exp: Math.floor(Date.now() / 1000) + 3600}))}.signature`;
      getCookieStub.returns(token);

      const httpRequest = {
        setRequestHeader: sinon.stub()
      };
      FauxtonJwt.addAuthHeader(httpRequest);

      expect(httpRequest.setRequestHeader.calledWith('Authorization', `Bearer ${token}`)).toBe(true);
    });
  });
});
