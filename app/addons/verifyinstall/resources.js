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

import FauxtonAPI from "../../core/api";
import Helpers from "../../helpers";
import { get, post } from "../../core/ajax";
import Databases from "../databases/resources";
import Documents from "../documents/resources";
const Verifyinstall = FauxtonAPI.addon();

const db = new Databases.Model({
  id: 'verifytestdb',
  name: 'verifytestdb'
});

const dbReplicate = new Databases.Model({
  id: 'verifytestdb_replicate',
  name: 'verifytestdb_replicate'
});

let doc, viewDoc;

Verifyinstall.testProcess = {
  saveDoc: function () {
    doc = new Documents.Doc({_id: 'test_doc_1', a: 1}, {
      database: db
    });

    return doc.save();
  },

  destroyDoc: function () {
    return doc.destroy();
  },

  updateDoc: function () {
    doc.set({b: 'hello'});
    return doc.save();
  },

  saveDB: function () {
    return db.save();
  },

  setupDB: function (db) {
    const promise = new FauxtonAPI.Promise((resolve, reject) => {
      db.fetch().then(() => {
        return db.destroy();
      }, () => {
        resolve();
      }).then(() => {
        resolve();
      }, (xhr, error, reason) => {
        reject(new Error(reason));
      });
    });
    return promise;
  },

  setup: function () {
    return FauxtonAPI.Promise.all([
      this.setupDB(db),
      this.setupDB(dbReplicate)
    ]);
  },

  testView: function () {
    let resolve, reject;
    const promise = new FauxtonAPI.Promise(function(res, rej) {
      resolve = res;
      reject = rej;
    });
    const getPromise = get(viewDoc.url() + '/_view/testview').then(res => {
      if (res.error) {
        throw new Error(res.reason || res.error);
      }
      return res;
    });

    getPromise.then(function (resp) {
      resp = _.isString(resp) ? JSON.parse(resp) : resp;
      const row = resp.rows[0];
      if (row.value === 6) {
        resolve();
      }
      reject(new Error('Values expect 6, got ' + row.value));
    }, reject);

    return promise;
  },

  setupView: function () {
    const doc1 = new Documents.Doc({_id: 'test_doc_10', a: 1}, { database: db });
    const doc2 = new Documents.Doc({_id: 'test_doc_20', a: 2}, { database: db });
    const doc3 = new Documents.Doc({_id: 'test_doc_30', a: 3}, { database: db });

    viewDoc = new Documents.Doc({
      _id: '_design/view_check',
      views: {
        'testview': {
          map: 'function (doc) { emit(doc._id, doc.a); }',
          reduce: '_sum'
        }
      }
    }, {
      database: db
    });

    return FauxtonAPI.Promise.all([doc1.save(), doc2.save(), doc3.save(), viewDoc.save()]);
  },

  setupReplicate: function () {
    const body = {
      create_target: true,
      source: 'verifytestdb',
      target: 'verifytestdb_replicate'
    };
    return post(
      Helpers.getServerUrl('/_replicate'),
      body
    ).then(res => {
      if (res.error) {
        throw new Error(res.reason || res.error);
      }
      return res;
    });
  },

  testReplicate: function () {
    const promise = new FauxtonAPI.Promise((resolve, reject) => {
      dbReplicate.fetch().then(() => {
        const docCount = dbReplicate.get('doc_count');
        if (docCount === 4) {
          resolve();
          return;
        }
        const reason = 'Replication Failed, expected 4 docs got ' + docCount;
        reject(new Error(reason));
      }, reject);
    });

    return promise;
  },

  removeDBs: function () {
    dbReplicate.destroy();
    db.destroy();
  }
};


export default Verifyinstall;
