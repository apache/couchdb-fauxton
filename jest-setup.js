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

require('jest');
require('whatwg-fetch');
require('mock-local-storage');

Object.defineProperty(window, 'localStorage', {
  value: global.localStorage,
  configurable:true,
  enumerable:true,
  writable:true
});

window.$ = window.jQuery = require('jquery');
window._ = require('lodash');
window.Backbone = require('backbone');

// URL.createObjectURL() and Worker are referenced by brace so we add mock objects to prevent
// long warning messages from being printed while running the tests.
if (!window.URL) {
  window.URL = {};
}
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = function() {
    return 'http://localhost';
  };
}
window.Worker = function FakeWorker() {
  this.postMessage = function () { };
  this.onmessage = undefined;
};

window.alert = () => {};

// Setup enzyme's react adapter
const Enzyme = require('enzyme');
const EnzymeAdapter = require('enzyme-adapter-react-16');
Enzyme.configure({ adapter: new EnzymeAdapter() });
