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
define([
  'app',
  'api',
  'addons/dataimporter/actiontypes',
  'addons/dataimporter/resources',
  'papaparse'
],
function (app, FauxtonAPI, ActionTypes, Resources, Papa) {

  Papa.SCRIPT_PATH = '../../assets/js/libs/papaparse.js';

  var DATA_IMPORTER_NUMBERS = {
    MAX_ROWS_TO_PREVIEW: 500,
    DATA_ROW_CHUNKS: 500
  };

  return {
    dataImporterInit: function (firstTimeHere) {
      this.config = this.getDefaultConfig();
      this.completeFn = this.config.complete;
      this.errorFn = this.config.error;
      this.chunkedData = [];

      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_INIT,
        firstTimeHere: firstTimeHere,
        config: this.config
      });
    },

    fetchAllDBs: function () {
      $.ajax({
        method: 'GET',
        dataType: 'json',
        url: window.location.origin + '/_all_dbs'
      }).then(function (resp) {
        this._all_dbs = _.filter(resp, function (dbName) {
          return dbName[0] !== '_';
          // returns _all_dbs without _ (underscore) as first letter
        });
        this.setAllDBs(this._all_dbs);
      }.bind(this));
    },

    setAllDBs: function (all_dbs) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_SET_ALL_DBS,
        allDBs: all_dbs
      });
    },

    dataIsCurrentlyLoading: function () {
      this.startTime = app.helpers.moment();

      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_DATA_IS_CURRENTLY_LOADING
      });

    },

    loadFile: function (file) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_LOAD_FILE,
        file: file
      });
      this.theFile = file;
      this.papaparse(file);
      this.startElapsedTime();
    },

    chunkData: function () {
      this.cleanTheDataForBlankID();
      this.cleanTheDataForParsedExtra();
      for (var i = 0; i < this.theData.length; i += DATA_IMPORTER_NUMBERS.DATA_ROW_CHUNKS) {
        var oneChunk = this.theData.slice(i, i + DATA_IMPORTER_NUMBERS.DATA_ROW_CHUNKS);
        this.chunkedData.push(oneChunk);
      }
    },

    cleanTheDataForBlankID: function () {
      // this function checks the last thing in the array, and deletes the last element if it is empty
      // which happens if you have a newline in at the end of your csv file
      var lastElement = this.theData.length - 1;

      if (this.theData[lastElement]._id === '') {
        this.theData.splice(lastElement, 1);
      }
    },

    cleanTheDataForParsedExtra: function () {
      _.each(this.theData, function (obj, i) {
        _.each(obj, function (value, key) {
          if (key === '__parsed_extra') {

            delete this.theData[i][key];

            this.theData[i]['parsed_extra'] = value;

          }
        }.bind(this));
      }.bind(this));
    },

    papaparse: function (file) {
      this.config.complete = this.completeFn;
      this.config.error = this.errorFn;
      Papa.parse(file, this.config);
    },

    getDefaultConfig: function () {
      // the following object shows all of the options available for papaparse
      // some are defaulted to undefined
      // this is from http://papaparse.com/docs#config
      return {
        delimiter : '',   // auto-detect
        newline: '',      // auto-detect
        header: true,
        dynamicTyping: true,
        preview: 0,
        encoding: '',
        worker: true,     //true means page doesn't lock up
        comments: false,
        complete: function (results) {
          this.theData = results.data;
          this.chunkData();
          clearInterval(this.repeatTimeID);

          FauxtonAPI.dispatch({
            type: ActionTypes.DATA_IMPORTER_LOADING_COMPLETE,
            results: results,
            chunkedData: this.chunkedData
          });

        }.bind(this),
        error: function () {
          var msg1 = 'There was an error while parsing the file.',
              msg2 = 'Please try again.';

          this.goToErrorScreen('', [msg1, msg2]);
        }.bind(this),
        download: false,
        skipEmptyLines: false,
        chunk: undefined,   //define function for streaming
        beforeFirstChunk: undefined,
      };
    },

    setPreviewView: function (viewType) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_SET_PREVIEW_VIEW,
        view: viewType
      });
    },

    setParseConfig: function (key, value) {
      this.config[key] = value;
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_SET_PARSE_CONFIG,
        key: key,
        value: value
      });
      this.papaparse(this.theFile);
    },

    loadDataIntoDatabase: function (createNewDB, targetDB, chunkedData) {
      var databaseIsNew = this.databaseIsNew(targetDB);

      if (createNewDB) {
        if (databaseIsNew) {
          var msg1 = 'The database ' + targetDB + ' already exists.';
          this.goToErrorScreen('', [msg1]);
        }
        this.loadIntoNewDB(targetDB, chunkedData);
      } else {
        this.loadDataIntoTarget(targetDB, chunkedData);
      }

      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_LOAD_DATA_INTO_DB_PROGRESS
      });
    },

    loadIntoNewDB: function (targetDB, chunkedData) {
      $.ajax({
        url: FauxtonAPI.urls('databaseBaseURL', 'server', targetDB),
        xhrFields: { withCredentials: true },
        contentType: 'application/json; charset=UTF-8',
        method: 'PUT'
      }).then(function (resp) {
        this.loadDataIntoTarget(targetDB, chunkedData);
      }.bind(this), function (resp) {
        this.goToErrorScreen(resp,
          ['There was an error',
            'Could not create a new database named: ' + targetDB]);
      }.bind(this));
    },

    loadDataIntoTarget: function (targetDB, chunkedData) {
      var loadURL = FauxtonAPI.urls('databaseBaseURL', 'server', targetDB) + '/_bulk_docs';
      var importPromiseArray = _.map(chunkedData, function (data, i) {
      var payload = JSON.stringify({'docs': data});
      var prettyprint = JSON.stringify({'docs': data}, null, 2);

        return $.ajax({
          url: loadURL,
          xhrFields: { withCredentials: true },
          contentType: 'application/json; charset=UTF-8',
          method: 'POST',
          data: payload
        }).fail(function (resp) {
          this.goToErrorScreen(resp, [
            'There was an error loading documents into ' + targetDB,
            'Data that failed to load:' + prettyprint
          ]);
        }.bind(this));
      }.bind(this));

      FauxtonAPI.when(importPromiseArray).then(function (resp) {
        this.successfulImport(targetDB);
        clearInterval(this.repeatTimeID);
        this.dataImporterInit(true);
      }.bind(this));
    },

    goToErrorScreen: function (resp, messageArray) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_GO_TO_ERROR_SCREEN,
        resp: resp,
        messageArray: messageArray
      });
    },

    databaseIsNew: function (targetDB) {
      return _.some(this._all_dbs, targetDB);
    },

    successfulImport: function (targetDB) {
      FauxtonAPI.navigate(
        FauxtonAPI.urls('allDocs', 'app', targetDB, '?include_docs=true')
      );
    },

    startElapsedTime: function () {
      this.repeatTimeID = setInterval(function () {
        var secondsElapsed = app.helpers.moment().diff(this.startTime);
        var time = app.helpers.getDateFromNow(this.startTime);
        if (secondsElapsed < 60000) {
          time = '~' + Math.ceil(secondsElapsed / 1000) + ' seconds ago';
        }
        this.passElapsedTime(time);
      }.bind(this), 3000);
    },

    passElapsedTime: function (elapsedTime) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DATA_IMPORTER_PASS_ELAPSED_TIME,
        time: elapsedTime
      });
    }
  };
});
