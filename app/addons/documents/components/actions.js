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
import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import { get } from "../../../core/ajax";

export default {
  fetchAllDocsWithKey: (database, partitionKey) => {
    return (id, callback) => {
      const query = '?' + app.utils.queryParams({
        startkey: JSON.stringify(id),
        endkey: JSON.stringify(id + "\u9999"),
        limit: 30
      });

      const url = partitionKey ?
        FauxtonAPI.urls('partitioned_allDocs', 'server', database.safeID(), encodeURIComponent(partitionKey), query) :
        FauxtonAPI.urls('allDocs', 'server', database.safeID(), query);
      get(url).then(res => {
        let options = [];
        if (!res.error) {
          const {rows} = res;
          options = rows.map(row => {
            return { value: row.id, label: row.id};
          });
        }
        callback(null, { options: options });
      });
    };
  }
};
