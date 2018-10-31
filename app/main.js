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
FauxtonAPI.reduxDispatch = (action) => {
  store.dispatch(action);
};
FauxtonAPI.reduxState = () => {
  return store.getState();
};

app.addons = LoadAddons;
FauxtonAPI.router = app.router = new FauxtonAPI.Router(app.addons);
// Trigger the initial route and enable HTML5 History API support, set the
// root folder to '/' by default.  Change in app.js.
Backbone.history.start({ pushState: false, root: app.root });

// feature detect IE
if ('ActiveXObject' in window) {
  $.ajaxSetup({ cache: false });
}

// Walks up the element tree to look for a link to see if it is part
// of the click nodes
const findLink = (target) => {
  if (!target) {
    return null;
  }

  if (target.tagName === 'A') {
    return target;
  }
  return findLink(target.parentNode);
};
// All navigation that is relative should be passed through the navigate
// method, to be processed by the router. If the link has a `data-bypass`
// attribute, bypass the delegation completely.
document.addEventListener("click", evt => {

  const target = findLink(evt.target);
  if (!target) {
    return;
  }
  //"a:not([data-bypass])"
  const dataBypass = target.getAttribute('data-bypass');
  if (dataBypass) {
    return;
  }

  // Get the absolute anchor href.
  const href = { prop: target.href, attr: target.getAttribute("href") };
  if (!href.prop) {
    return;
  }

  // Get the absolute root
  const root = location.protocol + "//" + location.host;

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
