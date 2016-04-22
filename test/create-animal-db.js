const request = require('request');
const async = require('async');

const animals = require('../test/animal-db.json');

const conflictingDoc = 'zebra';

module.exports = createAnimalDb;

function createAnimalDb (url, cb) {

  deleteDatabase('animaldb', () => {
    createAnimalDb();
  });

  function deleteDatabase (db, cb) {
    request({
      uri: `${url}/${db}`,
      method: 'DELETE',
      json: true,
      body: {}
    }, (err, res, body) => {
      if (err) {
        throw err;
      }
      cb();
    });
  }

  function createAnimalDb () {
    request({
      uri: `${url}/animaldb/`,
      method: 'PUT',
      json: true,
      body: {}
    }, (err, res, body) => {
      if (err) {
        throw err;
      }

      console.log("**** DEBUG **** 1");
      bulkLoadDocs();
    });
  }

  function bulkLoadDocs () {
    request({
      uri: `${url}/animaldb/_bulk_docs`,
      method: 'POST',
      json: true,
      body: {
        docs: animals
      }
    }, (err, res, body) => {
      if (err) {
        throw err;
      }

      async.waterfall([
        (cb) => {
          console.log("**** DEBUG **** 2");
          replicate(`${url}/animaldb`, `${url}/animaldb-copy`, true, cb);
        },
        (cb) => {
          console.log("**** DEBUG **** 3");
          replicate(`${url}/animaldb`, `${url}/animaldb-copy-2`, true, cb);
        },
        (cb) => {
          console.log("**** DEBUG **** 4");
          alterDocs(cb);
        },
        (cb) => {
          console.log("**** DEBUG **** 5");
          replicate(`${url}/animaldb-copy`, `${url}/animaldb`, false, cb);
        },
        (cb) => {
          console.log("**** DEBUG **** 6");
          replicate(`${url}/animaldb-copy-2`, `${url}/animaldb`, false, cb);
        },
        (cb) => {
          console.log("**** DEBUG **** 7");
          deleteDatabase('animaldb-copy', cb);
        },
        (cb) => {
          console.log("**** DEBUG **** 8");
          deleteDatabase('animaldb-copy-2', cb);
        },
      ], (err, result) => {
        console.log("**** DEBUG **** 9");
        cb();
      });
    });
  }

  function replicate (source, target, createTarget, cb) {
    request({
      uri: `${url}/_replicate`,
      method: 'POST',
      json: true,
      body: {
        source: source,
        target: target,
        create_target: createTarget
      }
    }, (err, res, body) => {
      if (err) {
        throw err;
      }

      cb(null);

    });
  }

  function getRev (db, cb) {
    request({
      uri: `${url}/${db}/${conflictingDoc}`,
      json: true
    }, (err, res, body) => {
      cb(null, body._rev);
    });
  }

  function updateDoc (db, data, cb) {

    getRev(db, (err, rev) => {
      alterDoc(db, data, rev, cb);
    });
  }

  function alterDoc (db, data, rev, cb) {
    data._rev = rev;

    request({
      uri: `${url}/${db}/${conflictingDoc}`,
      json: true,
      method: 'PUT',
      body: data
    }, (err, res, body) => {
      console.log(body);
      cb(null);
    });
  }

  function alterDocs (cb) {

    updateDoc('animaldb', {
      color: 'black & white'
    }, () => {

      updateDoc('animaldb-copy', {
        color: 'white'
      }, () => {
        updateDoc('animaldb-copy-2', {
          color: 'green'
        }, cb);
      });
    });
}

}
