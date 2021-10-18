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

import getTree from '../rev-browser/getTree';

describe('getTree', () => {
  const docRevs = [
    {
      ok:{
        _id:"zebra",
        _rev:"2-0d9d2a9b5593f85539ec002751199602",
        color:"white",
        _revisions:{
          start:2,
          ids:["0d9d2a9b5593f85539ec002751199602", "1db655657f34c1742e9a0367342cfef9"]
        }
      }
    },
    {
      ok:{
        _id:"zebra",
        _rev:"2-34e3d563be7f242a42a4c232d5fc477e",
        color:"green",
        _revisions:{
          start:2,
          ids:["34e3d563be7f242a42a4c232d5fc477e", "1db655657f34c1742e9a0367342cfef9"]
        }
      }
    },
    {
      ok:{
        _id:"zebra",
        _rev:"2-a09738203402f0b1a78f4a889fbd97e9",
        _deleted: true,
        _revisions:{
          start:2,
          ids:["a09738203402f0b1a78f4a889fbd97e9", "1db655657f34c1742e9a0367342cfef9"]
        }
      }
    }
  ];

  describe('getDoc', () => {
    it('resolves the rev tree', () => {
      const fetcher = {
        getDoc: () => Promise.resolve(docRevs),
      };
      const mockDoc = {_id: 'zebra', _rev:"2-0d9d2a9b5593f85539ec002751199602"};
      return getTree(fetcher, mockDoc).then(tree => {
        expect(tree).toStrictEqual({
          paths: [
            ["2-0d9d2a9b5593f85539ec002751199602", "1-1db655657f34c1742e9a0367342cfef9"],
            ["2-34e3d563be7f242a42a4c232d5fc477e", "1-1db655657f34c1742e9a0367342cfef9"],
            ["2-a09738203402f0b1a78f4a889fbd97e9", "1-1db655657f34c1742e9a0367342cfef9"],
          ],
          deleted: {
            "2-a09738203402f0b1a78f4a889fbd97e9": true
          },
          winner: mockDoc._rev
        });
      });
    });

    it('rejects in case of error', () => {
      const fetcher = {
        getDoc: () => Promise.reject(new Error('Failed to fetch doc')),
      };
      const mockDoc = {_id: 'zebra', _rev:"2-0d9d2a9b5593f85539ec002751199602"};

      return getTree(fetcher, mockDoc).then(() => {
        fail('Should not succeed');
      }).catch(err => {
        expect(err.message).toEqual('Failed to fetch doc');
      });
    });

  });
});
