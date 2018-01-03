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


// This file creates a set of helper functions that will be loaded for all html
// templates. These functions should be self contained and not rely on any
// external dependencies as they are loaded prior to the application. We may
// want to change this later, but for now this should be thought of as a
// "purely functional" helper system.


import _ from 'lodash';
import param from 'jquery-param-fn';

const utils = {

  // Thanks to: http://stackoverflow.com/a/2880929
  getParams: function (queryString) {
    if (queryString) {
      // I think this could be combined into one if
      if (queryString.substring(0, 1) === '?') {
        queryString = queryString.substring(1);
      } else if (queryString.indexOf('?') > -1) {
        queryString = queryString.split('?')[1];
      }
    }
    const hash = window.location.hash.split('?')[1];
    queryString = queryString || hash || window.location.search.substring(1);
    const urlParams = {},
          pl = /\+/g,  // Regex for replacing addition symbol with a space
          search = /([^&=]+)=?([^&]*)/g,
          decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); },
          query = queryString;

    if (queryString) {
      let match;
      while ((match = search.exec(query))) {
        urlParams[decode(match[1])] = decode(match[2]);
      }
    }

    return urlParams;
  },

  removeSpecialCharacters: function (name) {
    return name.replace(/[^\w\s]/gi, '');
  },

  safeURLName: function (name = '') {
    // These special caracters are allowed by couch: _, $, (, ), +, -, and /
    // From them only $ + and / are to be escaped in a URI component.
    // return (/[$+/]/g.test(name)) ? encodeURIComponent(name) : name;
    return encodeURIComponent(name);
  },

  queryParams: function (obj) {
    //Simulates jQuery.param()
    return param(obj);
  },

  queryString: function (obj) {
    //Similar to queryParams() but skips object properties
    //that are undefined
    Object.keys(obj).forEach((key) => {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    });
    return param(obj);
  },

  getDocTypeFromId: function (id) {
    if (id && /^_design\//.test(id)) {
      return 'design doc';
    }

    return 'doc';
  },

  isSystemDatabase: function (id) {
    return (/^_/).test(id);
  },

  // Need this to work around backbone router thinking _design/foo
  // is a separate route. Alternatively, maybe these should be
  // treated separately. For instance, we could default into the
  // json editor for docs, or into a ddoc specific page.
  getSafeIdForDoc: function (id) {
    if (utils.getDocTypeFromId(id) === 'design doc') {
      const ddoc = id.replace(/^_design\//, '');
      return '_design/' + utils.safeURLName(ddoc);
    }

    return utils.safeURLName(id);
  },

  // a pair of simple local storage wrapper functions. These ward against problems getting or
  // setting (e.g. local storage full) and allow you to get/set complex data structures
  localStorageSet: function (key, value) {
    if (_.isObject(value) || _.isArray(value)) {
      value = JSON.stringify(value);
    }
    let success = true;
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      success = false;
    }
    return success;
  },

  localStorageGet: function (key) {
    let data;
    if (_.has(window.localStorage, key)) {
      data = window.localStorage[key];
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    return data;
  },

  stripHTML: function (str) {

    if (!document) {
      //not in browser, this should be ignored when testing in jest
      return str;
    }

    const tmpElement = document.createElement('div');
    tmpElement.innerHTML = str;
    return tmpElement.textContent || tmpElement.innerText;
  }
};

export default utils;
