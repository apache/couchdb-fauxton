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

  MISC: {
    TRAY_TOGGLE_SPEED: 250,
    DEFAULT_PAGE_SIZE: 20
  },

  DATABASES: {
    DOCUMENT_LIMIT: 100
  },

  // global events for common used components
  EVENTS: {
    TRAY_OPENED: 'tray:opened',
    NAVBAR_SIZE_CHANGED: 'navbar:size_changed'
  },

  // documentation URLs
  DOC_URLS: {
    GENERAL:'./docs/intro/api.html#documents',
    ALL_DBS:'./docs/api/server/common.html?highlight=all_dbs#get--_all_dbs',
    REPLICATION:'./docs/replication/replicator.html#basics',
    DESIGN_DOCS:'./docs/ddocs/ddocs.html#design-docs',
    DESIGN_DOC_METADATA:'./docs/api/ddoc/common.html#api-ddoc-view-index-info',
    VIEW_FUNCS:'./docs/ddocs/ddocs.html#view-functions',
    MAP_FUNCS:'./docs/ddocs/ddocs.html#map-functions',
    REDUCE_FUNCS:'./docs/ddocs/ddocs.html#reduce-and-rereduce-functions',
    API_REF:'./docs/http-api.html',
    DB_PERMISSION:'./docs/api/database/security.html#db-security',
    STATS:'./docs/api/server/common.html?highlight=stats#get--_stats',
    ACTIVE_TASKS:'./docs/api/server/common.html?highlight=stats#active-tasks',
    LOG:'./docs/api/server/common.html?highlight=stats#log',
    CONFIG:'./docs/config/index.html',
    VIEWS:'./docs/intro/overview.html#views',
    MANGO_INDEX:'./docs/intro/api.html#documents',
    MANGO_SEARCH:'./docs/intro/api.html#documents',
    CHANGES:'./docs/api/database/changes.html?highlight=changes#post--db-_changes',
    SETUP: './docs/cluster/setup.html#the-cluster-setup-wizard',
    MEMBERSHIP: './docs/cluster/nodes.html'
  }
};
