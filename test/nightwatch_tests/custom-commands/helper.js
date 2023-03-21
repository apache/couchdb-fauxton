const axios = require('axios');

const customAxios = axios.create({
  responseType: 'json',
  validateStatus: undefined,
});

function axiosRequest(url, cb) {
  customAxios.request(url).then(resp => {
    cb(null, resp, resp.data);
  }).catch(err => {
    cb(err, null, null);
  });
};

exports.axiosRequest = axiosRequest;


exports.checkForDocumentCreated = function checkForDocumentCreated (url, timeout, cb) {

  const timeOutId = setTimeout(() => {
    throw new Error('timeout waiting for doc to appear (' + url + ')');
  }, timeout);

  const intervalId = setInterval(() => {
    axiosRequest(url, (er, res, body) => {
      if (res && res.status >= 200 && res.status < 300) {
        clearTimeout(timeOutId);
        clearInterval(intervalId);

        cb(null);
      }
    });
  }, 1000);
};

exports.checkForDatabaseCreated = function checkForDatabaseCreated (couchUrl, databaseName, timeout, cb) {
  const timeOutId = setTimeout(() => {
    throw new Error('Timeout ('+timeout+') waiting for db to appear');
  }, timeout);

  const intervalId = setInterval(() => {
    axiosRequest({
      url: couchUrl + '/_all_dbs',
      responseType: 'text',
    }, function (er, res, body) {
      if (body) {
        const reg = new RegExp('"' + databaseName + '"', 'g');
        if (reg.test(body)) {
          clearTimeout(timeOutId);
          clearInterval(intervalId);
          cb(null);
        }
      }
    });
  }, 1000);
};

exports.checkForDocumentDeleted = function checkForDocumentDeleted (couchUrl, timeout, cb) {
  const timeOutId = setTimeout(() => {
    throw new Error('timeout waiting for doc to be deleted');
  }, timeout);

  const intervalId = setInterval(() => {
    axiosRequest(couchUrl, function (er, res, body) {
      if (res.status === 404) {
        clearTimeout(timeOutId);
        clearInterval(intervalId);
        cb(null);
      }
    });
  }, 1000);

};
