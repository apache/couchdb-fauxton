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

import FauxtonAPI from '../../core/api';
import { get } from '../../core/ajax';

function searchUrl(database, partitionKey, ddoc, index, searchQuery) {
  //https://mycouchdb/db/_design/views101/_search/animals?q=kookaburra
  const encodedPartKey = partitionKey ? encodeURIComponent(partitionKey) : '';
  return FauxtonAPI.urls('search', 'server', encodeURIComponent(database), encodedPartKey,
    encodeURIComponent(ddoc), encodeURIComponent(index),
    '?limit=10&q=' + encodeURIComponent(searchQuery));
}

export const fetchSearchResults = (database, partitionKey, ddoc, index, searchQuery) => {
  const url = searchUrl(database, partitionKey, ddoc, index, searchQuery);
  return get(url).then((res) => {
    if (res.error) {
      throw new Error(res.reason);
    }

    return res.rows;
  });
};
