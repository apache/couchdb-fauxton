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

define([], function () {

  /**
   * This module provides a location to store arbitrary data that's available between page loads. It's stored or as
   * long as the JS is in memory (i.e. until their click away from the site or refresh the page). This can be replace
   * local storage for more session-based transient info or for storing results of API requests that are unlikely
   * to change.
   */
  var memory = {};

  var get = function (key) {
    return memory[key];
  };

  var set = function (key, value) {
    memory[key] = value;
  };

  var has = function (key) {
    return _.has(memory, key);
  };

  var clear = function (key) {
    delete memory[key];
  };

  return {
    get: get,
    set: set,
    has: has,
    clear: clear
  };

});
