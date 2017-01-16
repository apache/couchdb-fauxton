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

// Can be used in redux middleware
function getUserFromSession() {
    return FauxtonAPI
      .json('/_session')
      .then(({userCtx}) => userCtx);
}

export default ({
  Session: FauxtonAPI.Model.extend({
    user() {
      var userCtx = this.get('userCtx');
      if (!userCtx || !userCtx.name) { return null; }

      return {
        name: userCtx.name,
        roles: userCtx.roles,
        isAdmin: userCtx.roles.includes('_admin')
      };
    },

    fetchUser() {
      let currentUser = this.user();
      return getUserFromSession()
         .then((userCtx) => this.set('userCtx', userCtx))
         .then(this.user.bind(this))
         .then((user) => {
            if (currentUser !== user) {
              this.trigger('session:userChanged');
            } else {
              this.trigger('session:userFetched');
            }
            return user;
         }, this.triggerError.bind(this));
    },
    triggerError(xhr, type, message) {
      this.trigger('session:error', xhr, type, message);
    }
  })
});


