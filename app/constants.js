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

  var constants = {

    MISC: {
      TRAY_TOGGLE_SPEED: 250,
      DEFAULT_PAGE_SIZE: 20,
      MODAL_BACKDROP_Z_INDEX: 1025
    },

    DATABASES: {
      DOCUMENT_LIMIT: 100
    },

    // events
    EVENTS: {
      TRAY_CLOSED: 'tray:closed',
      TRAY_OPENED: 'tray:opened',
      BURGER_CLICKED: 'burger:clicked'
    },

    // documentation URLs
    DOC_URLS: {
      GENERAL: '/_utils/docs/intro/api.html#documents',
      ALL_DBS: '/_utils/docs/api/server/common.html?highlight=all_dbs#get--_all_dbs',
      REPLICATION: '/_utils/docs/replication/replicator.html#basics',
      DESIGN_DOCS: '/_utils/docs/couchapp/ddocs.html#design-docs',
      DESIGN_DOC_METADATA: '/_utils/docs/api/ddoc/common.html#api-ddoc-view-index-info',
      VIEW_FUNCS: '/_utils/docs/couchapp/ddocs.html#view-functions',
      MAP_FUNCS: '/_utils/docs/couchapp/ddocs.html#map-functions',
      REDUCE_FUNCS: '/_utils/docs/couchapp/ddocs.html#reduce-and-rereduce-functions',
      API_REF: '/_utils/docs/http-api.html',
      DB_PERMISSION: '/_utils/docs/api/database/security.html#db-security',
      STATS: '/_utils/docs/api/server/common.html?highlight=stats#get--_stats',
      ACTIVE_TASKS: '/_utils/docs/api/server/common.html?highlight=stats#active-tasks',
      LOG: '/_utils/docs/api/server/common.html?highlight=stats#log',
      CONFIG: '/_utils/docs/config/index.html',
      VIEWS: '/_utils/docs/intro/overview.html#views',
      CHANGES: '/_utils/docs/api/database/changes.html?highlight=changes#post--db-_changes'
    },

    LOCAL_STORAGE: {
      SIDEBAR_MINIMIZED: 'sidebar-minimized'
    }
  };

  return constants;
});
