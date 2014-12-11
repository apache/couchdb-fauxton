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
  'addons/fauxton/components',
  'addons/documents/resources',
  'addons/databases/resources',

  // Plugins
  'plugins/prettify'
],

function (app, FauxtonAPI, Components, Documents, Databases, prettify) {

  var Views = {};

  Views.UploadModal = Components.ModalView.extend({
    template: 'addons/documents/templates/upload_modal',

    events: {
      'click #upload-btn': 'uploadFile'
    },

    uploadFile: function (event) {
      event.preventDefault();

      var docRev = this.model.get('_rev'),
          that = this,
          $form = this.$('#file-upload');

      if (!docRev) {
        return this.set_error_msg('The document needs to be saved before adding an attachment.');
      }

      if ($('input[type="file"]')[0].files.length === 0) {
        return this.set_error_msg('Selected a file to be uploaded.');
      }

      this.$('#_rev').val(docRev);

      $form.ajaxSubmit({
        url: this.model.url(),
        type: 'POST',
        beforeSend: this.beforeSend,
        uploadProgress: this.uploadProgress,
        success: this.success,
        error: function (resp) {
          console.log('ERR on upload', resp);
          return that.set_error_msg('Could not upload document: ' + JSON.parse(resp.responseText).reason);
        }
      });
    },

    success: function (resp) {
      var hideModal = this.hideModal,
          $form = this.$('#file-upload');

      FauxtonAPI.triggerRouteEvent('reRenderDoc');
      //slight delay to make this transistion a little more fluid and less jumpy
      setTimeout(function () {
        $form.clearForm();
        hideModal();
        $('.modal-backdrop').remove();
      }, 1000);
    },

    uploadProgress: function (event, position, total, percentComplete) {
      this.$('.bar').css({width: percentComplete + '%'});
    },

    beforeSend: function () {
      this.$('.progress').removeClass('hide');
    },

    _showModal: function () {
      this.$('.bar').css({width: '0%'});
      this.$('.progress').addClass('hide');
    }
  });

  Views.StringEditModal = Components.ModalView.extend({
    template: 'addons/documents/templates/string_edit_modal',

    initialize: function () {
      _.bindAll(this);
    },

    events: {
      'click #string-edit-save-btn': 'saveString'
    },

    saveString: function (event) {
      event.preventDefault();
      var newStr = this.subEditor.getValue();
      this.subEditor.editSaved();
      this.editor.replaceCurrentLine(this.indent + this.hashKey + JSON.stringify(newStr) + this.comma + '\n');
      this.hideModal();
    },

    _showModal: function () {
      this.$('.bar').css({width: '0%'});
      this.$('.progress').addClass('hide');
      this.clear_error_msg();
    },

    openWin: function (editor, indent, hashKey, jsonString, comma) {
      this.editor = editor;
      this.indent = indent;
      this.hashKey = hashKey;
      this.$('#string-edit-header').text(hashKey);
      this.subEditor.setValue(JSON.parse(jsonString));
      /* make sure we don't have save warnings w/out change */
      this.subEditor.editSaved();
      this.comma = comma;
      this.showModal();
    },

    afterRender: function () {
      /* make sure we init only ONCE */
      if (!this.subEditor) {
        this.subEditor = new Components.Editor({
          editorId: 'string-editor-container',
          mode: 'plain'
        });

        this.subEditor.render().promise().then(function () {
        /* optimize by disabling auto sizing (35 is the lines fitting into the pop-up) */
          this.subEditor.configureFixedHeightEditor(35);
        }.bind(this));
      }
    },

    cleanup: function () {
      if (this.subEditor) { this.subEditor.remove(); }
    }

  });

  /* Doc Duplication modal */
  Views.DuplicateDocModal = Components.ModalView.extend({
    template: 'addons/documents/templates/duplicate_doc_modal',

    initialize: function () {
      _.bindAll(this);
    },

    events: {
      'click #duplicate-btn':'duplicate',
      'submit #doc-duplicate': 'duplicate'
    },

    duplicate: function (event) {
      event.preventDefault();
      var newId = this.$('#dup-id').val(),
          isDDoc = newId.match(/^_design\//),
          removeDDocID = newId.replace(/^_design\//,''),
          encodedID = isDDoc? '_design/'+ app.utils.safeURLName(removeDDocID):app.utils.safeURLName(newId);

      this.hideModal();
      FauxtonAPI.triggerRouteEvent('duplicateDoc', encodedID);
    },

    _showModal: function () {
      this.$('.bar').css({width: '0%'});
      this.$('.progress').addClass('hide');
      this.clear_error_msg();
      this.$('.modal').modal();
      // hack to get modal visible
      $('.modal-backdrop').css('z-index',1025);
    },

    showModal: function () {
      var showModal = this._showModal,
          setDefaultIdValue = this.setDefaultIdValue,
          uuid = new FauxtonAPI.UUID();

      uuid.fetch().then(function () {
        setDefaultIdValue(uuid.next());
        showModal();
      });
    },

    setDefaultIdValue: function (id) {
      this.$('#dup-id').val(id);
    }
  });

  Views.CodeEditor = FauxtonAPI.View.extend({
    template: 'addons/documents/templates/code_editor',
    className: 'editor-content-page',
    events: {
      'click button.save-doc': 'saveDoc',
      'click button.delete': 'destroy',
      'click button.duplicate': 'duplicate',
      'click button.upload': 'upload',
      'click button.string-edit': 'stringEditing',
      'click a.js-back': 'onClickGoBack',
      'click .scrollable': 'focusOnLastLine'
    },

    disableLoader: true,

    initialize: function (options) {
      this.database = options.database;
      _.bindAll(this);
    },

    onClickGoBack: function (e) {
      e.preventDefault();
      e.stopPropagation();

      this.goBack();
    },

    goBack: function () {
      FauxtonAPI.navigate(this.previousPage);
    },

    destroy: function () {
      if (this.model.isNewDoc()) {
        FauxtonAPI.addNotification({
          msg: 'This document has not been saved yet.',
          type: 'warning',
          clear: true
        });
        return;
      }
      this.confirmDeleteModal.showModal();
    },

    deleteDocument: function () {
      var database = this.model.database;

      this.model.destroy().then(function () {
        FauxtonAPI.addNotification({
          msg: 'Your document has been successfully deleted.',
          clear: true
        });
        FauxtonAPI.navigate(database.url('index'));
      }, function () {
        FauxtonAPI.addNotification({
          msg: 'Failed to delete your document!',
          type: 'error',
          clear: true
        });
      });
    },

    upload: function (e) {
      e.preventDefault();
      if (this.model.isNewDoc()) {
        FauxtonAPI.addNotification({
          msg: 'Please save the document before uploading an attachment.',
          type: 'warning',
          clear: true
        });
        return;
      }
      this.uploadModal.showModal();
    },

    duplicate: function (e) {
      if (this.model.isNewDoc()) {
        FauxtonAPI.addNotification({
          msg: 'Please save the document before duplicating it.',
          type: 'warning',
          clear: true
        });
        return;
      }
      e.preventDefault();
      this.duplicateModal.showModal();
    },

    saveDoc: function (event) {
      var that = this,
        editor = this.editor,
        validDoc = this.getDocFromEditor();

      if (validDoc) {
        FauxtonAPI.addNotification({msg: 'Saving document.'});

        this.model.save().then(function () {
          editor.editSaved();
          FauxtonAPI.navigate('/database/' + that.database.safeID() + '/' + that.model.id);
        }).fail(function (xhr) {
          var responseText = JSON.parse(xhr.responseText).reason;
          FauxtonAPI.addNotification({
            msg: 'Save failed: ' + responseText,
            type: 'error',
            fade: false,
            clear: true
          });
        });
      } else if(this.model.validationError && this.model.validationError === 'Cannot change a documents id.') {
        FauxtonAPI.addNotification({
          msg: 'Cannot save. Cannot change a documents _id, try Clone Document instead!',
          type: 'error',
          clear:  true
        });
        delete this.model.validationError;
      } else {
        FauxtonAPI.addNotification({
          msg: 'Please fix the JSON errors and try saving again.',
          type: 'error',
          clear:  true
        });
      }
    },

    getDocFromEditor: function () {
      if (!this.hasValidCode()) {
        return false;
      }
      var json = JSON.parse(this.editor.getValue());
      this.model.clear().set(json, {validate: true});
      if (this.model.validationError) {
        return false;
      }
      return this.model;
    },

    beforeRender: function () {
      this.uploadModal = this.setView('#upload-modal', new Views.UploadModal({ model: this.model }));
      this.duplicateModal = this.setView('#duplicate-modal', new Views.DuplicateDocModal({ model: this.model }));
      this.confirmDeleteModal = this.setView('#delete-doc-modal', new Components.ConfirmationModal({
        text: 'Are you sure you want to delete this document?',
        action: this.deleteDocument
      }));

      // ensures it's initialized only once
      this.stringEditModal = this.stringEditModal || this.setView('#string-edit-modal', new Views.StringEditModal());
    },

    updateValues: function () {
      if (this.model.changedAttributes()) {
        FauxtonAPI.addNotification({
          msg: 'Document saved successfully.',
          type: 'success',
          clear: true
        });
        this.editor.setValue(this.model.prettyJSON());
      }
    },

    establish: function () {
      var promise = this.model.fetch(),
          deferred = $.Deferred(),
          goBack = _.bind(this.goBack, this);

      promise.then(function () {
        deferred.resolve();
      }, function (xhr, reason, msg) {
        if (xhr.status === 404) {
          FauxtonAPI.addNotification({
            msg: 'The document does not exist',
            type: 'error',
            clear: true
          });
          goBack();
        }
        deferred.reject();
     });

      return deferred;
    },

    hasValidCode: function () {
      var errors = this.editor.getAnnotations();
      return errors.length === 0;
    },

    afterRender: function () {
      this.listenTo(this.model, 'sync', this.updateValues);
      this.editor = new Components.Editor({
        editorId: 'editor-container',
        forceMissingId: true,
        commands: [{
          name: 'save',
          bindKey: {win: 'Ctrl-S',  mac: 'Ctrl-S'},
          exec: function (editor) {
            this.saveDoc();
          },
          readOnly: true // false if this command should not apply in readOnly mode
        }]
      });

      this.editor.render();

      var editor = this.editor;
      var model = this.model;

      // only start listening to editor once it has been rendered
      this.editor.promise().then(function () {

        this.listenTo(editor.editor, 'change', function (event) {
          var changedDoc;
          try {
            changedDoc = JSON.parse(editor.getValue());
          } catch (exception) {
            //not complete doc. Cannot work with it
            return;
          }

          var keyChecked = ['_id'];
          if (model.get('_rev')) {
            keyChecked.push('_rev');
          }

          // check the changedDoc has all the required standard keys
          if (_.isEmpty(_.difference(keyChecked, _.keys(changedDoc)))) {
            return;
          }

          editor.setReadOnly(true);
          setTimeout(function () { editor.setReadOnly(false) ;}, 400);

          // use extend so that _id stays at the top of the object with displaying the doc
          changedDoc = _.extend({_id: model.id, _rev: model.get('_rev')}, changedDoc);
          editor.setValue(JSON.stringify(changedDoc, null, '  '));
          FauxtonAPI.addNotification({
            type: 'error',
            msg: "Cannot remove a document's id or revision.",
            clear: true
          });
        });

        var showHideEditDocString = _.bind(this.showHideEditDocString, this);
        this.listenTo(editor.editor, 'changeSelection', function (event) {
          showHideEditDocString(event);
        });
        this.listenTo(editor.editor.session, 'changeBackMarker', function (event) {
          showHideEditDocString(event);
        });

        // place focus on the editor
        editor.editor.focus();

      }.bind(this));
    },

    focusOnLastLine: function (e) {
      var clickedInEditor = $(e.target).closest('#editor-container');
      if (clickedInEditor.length === 0) {
        this.editor.editor.focus();
        var session = this.editor.editor.getSession();
        var count = session.getLength();
        this.editor.editor.gotoLine(count, session.getLine(count-1).length);
      }
    },

    serialize: function () {
      return {
        doc: this.model,
        attachments: this.getAttachments()
      };
    },

    getAttachments: function () {
      var attachments = this.model.get('_attachments');
      if (!attachments) { return false; }

      return _.map(attachments, function (att, key) {
        return {
          fileName: key,
          size: att.length,
          contentType: att.content_type,
          url: this.model.url() + '/' + app.utils.safeURLName(key)
        };
      }, this);
    },

    determineStringEditMatch: function (event) {
      var selStart = this.editor.getSelectionStart().row;
      var selEnd = this.editor.getSelectionEnd().row;

      // one JS(ON) string can't span more than one line - we edit one string, so ensure we don't select several lines
      if (selStart >=0 && selEnd >= 0 && selStart === selEnd && this.editor.isRowExpanded(selStart)) {
        var editLine = this.editor.getLine(selStart),
            editMatch = editLine.match(/^([ \t]*)(["|'][a-zA-Z0-9_]*["|']: )?(["|'].*["|'],?[ \t]*)$/);

        if (editMatch) {
          return editMatch;
        }
      }
      return null;
    },

    showHideEditDocString: function (event) {
      this.$('button.string-edit').attr('disabled', 'true');
      if (!this.hasValidCode()) {
        return false;
      }
      var editMatch = this.determineStringEditMatch(event);
      if (editMatch) {
        this.$('button.string-edit').removeAttr('disabled');
        /* remove the following line (along with CSS) to go back to the toolbar: take the offset top of the editor, go down as many lines as we are positioned including fold and adjust by two pixels as the button is slightly larger than a line */
        var positionFromTop = (this.$('#editor-container').offset().top - 2 + this.editor.getRowHeight() * this.editor.documentToScreenRow(this.editor.getSelectionStart().row)) - 62;
        this.$('button.string-edit').css('top', positionFromTop + 'px');
        return true;
      }
      return false;
    },

    stringEditing: function (event) {
      event.preventDefault();
      if (!this.hasValidCode()) {
        return;
      }
      var editMatch = this.determineStringEditMatch(event);
      if (editMatch) {
        var indent = editMatch[1] || '',
          hashKey = editMatch[2] || '',
          editText = editMatch[3],
          comma = '';
        if (editText.substring(editText.length - 1) === ',') {
          editText = editText.substring(0, editText.length - 1);
          comma = ',';
        }
        this.stringEditModal.openWin(this.editor, indent, hashKey, editText, comma);
      }
    },

    cleanup: function () {
      this.editor && this.editor.remove();
      $('#dashboard').off('click');
    }
  });


  Views.StringEditModal = Components.ModalView.extend({
    template: 'addons/documents/templates/string_edit_modal',

    events: {
      'click #string-edit-save-btn': 'saveString'
    },

    saveString: function (event) {
      event.preventDefault();
      var newStr = this.subEditor.getValue();
      this.subEditor.editSaved();
      this.editor.replaceCurrentLine(this.indent + this.hashKey + JSON.stringify(newStr) + this.comma + '\n');
      this.hideModal();
    },

    _showModal: function () {
      this.$('.bar').css({width: '0%'});
      this.$('.progress').addClass('hide');
      this.clear_error_msg();
    },

    openWin: function (editor, indent, hashKey, jsonString, comma) {
      this.editor = editor;
      this.indent = indent;
      this.hashKey = hashKey;
      this.$('#string-edit-header').text(hashKey);
      this.subEditor.setValue(JSON.parse(jsonString));
      /* make sure we don't have save warnings w/out change */
      this.subEditor.editSaved();
      this.comma = comma;
      this.showModal();
    },

    afterRender: function () {
      /* make sure we init only ONCE */
      if (!this.subEditor) {
        this.subEditor = new Components.Editor({
          editorId: 'string-editor-container',
          mode: 'plain'
        });

        this.subEditor.render().promise().then(function () {
          /* optimize by disabling auto sizing (35 is the lines fitting into the pop-up) */
          this.subEditor.configureFixedHeightEditor(35);
        }.bind(this));
      }
    },

    cleanup: function () {
      if (this.subEditor) { this.subEditor.remove(); }
    }
  });


  return Views;
});
