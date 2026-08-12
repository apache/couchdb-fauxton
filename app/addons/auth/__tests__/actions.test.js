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
import FauxtonJwt from "../fauxtonjwt";
import Api from '../api';
import {loginJwt, login} from "../actions";
import utils from "../../../../test/mocha/testUtils";
import sinon, {stub} from "sinon";

const {restore} = utils;

describe('Auth -- Actions', () => {

  describe('loginJwt', () => {

    const authenticatedResponse = {
      "ok": true,
      "userCtx": {
        "name": "tester",
        "roles": [
          "manage-account",
          "view-profile",
          "_admin"
        ]
      },
      "info": {
        "authentication_handlers": [
          "cookie",
          "jwt",
          "default"
        ],
        "authenticated": "jwt"
      }
    };

    const jwtNotSetupResponse = {
      "ok": true,
      "userCtx": {
        "name": null,
        "roles": []
      },
      "info": {
        "authentication_handlers": [
          "cookie",
          "default",
        ]
      }
    };

    const unathenticatedResponse = {
      "ok": true,
      "userCtx": {
        "name": null,
        "roles": []
      },
      "info": {
        "authentication_handlers": [
          "cookie",
          "default",
          "jwt"
        ]
      }
    };

    let loginStub;
    let loginJwtStub;
    let deleteJwtCookieStub;
    let addNotificationStub;
    let navigateStub;

    beforeEach(() => {
      loginJwtStub = stub(Api, "loginJwt");
      loginStub = stub(Api, "login");
      deleteJwtCookieStub = stub(FauxtonJwt, "deleteJwtCookie");
      addNotificationStub = stub(FauxtonAPI, "addNotification");
      navigateStub = stub(FauxtonAPI, "navigate");
    });

    afterEach(() => {
      restore(loginJwtStub);
      restore(loginStub);
      restore(addNotificationStub);
      restore(deleteJwtCookieStub);
      restore(navigateStub);
    });

    it('loginJwt logs in if userCtx present', async () => {
      loginJwtStub.returns(Promise.resolve(authenticatedResponse));

      const mockToken = "mockToken";

      await loginJwt(mockToken);

      expect(loginJwtStub.calledOnce).toBeTruthy();
      expect(loginStub.notCalled).toBeTruthy();
      expect(addNotificationStub.calledOnce).toBeTruthy();
      expect(navigateStub.calledOnce).toBeTruthy();
      sinon.assert.calledWithExactly(
        navigateStub,
        '/');
    });

    it('loginJwt is not called if token is empty', async () => {
      loginJwtStub.returns(Promise.resolve(authenticatedResponse));

      const mockToken = "";

      await loginJwt(mockToken);

      expect(loginJwtStub.notCalled).toBeTruthy();
      expect(loginStub.notCalled).toBeTruthy();
      expect(addNotificationStub.calledOnce).toBeTruthy();
      expect(navigateStub.notCalled).toBeTruthy();
    });

    it('loginJwt does not navigate if jwt auth is not enabled', async () => {
      loginJwtStub.returns(Promise.resolve(jwtNotSetupResponse));

      const mockToken = "mockToken";

      await loginJwt(mockToken);

      expect(loginJwtStub.calledOnce).toBeTruthy();
      expect(loginStub.notCalled).toBeTruthy();
      expect(deleteJwtCookieStub.calledOnce).toBeTruthy();
      expect(addNotificationStub.calledOnce).toBeTruthy();
      expect(navigateStub.notCalled).toBeTruthy();
    });

    it('loginJwt does not navigate if jwt auth is not successful', async () => {
      loginJwtStub.returns(Promise.resolve(unathenticatedResponse));

      const mockToken = "mockToken";

      await loginJwt(mockToken);

      expect(loginJwtStub.calledOnce).toBeTruthy();
      expect(loginStub.notCalled).toBeTruthy();
      expect(deleteJwtCookieStub.calledOnce).toBeTruthy();
      expect(addNotificationStub.calledOnce).toBeTruthy();
      expect(navigateStub.notCalled).toBeTruthy();
    });
  });

  describe('login', () => {

    const authenticatedResponse = {
      "ok": true,
      "userCtx": {
        "name": "tester",
        "roles": [
          "_admin"
        ]
      },
      "info": {
        "authentication_handlers": [
          "cookie",
          "default"
        ],
        "authenticated": "cookie"
      }
    };

    let loginStub;
    let loginJwtStub;
    let addNotificationStub;
    let navigateStub;

    beforeEach(() => {
      loginJwtStub = stub(Api, "loginJwt");
      loginStub = stub(Api, "login");
      addNotificationStub = stub(FauxtonAPI, "addNotification");
      navigateStub = stub(FauxtonAPI, "navigate");
    });

    afterEach(() => {
      restore(loginJwtStub);
      restore(loginStub);
      restore(addNotificationStub);
      restore(navigateStub);
    });

    it('login logs in if there is no error', async () => {
      loginStub.returns(Promise.resolve(authenticatedResponse));

      const mockUser = "mockUser";
      const mockPassword = "mockPassword";

      await login(mockUser, mockPassword);

      expect(loginJwtStub.notCalled).toBeTruthy();
      expect(loginStub.calledOnce).toBeTruthy();
      expect(addNotificationStub.calledOnce).toBeTruthy();
      expect(navigateStub.calledOnce).toBeTruthy();
      sinon.assert.calledWithExactly(
        navigateStub,
        '/');
    });

    it('login does not log in if username is blank', async () => {
      loginStub.returns(Promise.resolve(authenticatedResponse));

      const mockUser = "";
      const mockPassword = "mockPassword";

      await login(mockUser, mockPassword);

      expect(loginJwtStub.notCalled).toBeTruthy();
      expect(loginStub.notCalled).toBeTruthy();
      expect(addNotificationStub.calledOnce).toBeTruthy();
      expect(navigateStub.notCalled).toBeTruthy();
    });

    it('login does not log in if password is blank', async () => {
      loginStub.returns(Promise.resolve(authenticatedResponse));

      const mockUser = "mockUser";
      const mockPassword = "";

      await login(mockUser, mockPassword);

      expect(loginJwtStub.notCalled).toBeTruthy();
      expect(loginStub.notCalled).toBeTruthy();
      expect(addNotificationStub.calledOnce).toBeTruthy();
      expect(navigateStub.notCalled).toBeTruthy();
    });
  });
});
