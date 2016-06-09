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
import $ from 'jquery';
import FauxtonAPI from "../../../core/api";

export default {
  fetchAllDocsWithKey: (database) => {
      return (id, callback) => {
      const query = '?' + $.param({
        startkey: JSON.stringify(id),
        endkey: JSON.stringify(id + "\u9999"),
        limit: 100
      });

      const url = FauxtonAPI.urls('allDocs', 'server', database.safeID(), query);
      $.ajax({
        cache: false,
        url: url,
        dataType: 'json'
      }).then(({rows}) => {
        const options = rows.map(row => {
          return { value: row.id, label: row.id};
        });
        callback(null, {
          options: options
        });
      });
    };
  }
};
