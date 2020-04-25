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
import "jquery";
import app from "./initialize";
import _ from "lodash";
import Helpers from "./helpers";
import Utils from "./core/utils";
import FauxtonAPI from "./core/api";
import 'react-toastify/dist/ReactToastify.min.css';
import "../assets/less/fauxton.less";

// Make sure we have a console.log
if (_.isUndefined(console)) {
  console = {
    log: function () {},
    trace: function () {},
    debug: function () {}
  };
}

// Provide a global location to place configuration settings and module
// creation also mix in Backbone.Events
Object.assign(app, {
  utils: Utils,
  getParams: FauxtonAPI.utils.getParams,
  helpers: Helpers
});

FauxtonAPI.config({
  // I haven't wrapped these dispatch methods in a action
  // because I don't want to require fauxton/actions in this method.
  addHeaderLink: function (link) {
    FauxtonAPI.reduxDispatch({
      type: 'ADD_NAVBAR_LINK',
      link: link
    });
  },

  updateHeaderLink: function (link) {
    FauxtonAPI.reduxDispatch({
      type: 'UPDATE_NAVBAR_LINK',
      link: link
    });
  },

  removeHeaderLink: function (link) {
    FauxtonAPI.reduxDispatch({
      type: 'REMOVE_NAVBAR_LINK',
      link: link
    });
  },

  hideLogin: function () {
    FauxtonAPI.reduxDispatch({
      type: 'NAVBAR_SHOW_HIDE_LOGIN_LOGOUT_SECTION',
      visible: false
    });
  },

  showLogout: function () {
    FauxtonAPI.reduxDispatch({
      type: 'NAVBAR_SHOW_LOGOUT_BUTTON'
    });
  },

  showLogin: function () {
    FauxtonAPI.reduxDispatch({
      type: 'NAVBAR_SHOW_LOGIN_BUTTON'
    });
  }
});

export default app;
