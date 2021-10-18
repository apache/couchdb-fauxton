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

function getTree(fetcher, doc) {
  const winningRev = doc._rev;

  return fetcher.getDoc(doc._id, { revs: true, open_revs: "all" })
    .then(results => {
      const deleted = {};
      const paths = results.map(res => {
        res = res.ok;
        if (res._deleted) {
          deleted[res._rev] = true;
        }
        const revs = res._revisions;
        return revs.ids.map(function (id, i) {
          return revs.start - i + "-" + id;
        });
      });
      return {
        paths: paths,
        deleted: deleted,
        winner: winningRev,
      };
    });
}


export default getTree;
