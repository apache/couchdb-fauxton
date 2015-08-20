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
  'api',
  'react',
  'addons/dataimporter/stores',
  'addons/dataimporter/actions',
  'addons/components/react-components.react',
  'helpers'
], function (FauxtonAPI, React, Stores, Actions, Components, Helpers) {

  var dataImporterStore = Stores.dataImporterStore;

  var DataImporterController = React.createClass({
    getStoreState: function () {
      return {
        isDataCurrentlyLoading: dataImporterStore.isDataCurrentlyLoading(),
        hasDataLoaded: dataImporterStore.hasDataLoaded(),
        isBigFile: dataImporterStore.isThisABigFile(),
        rowShown: dataImporterStore.getRowsShown(),
        rowsTotal: dataImporterStore.getTotalRows(),
        data: dataImporterStore.getTheData(),
        meta: dataImporterStore.getTheMetadata(),
        getPreviewView: dataImporterStore.getPreviewView(),
        getSmallPreviewOfData: dataImporterStore.getSmallPreviewOfData(),
        getHeaderConfig: dataImporterStore.getConfigSetting('header'),
        getDelimiterChosen: dataImporterStore.getConfigSetting('delimiter'),
        getAllDBs: dataImporterStore.getAllDBs(),
        getFileSize: dataImporterStore.getFileSize(),
        getTimeSinceLoad: dataImporterStore.getTimeSinceLoad,
        getMaxSize: dataImporterStore.getMaxSize(),
        showErrorScreen: dataImporterStore.showErrorScreen(),
        errorMsg: dataImporterStore.getErrorMsg(),
        isLoadingInDBInProgress: dataImporterStore.dbPopulationInProgress(),
        getChunkData: dataImporterStore.getChunkData(),
        showPleaseWaitForConfigMessage: dataImporterStore.getShowPleaseWaitForConfigMessage(),
        disableButtons: dataImporterStore.getAreOptionsDisabled(),
        selectedToggles: dataImporterStore.getSelectedToggles()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      Actions.fetchAllDBs();
      dataImporterStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      dataImporterStore.off('change', this.onChange, this);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    render: function () {
      if (this.state.showErrorScreen) {
        return <DataImporterError errorMsg={this.state.errorMsg} />;
      }

      if (this.state.isLoadingInDBInProgress || this.state.showPleaseWaitForConfigMessage) {
        return <DataImporterLoading />;
      }

      if (this.state.hasDataLoaded) {
        return (
          <DataImporterPreviewData
            rowShown={this.state.rowShown}
            rowsTotal={this.state.rowsTotal}
            data={this.state.data}
            isBigFile={this.state.isBigFile}
            meta={this.state.meta}
            getPreviewView={this.state.getPreviewView}
            getSmallPreviewOfData={this.state.getSmallPreviewOfData}
            getHeaderConfig={this.state.getHeaderConfig}
            getDelimiterChosen={this.state.getDelimiterChosen}
            getAllDBs={this.state.getAllDBs}
            filesize={this.state.getFileSize}
            chunkedData={this.state.getChunkData}
            disableButtons={this.state.disableButtons}
            selectedToggles={this.state.selectedToggles} />
        );
      }

      return (
        <DataImporterDropZone
          isLoading={this.state.isDataCurrentlyLoading}
          isBigFile={this.state.isBigFile}
          getFileSize={this.state.getFileSize}
          getTimeSinceLoad={this.state.getTimeSinceLoad}
          maxSize={this.state.getMaxSize} />
      );
    }
  });

  var DataImporterLoading = React.createClass({
    render: function () {
      return (
        <div className="dropzone loading-background">
          <div className="dropzone-msg loading">
            Loading...
            <Components.LoadLines />
          </div>
        </div>
      );
    }
  });

  var DataImporterDropZone = React.createClass({
    getInitialState: function () {
      return {
        draggingOver: false,
        loading: this.props.isLoading,
        showLimitInfo: false,
        fileSize: this.props.getFileSize,
        timeSinceLoad: this.props.getTimeSinceLoad,
        fileTooBig: false,
        maxSize: this.props.maxSize
      };
    },

    dragOver: function (e) {
      e.preventDefault();
      this.setState({ draggingOver: true });
    },

    endDragOver: function (e) {
      e.preventDefault();
      this.setState({draggingOver: false});
    },

    drop: function (e) {
      e.preventDefault();
      var file = e.nativeEvent.dataTransfer.files[0];
      this.checkSize(file);
    },

    filechosen: function (e) {
      e.preventDefault();
      var file = e.nativeEvent.target.files[0];
      this.checkSize(file);
    },

    checkSize: function (file) {
      if (file.size > this.props.maxSize) {
        this.setState({
          fileTooBig: true,
          fileSize: file.size,
          draggingOver: false
        });
      } else {
        Actions.loadFile(file);
        this.setState({
          loading: true,
          fileSize: file.size,
          draggingOver: false
        });
        Actions.dataIsCurrentlyLoading();
      }
    },

    uploadButton: function () {
      return (
        <p>
          <span className="fonticon icon-file-text-alt">
            <span className="file-upload btn">
              <span className="icon icon-search"></span>
              Choose File
              <input type="file" className="upload" onChange={this.filechosen} />
            </span>
          </span>
        </p>
      );
    },

    onFileLimitInfoToggle: function (e) {
      e.preventDefault();
      var toggle = this.state.showLimitInfo ? false : true;
      this.setState({ showLimitInfo : toggle });
    },

    fileLimitLink: function (msg) {
      return (
        <div className="filetype-txt">
          <a href="#"
            className="import-data-limit-info-link"
            onClick={this.onFileLimitInfoToggle}
            data-bypass="true">
            {msg}
          </a>
        </div>
      );
    },

    loadingBoxBigFileMessage: function () {
      return (
        <div className="loading-big-file-msg">
          <div>This is a large file: {Helpers.formatSize(this.state.fileSize)}</div>
          <div>Large files may take up to 5 minutes to load</div>
          <div>Elapsed time: {this.state.timeSinceLoad()}</div>
        </div>
      );
    },

    fileTooBigMsg: function () {
      return (
        <p className="file-exceeds-max-msg">
          Your file was too big. Please choose another one.
        </p>
      );
    },

    defaultBox: function () {
      var fileTooBig = this.state.fileTooBig ? this.fileTooBigMsg() : '';

      return (
        <div className="dropzone"
          onDragOver={this.dragOver}
          onDragLeave={this.endDragOver}
          onDrop={this.drop} >
          <div className="dropzone-msg default">
            {fileTooBig}
            {this.uploadButton()}
            <p>Or drag a file into box.</p>
          </div>
          {this.fileLimitLink("File Limitations")}
        </div>
      );
    },

    boxIsDraggingOver: function () {
      return (
        <div className="dropzone dragging-file-in-background"
          onDragOver={this.dragOver}
          onDragLeave={this.endDragOver}
          onDrop={this.drop}>
          <div className="dropzone-msg draggingover">
            <span className="fonticon icon-file-text-alt">
            </span>
            <span className="loading-msg">
              Drop your file.
            </span>
          </div>
        </div>
      );
    },

    boxIsLoading: function () {
      var loadingBoxBigFileMessage = this.props.isBigFile ?
        this.loadingBoxBigFileMessage() : '';

      return (
        <div className="dropzone loading-background">
          <div className="dropzone-msg loading">
            Loading...
            {loadingBoxBigFileMessage}
            <Components.LoadLines />
          </div>
        </div>
      );
    },

    boxShowLimitInfo: function () {
      return (
         <div className="dropzone limit-info"
          onDragOver={this.dragOver}
          onDragLeave={this.endDragOver}
          onDrop={this.drop}>
          <div className="dropzone-msg">
            <p>{this.props.maxSize / 1000000} MB filesize limit</p>
            <p>Only .csv files will import correctly</p>
          </div>
          {this.fileLimitLink("Back")}
        </div>
      );
    },

    render: function () {
      var box = this.defaultBox();

      if (this.state.draggingOver) {
        box = this.boxIsDraggingOver();
      } else if (this.state.loading) {
        box = this.boxIsLoading();
      } else if (this.state.showLimitInfo) {
        box = this.boxShowLimitInfo();
      }
      return box;
    }
  });

  var DataImporterPreviewData = React.createClass({

    getInitialState: function () {
      return {
        showInfo: false
      };
    },

    componentDidMount: function () {
      this.setState(this.getInitialState());
      document.getElementById('preview-page')
        .addEventListener('scroll', this.handleScroll);
    },

    componentWillUnmount: function () {
      document.getElementById('preview-page')
        .removeEventListener('scroll', this.handleScroll);
    },

    handleScroll: function (e) {
      var left = document.getElementById('preview-page').scrollLeft;
      document.getElementById('data-import-options').style.left = left + 'px';
    },

    fileMetadataInfo: function () {
      var totalRows = this.props.rowsTotal,
          previewMsg = (totalRows > 500) ? ' This is a 500 row (max) preview of the file.' : '';

      if (this.state.showInfo) {
        return (
          <p className="big-file-preview-limit-info-message">
            All {totalRows} rows from this file will be imported.
            {previewMsg}
          </p>
        );
      }

      return null;
    },

    bigFilePreviewWarning: function () {
      var rowShown = this.props.rowShown,
          totalRows = this.props.rowsTotal;

      if (this.state.showInfo) {
        return (
          <p className="big-file-preview-limit-info-message">
            Because of the size of this file, this preview only shows the
            first {rowShown} rows, out of {totalRows} rows total.
            However, if you choose to load the data into a database, the
            entirety of the file (all {totalRows} rows) will be imported.
          </p>
        );
      }

      return null;
    },

    clickInfoBox: function () {
      console.log(this.state.showInfo);
      this.setState({showInfo: !this.state.showInfo});
    },

    fileInfoBox: function () {
      var message = this.props.isBigFile ? this.bigFilePreviewWarning() : this.fileMetadataInfo();

       return (
        <div className="file-info-msg-box" onClick={this.clickInfoBox}>
          <div className="top-message-box">
            <span className="bold">FILE INFORMATION:</span>
            <span className="dropdown-for-file-info fonticon fonticon-down-open"></span>
          </div>
          <div className="expanded-msg">{message}</div>
        </div>
      );
    },

    previewToggle: function () {
      var buttons = [
        {labelText: 'Table', id: 'preview-toggle-a', onClick: function () { Actions.setPreviewView('table'); }, selected: true},
        {labelText: 'JSON', id: 'preview-toggle-b', onClick: function () { Actions.setPreviewView('json'); }, selected: false}
      ];

      return (
        <div id="preview-view-button">
          <div id="preview-view-button-contents">
            <span className="fonticon fonticon-eye"></span>
            <span className="text">View</span>
            <span className="fonticon fonticon-down-open"></span>
          </div>
        </div>
      );
    },

    render: function () {
      var fileInfoMessage = this.fileInfoBox();

      return (
        <div id="preview-page">
          <div id="data-import-options">
            <div className="data-import-options-top-row">
              {this.previewToggle()}
              {fileInfoMessage}
            </div>
            <OptionsRow
              getDelimiterChosen={this.props.getDelimiterChosen}
              filesize={this.props.filesize}
              disableButtons={this.props.disableButtons}
              selectedToggles={this.props.selectedToggles} />
          </div>
          <div className="preview-data-space">
            <TableView
              data={this.props.data}
              isBigFile={this.props.isBigFile}
              meta={this.props.meta}
              getPreviewView={this.props.getPreviewView}
              getSmallPreviewOfData={this.props.getSmallPreviewOfData}
              getHeaderConfig={this.props.getHeaderConfig} />
            <JSONView
              data={this.props.data}
              isBigFile={this.props.isBigFile}
              meta={this.props.meta}
              getPreviewView={this.props.getPreviewView}
              getSmallPreviewOfData={this.props.getSmallPreviewOfData}
              getHeaderConfig={this.props.getHeaderConfig} />
          </div>
          <Footer
            getAllDBs={this.props.getAllDBs}
            chunkedData={this.props.chunkedData} />
        </div>
      );
    }
  });

  var OptionsRow = React.createClass({
    getInitialState: function () {
      return {
        headerChosen: this.props.selectedToggles.headerChosen,
        showNumbersAsIntegers: this.props.selectedToggles.showNumbersAsIntegers
      };
    },

    header: function () {
      var buttons = [
        {
          labelText: 'First Line',
          id: 'header-toggle-a',
          onClick: function () {
            Actions.setParseConfig('header', true);
            this.setState({headerChosen: true});
          }.bind(this),
          selected: this.state.headerChosen
        },
        {
          labelText: 'No Header',
          id: 'header-toggle-b',
          onClick: function () {
            Actions.setParseConfig('header', false);
            this.setState({headerChosen: false});
          }.bind(this),
          selected: !this.state.headerChosen
        }
      ];

      return <Components.ToggleStateController title="Header" buttons={buttons} disabled={this.props.disableButtons} />;
    },

    numbersFormat: function () {
      var buttons = [
        {
          labelText: 'Numbers',
          id: 'numbers-format-toggle-a',
          onClick: function () {
            Actions.setParseConfig('dynamicTyping', true);
            this.setState({showNumbersAsIntegers: true});
          }.bind(this),
          selected: this.state.showNumbersAsIntegers
        },
        {
          labelText: 'Strings',
          id: 'numbers-format-toggle-b',
          onClick: function () {
            Actions.setParseConfig('dynamicTyping', false);
            this.setState({showNumbersAsIntegers: false});
          }.bind(this),
          selected: !this.state.showNumbersAsIntegers
        }
      ];

      return <Components.ToggleStateController title="Numbers are" buttons={buttons} disabled={this.props.disableButtons} />;
    },

    delimiter: function () {
      var selected = this.props.getDelimiterChosen;
      selected = selected === '' ? 'Automatic' : selected;
      selected = selected === '\t' ? 'Tab' : selected;

      var setup = {
        disabled: true,
        title: 'Delimiter',
        id: 'data-importer-delimiter',
        selected: selected,
        selectOptions: [
          {
            name: 'Automatic',
            onClick: function () {
              Actions.setParseConfig('delimiter', '');
            }
          },
          {
            name: 'Comma',
            onClick: function () {
              Actions.setParseConfig('delimiter', ',');
            }
          },
          {
            name: 'Tab',
            onClick: function () {
              Actions.setParseConfig('delimiter', '\t');
            }
          },
          {
            name: 'Semicolon',
            onClick: function () {
              Actions.setParseConfig('delimiter', ';');
            }
          },
          {
            name: 'Colon',
            onClick: function () {
              Actions.setParseConfig('delimiter', ':');
            }
          },
          {
            name: 'Hyphen',
            onClick: function () {
              Actions.setParseConfig('delimiter', '-');
            }
          },
        ]
      };
      return <Components.SmallDropdown dropdownSetup={setup} />;
    },

    renderControls: function () {
      return (
        <span>
          {this.header()}
          {this.numbersFormat()}
          {this.delimiter()}
        </span>
      );
    },

    render: function () {
      var controls = this.renderControls();

      return (
        <div className="import-options-row">
          <div className="options-row">
            {controls}
          </div>
        </div>
      );
    }
  });

  var TableView = React.createClass({
    eachRow: function () {
      var data = this.props.data;

      if (this.props.isBigFile) {
        data = this.props.getSmallPreviewOfData;
      }

      return (
        data.map(function (dataObj, i) {
          return <tr key={i}>{this.insideEachRow(dataObj)}</tr>;
        }.bind(this))
      );
    },

    insideEachRow: function (dataObj) {
      return _.map(dataObj, function (dataVal, dataKey) {
        return <td key={dataKey} title={dataVal}>{dataVal}</td>;
      });
    },

    header: function () {
      if (!_.isUndefined(this.props.meta.fields)) {
        var header = this.props.meta.fields;
        return (
          header.map(function (field, i) {
            return <th className="table-header" key={i} title={field}>{field}</th>;
          })
        );
      } else {
        var longestRow = _.max(this.props.data, function (obj) {
          return Object.keys(obj).length;
        });
        return (
          _.map(longestRow, function (field, i) {
           return <th className="table-header" key={i} title={i}>{i}</th>;
          })
        );
      }
    },

    render: function () {
      var data = this.eachRow(),
          header = this.header();

      if (this.props.getPreviewView !== 'table') {
        return null;
      }
      return (
        <table className="data-import-table">
          <tbody>
            <tr className="table-header-row">{header}</tr>
            {data}
          </tbody>
        </table>
      );
    }
  });

  var JSONView = React.createClass({
    objectify: function (array) {
      return _.reduce(array, function (obj, val, i) {
        obj[i] = val;
        return obj;
      }, {});
    },

    rows: function () {
      var data = this.props.data;

      if (this.props.isBigFile) {
        data = this.props.getSmallPreviewOfData;
      }

      return (
        data.map(function (dataObj, i) {
          var obj = this.props.getHeaderConfig ? dataObj :
            this.objectify(dataObj);
          if (i < 500) {
            return (
              <Components.SimpleDoc
                id={"<UUID>_" + i}
                content={JSON.stringify(obj, null, ' ')}
                key={i} />
            );
          }
        }.bind(this))
      );
    },

    render: function () {
      if (this.props.getPreviewView !== 'json') {
        return null;
      }

      document.getElementById('preview-page').scrollLeft = 0;

      return (
        <div id="doc-list" className="json-view">
          {this.rows()}
        </div>
      );
    }
  });

  var Footer = React.createClass({
    getInitialState: function () {
      return {
        targetDB: this.props.getAllDBs[0],
        selectExistingDB: true
      };
    },

    startOverButton: function () {
      return (
        <a className="start-import-over-link footer-button"
          onClick={this.startOver}>
          <span className="fonticon icon-repeat"></span>
            Start Over
        </a>
      );
    },

    startOver: function () {
      Actions.dataImporterInit(true);
    },

    getExistingDBList: function () {
      var allDBs = this.props.getAllDBs,
          setTargetDB = this.setTargetDB;

      return _.map(allDBs, function (dbName, i) {
        return {
          name: dbName,
          onClick: function () { setTargetDB(dbName); }
        };
      });
    },

    setTargetDB: function (dbName) {
      this.setState({ targetDB: dbName });
    },

    newOrExistingToggle : function () {
      var buttons = [{
        labelText: 'Existing database',
        id: 'load-csv-into-toggle-a',
        className: 'data-import-longer-toggle',
        onClick: function () {
          this.setState({
            selectExistingDB: true,
            targetDB: this.props.getAllDBs[0]
          });
        }.bind(this),
        selected: true
      },
      {
        labelText: 'New database',
        id: 'load-csv-into-toggle-b',
        className: 'data-import-longer-toggle',
        onClick: function () {
          this.setState({ selectExistingDB: false });
        }.bind(this),
        selected: false
      }];

      return <Components.ToggleStateController title="Load into" buttons={buttons} disabled={false} />;
    },

    chooseDatabaseFromDropdown : function () {
      var selected = this.state.targetDB;

      var setup = {
        title: 'Choose a database',
        id: 'data-importer-choose-db',
        selected: selected,
        selectOptions: this.getExistingDBList()
      };
      return <Components.SmallDropdown dropdownSetup={setup} />;
    },

    createNewDB: function () {
      return (
        <div id="data-import-name-new-target-database">
          <h1 id="title">Name New Database</h1>
          <input
            id="type-new-db-name-here"
            type="text"
            placeholder="Type new database name..."
            value={this.state.newDatabaseName}
            onChange={this.newDatabaseNameChange} />
        </div>
      );
    },

    newDatabaseNameChange: function (e) {
      var newName = e.target.value;
      this.setState({ targetDB : newName });
    },

    importButton: function () {
      return (
        <div id="data-import-load-button"
          className="footer-button data-import-load-button"
          onClick={ this.importData } >
          <span className="icon-download-alt fonticon"></span>
          Load
        </div>
      );
    },

    importData : function () {
      var createNewDB = !this.state.selectExistingDB;
      Actions.loadDataIntoDatabase(createNewDB, this.state.targetDB, this.props.chunkedData);
    },

    render: function () {
      var startOverButton = this.startOverButton(),
          targetDatabaseInput = this.state.selectExistingDB ?
        this.chooseDatabaseFromDropdown() : this.createNewDB();

      return (
        <div id="preview-page-footer-container">
          <div id="data-import-controls">
            {this.newOrExistingToggle()}
            {targetDatabaseInput}
            <div className="restart-or-load">
              {startOverButton}
              {this.importButton()}
            </div>
          </div>
        </div>
      );
    }
  });

  var DataImporterError = React.createClass({
    makeMessage: function () {
      var messagesArray = this.props.errorMsg;

      return messagesArray.map(function (message, i) {
        return (
          <div key={i}>
            <hr/>
            {this.subMessages(message)}
          </div>
        );
      }.bind(this));
    },

    subMessages: function (messages) {
      return messages.map(function (msg, i) {
        return <pre key={i}>{msg}</pre>;
      });
    },

    startOverButton: function () {
      return (
        <a className="start-import-over-link footer-button"
          onClick={this.startOver}>
          <span className="fonticon icon-repeat"></span>
            Start Over
        </a>
      );
    },

    startOver: function () {
      Actions.dataImporterInit(true);
    },

    render: function () {
      return (
        <div className="dropzone">
          <div className="error-window pretty-print">
            Errors:
            {this.makeMessage()}
          </div>
          {this.startOverButton()}
        </div>
      );
    }
  });

  return {
    DataImporterController: DataImporterController,
    DataImporterDropZone: DataImporterDropZone,
    DataImporterPreviewData: DataImporterPreviewData,
    DataImporterLoading: DataImporterLoading,
    DataImporterError: DataImporterError
  };
});
