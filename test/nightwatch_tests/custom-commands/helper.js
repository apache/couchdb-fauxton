const request = require('request');

exports.checkForDocumentCreated = function checkForDocumentCreated (url, timeout, cb) {

  const timeOutId = setTimeout(() => {
    throw new Error('timeout waiting for doc to appear');
  }, timeout);

  const intervalId = setInterval(() => {

    request(url, (er, res, body) => {
      if (res && /^2..$/.test(res.statusCode)) {
        clearTimeout(timeOutId);
        console.log('check for doc created successful');
        clearInterval(intervalId);

        cb(null);
      }
    });
  }, 1000);
};

exports.checkForDatabaseCreated = function checkForDatabaseCreated (couchUrl, databaseName, timeout, cb) {
  const timeOutId = setTimeout(() => {
    throw new Error('timeout waiting for db to appear');
  }, timeout);

  const intervalId = setInterval(() => {
    request(couchUrl + '/_all_dbs', function (er, res, body) {
      if (body) {
        const reg = new RegExp('"' + databaseName + '"', 'g');
        if (reg.test(body)) {
          clearTimeout(timeOutId);
          console.log('database created: ' + databaseName);
          clearInterval(intervalId);
          cb(null);
        }
      }
    });
  }, 1000);
};
