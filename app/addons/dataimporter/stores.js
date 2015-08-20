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
  'addons/dataimporter/actiontypes'
], function (app, FauxtonAPI, ActionTypes) {

  var DATA_IMPORTER_NUMBERS = {
    MAX_ROWS_SHOWN: 500,
    BIG_FILE_SIZE_THRESHOLD: 500000, // "a big file" is bigger than this number (500KB)
    PREVIEW_SIZE_CAP: 50000,
    FILE_MAX_SIZE: 50000000  //in bytes
  };

  var DataImporterStore = FauxtonAPI.Store.extend({
    init: function (firstTimeHere, config) { //to reset, call this with true
      if (firstTimeHere) {
        this.reset();
      } // else keeps store as it was when you left the page
      this._config = config;
    },

    reset: function (defaultConfig) {
      this._isDataCurrentlyLoading = false;
      this._hasDataLoaded = false;
      this._hasErrored = false;
      this._theData = [];
      this._theMetadata = [];
      this._smallData = [];
      this._showView = 'table';
      this._theFile = { size: 0 };
      this._fileSize = 0;
      this._repeatTimeID;
      this._maxSize = DATA_IMPORTER_NUMBERS.FILE_MAX_SIZE;
      this._showErrorScreen = false;
      this._errorMessageArray = [];
      this._loadingInDBInProgress = false;
      this._time = 'just started';
      this._showConfigLoadingBars = false;
      this._optionsAreDisabled = false;
    },

    setAllDBs: function (allDBs) {
      this._all_dbs = allDBs;
    },

    getAllDBs: function () {
      return this._all_dbs;
    },

    getMaxSize: function () {
      return this._maxSize;
    },

    isDataCurrentlyLoading: function () {
      return this._isDataCurrentlyLoading;
    },

    dataIsLoading: function () {
      this._isDataCurrentlyLoading = true;
    },

    hasDataLoaded: function () {
      return this._hasDataLoaded;
    },

    dataLoaded: function () {
      this._hasDataLoaded = true;
    },

    loadData: function (data) {
      this._theData = data;
    },

    getFileSize: function () {
      return this._theFile.size;
    },

    isThisABigFile: function () {
      return this._theFile.size > DATA_IMPORTER_NUMBERS.BIG_FILE_SIZE_THRESHOLD ? true : false;
    },

    getTimeSinceLoad: function () {
      return this._time;
    },

    setTimeSinceLoad: function (elapsedtime) {
      this._time = elapsedtime;
    },

    loadMeta: function (meta) {
      this._theMetadata = meta;
    },

    loadFile: function (file) {
      this._theFile = file;
    },

    getTotalRows: function () {
      return this._totalRows;
    },

    getPreviewView: function () {
      return this._showView;
    },

    setPreviewView: function (type) {
      this._showView = type;
    },

    calcSmallPreviewOfData: function () {
      //this is incase the file has large rows
      var filesize = this._theFile.size,
          rows = this._totalRows,
          sizeOfEachRow = filesize / rows, //this is approximate
          sizeCap = DATA_IMPORTER_NUMBERS.PREVIEW_SIZE_CAP,  //in bytes
          numberOfRowsToShow;

      numberOfRowsToShow = Math.ceil(sizeCap / sizeOfEachRow);
      numberOfRowsToShow = Math.min(numberOfRowsToShow, DATA_IMPORTER_NUMBERS.MAX_ROWS_SHOWN);

      this._rowsShown = numberOfRowsToShow;
      this._smallData = this._theData.slice(0, this._rowsShown);
    },

    getSmallPreviewOfData: function () {
      return this._smallData;
    },

    getRowsShown: function () {
      return this._rowsShown;
    },

    getTheMetadata: function () {
      return this._theMetadata;
    },

    getTheData: function () {
      return this._theData;
    },

    loadingComplete: function (results, chunkedData) {
      this.loadMeta(results.meta);
      this.loadData(results.data);
      this._totalRows = this._theData.length;

      if (this.isThisABigFile()) {
        this.calcSmallPreviewOfData();
      }
      this._chunkedData = chunkedData;
      this.dataLoaded();
    },

    getChunkData: function () {
      return this._chunkedData;
    },

    cleanTheDataForBlankID: function () {
      // this function checks the last thing in the array, and deletes the last element if it is empty
      // which happens if you have a newline in at the end of your csv file
      var lastElement = this._theData.length - 1;

      if (this._theData[lastElement]._id === '') {
        this._theData.splice(lastElement, 1);
      }
    },

    clearData: function () {
      this._theData = [];
    },

    setParseConfig: function (key, value) {
      this._config[key] = value;
    },

    getConfigSetting: function (key) {
      return this._config[key];
    },

    getSelectedToggles: function () {
      return {
        headerChosen: this._config['header'],
        showNumbersAsIntegers: this._config['dynamicTyping']
      };
    },

    getShowPleaseWaitForConfigMessage: function () {
      return this._showConfigLoadingBars;
    },

    setShowPleaseWaitForConfigMessage: function (show) {
      this._showConfigLoadingBars = show;
    },

    loadDataIntoDatabaseProgress: function () {
      this._loadingInDBInProgress = true;
    },

    showErrorScreen: function () {
      return this._showErrorScreen;
    },

    getAreOptionsDisabled: function () {
      return this._optionsAreDisabled;
    },

    setAreOptionsDisabled: function (bool) {
      this._optionsAreDisabled = bool;
    },

    getErrorMsg: function () {
      return this._errorMessageArray;
    },

    goToErrorScreen: function (resp, messageArray) {
      this._loadingInDBInProgress = false;
      this._showErrorScreen = true;
      if (resp) {
        messageArray.push(resp);
      }
      this._errorMessageArray.unshift(messageArray);
    },

    dbPopulationInProgress: function () {
      return this._loadingInDBInProgress;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.DATA_IMPORTER_INIT:
          this.init(action.firstTimeHere, action.config);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_SET_ALL_DBS:
          this.setAllDBs(action.allDBs);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_DATA_IS_CURRENTLY_LOADING:
          this.dataIsLoading();
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_LOAD_FILE:
          this.loadFile(action.file);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_SET_PREVIEW_VIEW:
          this.setPreviewView(action.view);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_SET_PARSE_CONFIG:
          this.setParseConfig(action.key, action.value);
          this.setShowPleaseWaitForConfigMessage(true);
          this.setAreOptionsDisabled(true);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_LOAD_DATA_INTO_DB_PROGRESS:
          this.loadDataIntoDatabaseProgress();
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_GO_TO_ERROR_SCREEN:
          this.goToErrorScreen(action.resp, action.messageArray );
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_LOADING_COMPLETE:
          this.loadingComplete(action.results, action.chunkedData);
          this.setShowPleaseWaitForConfigMessage(false);
          this.setAreOptionsDisabled(false);
          this.triggerChange();
        break;

        case ActionTypes.DATA_IMPORTER_PASS_ELAPSED_TIME:
          this.setTimeSinceLoad(action.time);
          this.triggerChange();
        break;

        default:
        return;
      }
    }
  });

  var dataImporterStore = new DataImporterStore();
  dataImporterStore.dispatchToken = FauxtonAPI.dispatcher.register(dataImporterStore.dispatch.bind(dataImporterStore));

  return {
    dataImporterStore: dataImporterStore
  };
});
