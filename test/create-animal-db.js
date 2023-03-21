const helpers = require('./nightwatch_tests/custom-commands/helper');
const async = require('async');

const animals = require('../test/animal-db.json');

module.exports = createAnimalDb;

function createAnimalDb (url, cb) {

  deleteDatabase('animaldb', () => {
    createAnimalDatabase();
  });


  function deleteDatabase (db, cb) {
    helpers.axiosRequest({
      url: `${url}/${db}`,
      method: 'DELETE'
    }, (err, res, body) => {
      if (err) {
        throw err;
      }

      cb();
    });
  }

  function createAnimalDatabase () {
    helpers.axiosRequest({
      url: `${url}/animaldb/`,
      method: 'PUT',
      data: {}
    }, (err, res, body) => {
      if (err) {
        throw err;
      }

      bulkLoadDocs();
    });
  }

  function bulkLoadDocs () {
    helpers.axiosRequest({
      url: `${url}/animaldb/_bulk_docs`,
      method: 'POST',
      data: {
        docs: animals
      }
    }, (err, res, body) => {
      if (err) {
        throw err;
      }

      async.waterfall([
        (cb) => {
          replicate(`${url}/animaldb`, `${url}/animaldb-copy`, true, cb);
        },
        (cb) => {
          replicate(`${url}/animaldb`, `${url}/animaldb-copy-2`, true, cb);
        },
        (cb) => {
          alterZebraDocs(cb);
        },
        (cb) => {
          alterAnimalDesignDoc(cb)
        },
        (cb) => {
          replicate(`${url}/animaldb-copy`, `${url}/animaldb`, false, cb);
        },
        (cb) => {
          replicate(`${url}/animaldb-copy-2`, `${url}/animaldb`, false, cb);
        },
        (cb) => {
          deleteDatabase('animaldb-copy', cb);
        },
        (cb) => {
          deleteDatabase('animaldb-copy-2', cb);
        },
        (cb) => {
          helpers.axiosRequest({
            url: `${url}/animaldb/${encodeURIComponent('_design/conflicts')}`,
            method: 'PUT',
            data: {
              _id: "_design/conflicts",
              language: "javascript",
              "views":{"new-view":{"map":"function (doc) {\n  emit(doc._id, 1);\n}"}}
            }
          }, (err, res, body) => {
            if (err) {
              throw err;
            }

            cb();
          });

        }
      ], (err, result) => {
        cb();
      });
    });
  }

  function replicate (source, target, createTarget, cb) {
    helpers.axiosRequest({
      url: `${url}/_replicate`,
      method: 'POST',
      data: {
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

  function getRev (db, id, cb) {
    helpers.axiosRequest({
      url: `${url}/${db}/${id}`
    }, (err, res, body) => {
      cb(null, body._rev);
    });
  }

  function updateDoc (db, id, data, cb) {
    getRev(db, id, (err, rev) => {
      alterDoc(db,id, data, rev, cb);
    });
  }

  function alterDoc (db, id, data, rev, cb) {
    data._rev = rev;

    helpers.axiosRequest({
      url: `${url}/${db}/${id}`,
      method: 'PUT',
      data: data
    }, (err, res, body) => {
      cb(null);
    });
  }

  function alterZebraDocs (cb) {
    updateDoc('animaldb','zebra', {
      color: 'black & white'
    }, () => {
      updateDoc('animaldb-copy', 'zebra', {
        color: 'white'
      }, () => {
        updateDoc('animaldb-copy-2', 'zebra', {
          color: 'green'
        }, cb);
      });
    });
}

    function alterAnimalDesignDoc (cb) {
        updateDoc('animaldb','_design/animals', {
            color: 'black & white'
        }, () => {
            updateDoc('animaldb-copy', '_design/animals', {
                color: 'white'
            }, () => {
                updateDoc('animaldb-copy-2', '_design/animals', {
                    color: 'green'
                }, cb);
            });
        });
    }

}

