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

window.localStorage = global.localStorage;
window.$ = window.jQuery = require('jquery');
window._ = require('lodash');
window.Backbone = require('backbone');

Object.defineProperty(window.location, 'origin', {
  writable: true,
  value: 'http://dev:8000'
});


