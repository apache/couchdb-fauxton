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

import FauxtonAPI from "./base";

function authenticate(session, roles) {
  if (session.isAdminParty()) {
    return true;//resolve(); session.trigger('authenticated');
  } else if (session.matchesRoles(roles)) {
    return session.trigger('authenticated');
  } else {
    throw new Error('Unable to authentacte');
  }
}

function authenticatoinDenied() {
  let url = window.location.hash
    .replace('#', '')
    .replace('login?urlback=', '');

  FauxtonAPI.navigate(`/login?urlback=${url}`, { replace: true });
};

export default class {
  checkAccess(roles = []) {
    return FauxtonAPI.session
      .fetchUser()
      .then(() => authenticate(FauxtonAPI.session, roles))
      .catch(authenticatoinDenied);
  }
}
