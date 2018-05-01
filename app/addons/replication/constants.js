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

export default {
  REPLICATION_SOURCE: {
    LOCAL: 'REPLICATION_SOURCE_LOCAL',
    REMOTE: 'REPLICATION_SOURCE_REMOTE'
  },

  REPLICATION_TARGET: {
    EXISTING_LOCAL_DATABASE: 'REPLICATION_TARGET_EXISTING_LOCAL_DATABASE',
    EXISTING_REMOTE_DATABASE: 'REPLICATION_TARGET_EXISTING_REMOTE_DATABASE',
    NEW_LOCAL_DATABASE: 'REPLICATION_TARGET_NEW_LOCAL_DATABASE',
    NEW_REMOTE_DATABASE: 'REPLICATION_TARGET_NEW_REMOTE_DATABASE'
  },

  REPLICATION_TYPE: {
    ONE_TIME: 'REPLICATION_TYPE_ONE_TIME',
    CONTINUOUS: 'REPLICATION_TYPE_CONTINUOUS'
  },

  REPLICATION_AUTH_METHOD: {
    NO_AUTH: 'NO_AUTH',
    BASIC: 'BASIC_AUTH'
  }
};
