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
  "./base"
],
function (FauxtonAPI) {
  var CouchdbSession = {
    Session: FauxtonAPI.Model.extend({
      url: '/_session',

      user: function () {
        var userCtx = this.get('userCtx');

        if (!userCtx || !userCtx.name) { return null; }

        return {
          name: userCtx.name,
          roles: userCtx.roles
        };
      },

      isAdmin: function () {
        var userCtx = this.get('userCtx');
        return userCtx.roles.indexOf('_admin') !== -1;
      },

      fetchUser: function (opt) {
        var options = opt || {},
            currentUser = this.user(),
            fetch = _.bind(this.fetchOnce, this);

        if (options.forceFetch) {
          fetch = _.bind(this.fetch, this);
        }

        return fetch(opt).then(function () {
          var user = this.user();

          // Notify anyone listening on these events that either a user has changed
          // or current user is the same
          if (currentUser !== user) {
            this.trigger('session:userChanged');
          } else {
            this.trigger('session:userFetched');
          }

          // this will return the user as a value to all function that calls done on this
          // eg. session.fetchUser().done(user) { .. do something with user ..}
          return user;
        }.bind(this), function (session, xhr, type, message) {
          this.trigger('session:error', xhr, type, message);
        }.bind(this));
      }
    })
  };

  return CouchdbSession;
});
