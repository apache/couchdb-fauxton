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
import Helpers from '../../helpers';
import FauxtonAPI from '../../core/api';
import Actions from './actions';
import SearchRoutes from './routes';
import reducers from './reducers';
import { get } from "../../core/ajax";
import Constants from './constants';
import './assets/less/search.less';

function checkSearchFeature () {
  // Checks if the CouchDB server supports Search
  return get(Helpers.getServerUrl("/")).then((couchdb) => {
    return couchdb.features && couchdb.features.includes('search');
  }).catch(() => {
    return false;
  });
}

function partitionUrlComponent(partitionKey) {
  return partitionKey ? '/_partition/' + partitionKey : '';
}

SearchRoutes.initialize = function () {
  checkSearchFeature().then(function(enabled) {
    if (!enabled) return;

    FauxtonAPI.registerExtension('sidebar:list', {
      selector: 'indexes',
      name: 'Search Indexes',
      urlNamespace: 'search',
      indexLabel: 'search index', // used for labels
      onDelete: Actions.deleteSearchIndex,
      onClone: Actions.cloneSearchIndex,
      onEdit: Actions.gotoEditSearchIndexPage
    });
    FauxtonAPI.registerExtension('sidebar:links', {
      title: "New Search Index",
      url: "new_search",
      icon: 'fonticon-plus-circled',
      showForPartitionedDDocs: true
    });
    FauxtonAPI.registerExtension('sidebar:newLinks', {
      url: 'new_search',
      name: 'Search Index'
    });

    // this tells Fauxton of the new Search Index type. It's used to determine when a design doc is really empty
    FauxtonAPI.registerExtension('IndexTypes:propNames', 'indexes');

    FauxtonAPI.registerExtension('mango:indexTemplates', Constants.SEARCH_MANGO_INDEX_TEMPLATES);
  });
};

FauxtonAPI.registerUrls('partitioned_search', {
  app: function (id, partitionKey, designDoc) {
    return 'database/' + id + partitionUrlComponent(partitionKey) + '/_design/' + designDoc + '/_search/';
  }
});

FauxtonAPI.registerUrls('search', {
  server: function (id, partitionKey, designDoc, searchName, query) {
    return Helpers.getServerUrl('/' + id + partitionUrlComponent(partitionKey) + '/_design/' + designDoc + '/_search/' + searchName + query);
  },

  app: function (id, designDoc) {
    return 'database/' + id + '/_design/' + designDoc + '/_search/';
  },

  edit: function (database, partitionKey, designDoc, indexName) {
    return 'database/' + database + partitionUrlComponent(partitionKey) + '/_design/' + designDoc + '/_search/' + indexName + '/edit';
  },

  fragment: function (id, partitionKey, designDoc, search) {
    return 'database/' + id + partitionUrlComponent(partitionKey) + '/_design/' + designDoc + '/_search/' + search;
  },

  showIndex: function (id, partitionKey, designDoc, search) {
    return 'database/' + id + partitionUrlComponent(partitionKey) + '/' + designDoc + '/_search/' + search;
  },

  apiurl: function (id, partitionKey, designDoc, searchName, query) {
    return window.location.origin + '/' + encodeURIComponent(id) + '/_design/' + encodeURIComponent(designDoc) +
      '/_search/' + encodeURIComponent(searchName) + '?q=' + encodeURIComponent(query);
  }
});

FauxtonAPI.addReducers({
  search: reducers
});

export default SearchRoutes;
