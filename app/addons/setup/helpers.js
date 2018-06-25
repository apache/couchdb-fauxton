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
import _ from 'lodash';

export function isInvalid(attrs) {
  if (_.isEmpty(attrs.username)) {
    return 'Admin name is required';
  }

  if (_.isEmpty(attrs.password)) {
    return 'Admin password is required';
  }

  if (attrs.bind_address && attrs.bind_address === '127.0.0.1' &&
        !attrs.singlenode) {
    return 'Bind address can not be 127.0.0.1';
  }

  if (attrs.port && _.isNaN(+attrs.port)) {
    return 'Bind port must be a number';
  }

  if (attrs.nodeCount && _.isNaN(+attrs.nodeCount)) {
    return 'Node count must be a number';
  }

  if (attrs.nodeCount === 0 || attrs.nodeCount && attrs.nodeCount < 1) {
    return 'Node count must be >= 1';
  }
  return false;
}
