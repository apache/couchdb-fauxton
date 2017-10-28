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

import app from './app';
import React from 'react';
import ReactDOM from 'react-dom';
import FauxtonAPI from './core/api';
import LoadAddons from './load_addons';
import Backbone from 'backbone';
import $ from 'jquery';
import AppWrapper from './addons/fauxton/appwrapper';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

FauxtonAPI.addMiddleware(thunk);
const store = createStore(
  combineReducers(FauxtonAPI.reducers),
  applyMiddleware(...FauxtonAPI.middlewares)
);

app.addons = LoadAddons;
FauxtonAPI.router = app.router = new FauxtonAPI.Router(app.addons);
// Trigger the initial route and enable HTML5 History API support, set the
// root folder to '/' by default.  Change in app.js.
Backbone.history.start({ pushState: false, root: app.root });

// feature detect IE
if ('ActiveXObject' in window) {
  $.ajaxSetup({ cache: false });
}

// All navigation that is relative should be passed through the navigate
// method, to be processed by the router. If the link has a `data-bypass`
// attribute, bypass the delegation completely.
$(document).on("click", "a:not([data-bypass])", function (evt) {

  // Get the absolute anchor href.
  var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };

  // Get the absolute root
  var root = location.protocol + "//" + location.host;

  // Ensure the root is part of the anchor href, meaning it's relative
  if (href.prop && href.prop.slice(0, root.length) === root) {
    // Stop the default event to ensure the link will not cause a page
    // refresh.
    evt.preventDefault();

    //User app navigate so that navigate goes through a central place
    app.router.navigate(href.attr, true);
  }
});

ReactDOM.render(
  <Provider store={store}>
    <AppWrapper router={app.router}/>
  </Provider>,
  document.getElementById('app')
);
