define([
  'api',
  'app',
  'react',
  'addons/documents/doc-editor/actions',
  'addons/documents/doc-editor/stores',
  'addons/fauxton/components.react',
  'addons/components/react-components.react',
  'helpers'
], function (FauxtonAPI, app, React, Actions, Stores, FauxtonComponents, GeneralComponents, Helpers) {

  var store = Stores.docEditorStore;


  var DocEditorController = React.createClass({

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        isLoading: store.isLoading(),
        doc: store.getDoc(),
        cloneDocModalVisible: store.isCloneDocModalVisible(),
        uploadModalVisible: store.isUploadModalVisible(),
        deleteDocModalVisible: store.isDeleteDocModalVisible(),
        numFilesUploaded: store.getNumFilesUploaded()
      };
    },

    getDefaultProps: function () {
      return {
        database: {},
        previousPage: '',
        isNewDoc: false
      };
    },

    getCodeEditor: function () {
      if (this.state.isLoading) {
        return (<GeneralComponents.LoadLines />);
      }

      var code = JSON.stringify(this.state.doc.attributes, null, '  ');
      var editorCommands = [{
        name: 'save',
        bindKey: { win: 'Ctrl-S', mac: 'Ctrl-S' },
        exec: this.saveDoc
      }];

      return (
        <GeneralComponents.CodeEditor
          id="doc-editor"
          ref="docEditor"
          defaultCode={code}
          mode="json"
          autoFocus={true}
          editorCommands={editorCommands}
          notifyUnsavedChanges={true}
          stringEditModalEnabled={true} />
      );
    },

    componentDidMount: function () {
      store.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      store.off('change', this.onChange);
    },

    // whenever a file is uploaded, reset the editor
    componentWillUpdate: function (nextProps, nextState) {
      if (this.state.numFilesUploaded !== nextState.numFilesUploaded) {
        this.getEditor().setValue(JSON.stringify(nextState.doc.attributes, null, '  '));
      }
    },

    onChange: function () {
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    saveDoc: function () {
      Actions.saveDoc(this.state.doc, this.checkDocIsValid(), this.onSaveComplete);
    },

    onSaveComplete: function (json) {
      this.getEditor().setValue(json);
      this.getEditor().clearChanges();

      // the save action updates the doc. This ensures the button row then shows the appropriate buttons
      this.forceUpdate();
    },

    hideDeleteDocModal: function () {
      Actions.hideDeleteDocModal();
    },

    deleteDoc: function () {
      Actions.hideDeleteDocModal();
      Actions.deleteDoc(this.state.doc);
    },

    getEditor: function () {
      return (this.refs.docEditor) ? this.refs.docEditor.getEditor() : null;
    },

    checkDocIsValid: function () {
      if (this.getEditor().hasErrors()) {
        return false;
      }
      var json = JSON.parse(this.getEditor().getValue());
      this.state.doc.clear().set(json, { validate: true });

      return !this.state.doc.validationError;
    },

    clearChanges: function () {
      this.refs.docEditor.clearChanges();
    },

    getExtensionIcons: function () {
      var extensions = FauxtonAPI.getExtensions('DocEditor:icons');
      return _.map(extensions, function (Extension, i) {
        return (<Extension doc={this.state.doc} key={i} database={this.props.database} />);
      }, this);
    },

    getButtonRow: function () {
      if (this.props.isNewDoc) {
        return false;
      }
      return (
        <div>
          <AttachmentsPanelButton doc={this.state.doc} isLoading={this.state.isLoading} />
          <div className="doc-editor-extension-icons">{this.getExtensionIcons()}</div>
          <PanelButton title="Upload Attachment" iconClass="icon-circle-arrow-up" onClick={Actions.showUploadModal} />
          <PanelButton title="Clone Document" iconClass="icon-repeat" onClick={Actions.showCloneDocModal} />
          <PanelButton title="Delete" iconClass="icon-trash" onClick={Actions.showDeleteDocModal} />
        </div>
      );
    },

    render: function () {
      return (
        <div>
          <div id="doc-editor-actions-panel">
            <div className="doc-actions-left">
              <button className="save-doc btn btn-success save" type="button" onClick={this.saveDoc}>
                <i className="icon fonticon-ok-circled"></i> Save
              </button>
              <div>
                <a href={this.props.previousPage} className="js-back cancel-button">Cancel</a>
              </div>
            </div>
            <div className="alignRight">
              {this.getButtonRow()}
            </div>
          </div>

          <div className="code-region">
            <div className="bgEditorGutter"></div>
            <div id="editor-container" className="doc-code">{this.getCodeEditor()}</div>
          </div>

          <UploadModal
            ref="uploadModal"
            visible={this.state.uploadModalVisible}
            doc={this.state.doc} />
          <CloneDocModal
            visible={this.state.cloneDocModalVisible}
            onSubmit={this.clearChanges} />
          <FauxtonComponents.ConfirmationModal
            visible={this.state.deleteDocModalVisible}
            text="Are you sure you want to delete this document?"
            onClose={this.hideDeleteDocModal}
            onSubmit={this.deleteDoc} />
        </div>
      );
    }
  });

  var AttachmentsPanelButton = React.createClass({

    propTypes: {
      isLoading: React.PropTypes.bool.isRequired,
      doc: React.PropTypes.object
    },

    getDefaultProps: function () {
      return {
        isLoading: true,
        doc: {}
      };
    },

    getAttachmentList: function () {
      var docBaseURL = this.props.doc.url();
      return _.map(this.props.doc.get('_attachments'), function (item, filename) {
        var url = docBaseURL + '/' + app.utils.safeURLName(filename);
        return (
          <li key={filename}>
            <a href={url} target="_blank" data-bypass="true"> <strong>{filename}</strong> -
              <span>{item.content_type}, {Helpers.formatSize(item.length)}</span>
            </a>
          </li>
        );
      });
    },

    render: function () {
      if (this.props.isLoading || !this.props.doc.get('_attachments')) {
        return false;
      }

      return (
        <div className="panel-section view-attachments-section btn-group">
          <button className="panel-button dropdown-toggle btn" data-bypass="true" data-toggle="dropdown" title="View Attachments"
            id="view-attachments-menu">
            <i className="icon fonticon-picture"></i>
            <span>View Attachments</span>{' '}
            <span className="caret"></span>
          </button>
          <ul className="dropdown-menu" role="menu" aria-labelledby="view-attachments-menu">
            {this.getAttachmentList()}
          </ul>
        </div>
      );
    }
  });


  var PanelButton = React.createClass({
    propTypes: {
      title: React.PropTypes.string.isRequired,
      onClick: React.PropTypes.func.isRequired
    },

    getDefaultProps: function () {
      return {
        title: '',
        iconClass: '',
        onClick: function () { }
      };
    },

    render: function () {
      var iconClasses = 'icon ' + this.props.iconClass;
      return (
        <div className="panel-section">
          <button className="panel-button upload" title={this.props.title} onClick={this.props.onClick}>
            <i className={iconClasses}></i>
            <span>{this.props.title}</span>
          </button>
        </div>
      );
    }
  });


  var UploadModal = React.createClass({
    propTypes: {
      visible: React.PropTypes.bool.isRequired,
      doc: React.PropTypes.object
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        inProgress: store.isUploadInProgress(),
        loadPercentage: store.getUploadLoadPercentage(),
        errorMessage: store.getFileUploadErrorMsg()
      };
    },

    componentDidUpdate: function () {
      var params = (this.props.visible) ? { show: true, backdrop: 'static', keyboard: true } : 'hide';
      $(React.findDOMNode(this)).modal(params);
    },

    // ensure that if the user clicks ESC to close the window, the store gets wind of it
    componentDidMount: function () {
      $(React.findDOMNode(this)).on('hidden.bs.modal', function () {
        Actions.hideUploadModal();
      });
    },

    componentWillUnmount: function () {
      $(React.findDOMNode(this)).off('hidden.bs.modal');
    },

    closeModal: function () {
      if (this.state.inProgress) {
        Actions.cancelUpload();
      }
      Actions.hideUploadModal();

      // timeout needed to only clear it once the animate close effect is done, otherwise the user sees it reset
      // as it closes, which looks bad
      setTimeout(function () {
        Actions.resetUploadModal();
        React.findDOMNode(this.refs.uploadForm).reset();
      }.bind(this), 1000);
    },

    upload: function () {
      Actions.uploadAttachment({
        doc: this.props.doc,
        rev: this.props.doc.get('_rev'),
        files: $(React.findDOMNode(this.refs.attachments))[0].files
      });
    },

    render: function () {
      var errorClasses = 'alert alert-error';
      if (this.state.errorMessage === '') {
        errorClasses += ' hide';
      }
      var loadIndicatorClasses = 'progress progress-info';
      if (!this.state.inProgress) {
        loadIndicatorClasses += ' hide';
      }

      return (
        <div className="modal hide fade upload-file-modal" tabIndex="-1" data-js-visible={this.props.visible}>
          <div className="modal-header">
            <button type="button" className="close" onClick={this.closeModal} aria-hidden="true">&times;</button>
            <h3>Upload Attachment</h3>
          </div>
          <div className="modal-body">
            <div className={errorClasses}>{this.state.errorMessage}</div>

            <div>
              <form ref="uploadForm" className="form" method="post">
                <p>
                  Please select the file you want to upload as an attachment to this document. This creates a new
                  revision of the document, so it's not necessary to save after uploading.
                </p>
                <input ref="attachments" type="file" name="_attachments" />
                <br />
              </form>

              <div ref="loadIndicator" className={loadIndicatorClasses}>
                <div className="bar" style={{ width: this.state.loadPercentage + '%'}}></div>
              </div>
            </div>

          </div>
          <div className="modal-footer">
             <button href="#" data-bypass="true" className="btn" onClick={this.closeModal}>
              <i className="icon fonticon-cancel-circled"></i> Cancel
            </button>
            <button href="#" id="upload-btn" data-bypass="true" className="btn btn-success save" onClick={this.upload}>
              <i className="icon fonticon-ok-circled"></i> Upload
            </button>
          </div>
        </div>
      );
    }
  });


  var CloneDocModal = React.createClass({
    propTypes: {
      visible: React.PropTypes.bool.isRequired
    },

    getInitialState: function () {
      return {
        uuid: null
      };
    },

    cloneDoc: function () {
      if (this.props.onSubmit) {
        this.props.onSubmit();
      }
      Actions.cloneDoc(this.state.uuid);
    },

    componentDidUpdate: function () {
      if (this.state.uuid === null) {
        var uuid = new FauxtonAPI.UUID();
        uuid.fetch().then(function () {
          this.setState({ uuid: uuid.next() });
        }.bind(this));
        return;
      }

      var params = (this.props.visible) ? { show: true, backdrop: 'static', keyboard: true } : 'hide';
      $(React.findDOMNode(this)).modal(params);
      this.clearEvents();

      // ensure that if the user clicks ESC to close the window, the store gets wind of it
      $(React.findDOMNode(this)).on('hidden.bs.modal', function () {
        Actions.hideCloneDocModal();
      });

      $(React.findDOMNode(this)).on('shown.bs.modal', function () {
        this.focus();
      }.bind(this));
    },

    focus: function () {
      $(React.findDOMNode(this.refs.newDocId)).focus();
    },

    componentWillUnmount: function () {
      this.clearEvents();
    },

    clearEvents: function () {
      if (this.refs.newDocId) {
        $(React.findDOMNode(this.refs.newDocId)).off('shown.bs.modal hidden.bs.modal');
      }
    },

    closeModal: function () {
      Actions.hideCloneDocModal();
    },

    docIDChange: function (e) {
      this.setState({ uuid: e.target.value });
    },

    render: function () {
      if (this.state.uuid === null) {
        return false;
      }

      return (
        <div className="modal hide fade clone-doc-modal" data-js-visible={this.props.visible} tabIndex="-1">
          <div className="modal-header">
            <button type="button" className="close" onClick={this.closeModal} aria-hidden="true">&times;</button>
            <h3>Clone Document</h3>
          </div>
          <div className="modal-body">
            <form className="form" method="post">
              <p>
                Set new document's ID:
              </p>
              <input ref="newDocId" type="text" className="input-block-level" onChange={this.docIDChange} value={this.state.uuid} />
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={this.closeModal}>
              <i className="icon fonticon-cancel-circled"></i> Cancel
            </button>
            <button className="btn btn-success save" onClick={this.cloneDoc}>
              <i className="fonticon-ok-circled"></i> Clone
            </button>
          </div>
        </div>
      );
    }
  });


  return {
    DocEditorController: DocEditorController,
    AttachmentsPanelButton: AttachmentsPanelButton,
    UploadModal: UploadModal,
    CloneDocModal: CloneDocModal
  };

});
