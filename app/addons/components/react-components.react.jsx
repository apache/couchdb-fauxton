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
  'react',
  'addons/components/stores',
  'addons/fauxton/components.react',
  'ace/ace',
  'plugins/beautify',
  'libs/react-bootstrap'
],

function (app, FauxtonAPI, React, Stores, FauxtonComponents, ace, beautifyHelper, ReactBootstrap) {

  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
  var componentStore = Stores.componentStore;


  var ToggleHeaderButton = React.createClass({
    getDefaultProps: function () {
      return {
        innerClasses: '',
        fonticon: '',
        containerClasses: '',
        selected: false,
        title: '',
        disabled: false,
        toggleCallback: null,
        text: ''
      };
    },

    render: function () {
      var iconClasses = 'icon ' + this.props.fonticon + ' ' + this.props.innerClasses,
          containerClasses = 'button ' + this.props.containerClasses;

      if (this.props.selected) {
        containerClasses = containerClasses + ' js-headerbar-togglebutton-selected';
      }

      return (
        <button
          title={this.props.title}
          disabled={this.props.disabled}
          onClick={this.props.toggleCallback}
          className={containerClasses}
          >
          <i className={iconClasses}></i><span>{this.props.text}</span>
        </button>
      );
    }
  });


  var BulkActionComponent = React.createClass({

    propTypes: {
      hasSelectedItem: React.PropTypes.bool.isRequired,
      removeItem: React.PropTypes.func.isRequired,
      selectAll: React.PropTypes.func.isRequired,
      toggleSelect: React.PropTypes.func.isRequired,
      isChecked: React.PropTypes.bool.isRequired
    },

    getDefaultProps: function () {
      return {
        disabled: false,
        title: 'Select rows that can be...',
        bulkIcon: 'fonticon-trash',
        buttonTitle: 'Delete all selected',
        dropdownContentText: 'Deleted',
        enableOverlay: false
      };
    },

    render: function () {
      return (
        <div className="bulk-action-component">
          <div className="bulk-action-component-selector-group">
            {this.getMasterSelector()}
            {this.getMultiSelectOptions()}
          </div>
        </div>
      );
    },

    getMultiSelectOptions: function () {
      if (!this.props.hasSelectedItem) {
        return null;
      }

      return (
        <button
          onClick={this.props.removeItem}
          className={'fonticon ' + this.props.bulkIcon}
          title={this.props.buttonTitle} />
      );
    },

    getPopupContent: function () {
      return (
        <ul className="bulk-action-component-popover-actions">
          <li onClick={this.selectAll} >
            <i className="icon fonticon-cancel"></i> {this.props.dropdownContentText}
          </li>
        </ul>
      );
    },

    selectAll: function () {
      this.refs.bulkActionPopover.hide();
      this.props.selectAll();
    },

    getOverlay: function () {
      return (
        <ReactBootstrap.OverlayTrigger
          ref="bulkActionPopover"
          trigger="click"
          placement="bottom"
          rootClose={true}
          overlay={
            <ReactBootstrap.Popover id="bulk-action-component-popover" title={this.props.title}>
              {this.getPopupContent()}
            </ReactBootstrap.Popover>
          }>
          <div className="arrow-button">
            <i className="fonticon fonticon-play"></i>
          </div>
        </ReactBootstrap.OverlayTrigger>
      );
    },

    getMasterSelector: function () {
      return (
        <div className="bulk-action-component-panel">
          <input type="checkbox"
            checked={this.props.isChecked}
            onChange={this.props.toggleSelect}
            disabled={this.props.disabled} />
          {this.props.enableOverlay ? <div className="separator"></div> : null}
          {this.props.enableOverlay ? this.getOverlay() : null}
        </div>
      );
    },

  });

  var StyledSelect = React.createClass({
    render: function () {
      return (
        <div className="styled-select">
          <label htmlFor={this.props.selectId}>
            <i className="fonticon-down-dir"></i>
            <select
              value={this.props.selectValue}
              id={this.props.selectId}
              className={this.props.selectValue}
              onChange={this.props.selectChange}
            >
              {this.props.selectContent}
            </select>
          </label>
        </div>
      );
    }
  });


  /**
   * A pre-packaged JS editor panel for use on the Edit Index / Mango pages. Includes options for a title, zen mode
   * icon and beautify button.
   */
  var CodeEditorPanel = React.createClass({
    getDefaultProps: function () {
      return {
        id: 'code-editor',
        className: '',
        defaultCode: '',
        title: '',
        docLink: '',
        allowZenMode: true,
        blur: function () {}
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        zenModeEnabled: false,
        code: this.props.defaultCode
      };
    },

    componentWillReceiveProps: function (nextProps) {
      if (nextProps.defaultCode !== this.props.defaultCode) {
        this.setState({ code: nextProps.defaultCode });
      }
    },

    // list of JSHINT errors to ignore: gets around problem of anonymous functions not being valid
    ignorableErrors: [
      'Missing name in function declaration.',
      "['{a}'] is better written in dot notation."
    ],

    getZenModeIcon: function () {
      if (this.props.allowZenMode) {
        return <span className="fonticon fonticon-resize-full zen-editor-icon" title="Enter Zen mode" onClick={this.enterZenMode}></span>;
      }
    },

    getDocIcon: function () {
      if (this.props.docLink) {
        return (
          <a className="help-link"
            data-bypass="true"
            href={this.props.docLink}
            target="_blank"
          >
            <i className="icon-question-sign"></i>
          </a>
        );
      }
    },

    getZenModeOverlay: function () {
      if (this.state.zenModeEnabled) {
        return (
          <ZenModeOverlay
            defaultCode={this.state.code}
            mode={this.props.mode}
            ignorableErrors={this.ignorableErrors}
            onExit={this.exitZenMode} />
        );
      }
    },

    enterZenMode: function () {
      this.setState({
        zenModeEnabled: true,
        code: this.refs.codeEditor.getValue()
      });
    },

    exitZenMode: function (content) {
      this.setState({ zenModeEnabled: false });
      this.getEditor().setValue(content);
    },

    getEditor: function () {
      return this.refs.codeEditor;
    },

    getValue: function () {
      return this.getEditor().getValue();
    },

    beautify: function (code) {
      this.setState({ code: code });
    },

    update: function () {
      this.getEditor().setValue(this.state.code);
    },

    render: function () {
      var classes = 'control-group';
      if (this.props.className) {
        classes += ' ' + this.props.className;
      }
      return (
        <div className={classes}>
          <label>
            <strong>{this.props.title + ' '}</strong>
            {this.getDocIcon()}
            {this.getZenModeIcon()}
          </label>
          <CodeEditor
            id={this.props.id}
            ref="codeEditor"
            mode="javascript"
            defaultCode={this.state.code}
            showGutter={true}
            ignorableErrors={this.ignorableErrors}
            setHeightToLineCount={true}
            blur={this.props.blur}
          />
          <Beautify code={this.state.code} beautifiedCode={this.beautify} />
          {this.getZenModeOverlay()}
        </div>
      );
    }
  });


  var CodeEditor = React.createClass({
    getDefaultProps: function () {
      return {
        id: 'code-editor',
        mode: 'javascript',
        theme: 'idle_fingers',
        fontSize: 13,

        // this sets the default value for the editor. On the fly changes are stored in state in this component only. To
        // change the editor content after initial construction use CodeEditor.setValue()
        defaultCode: '',

        showGutter: true,
        highlightActiveLine: true,
        showPrintMargin: false,
        autoScrollEditorIntoView: true,
        autoFocus: false,
        stringEditModalEnabled: false,

        // these two options create auto-resizeable code editors, with a maximum number of lines
        setHeightToLineCount: false,
        maxLines: 10,

        // optional editor key commands (e.g. specific save action)
        editorCommands: [],

        // notifies users that there is unsaved changes in the editor when navigating away from the page
        notifyUnsavedChanges: false,

        // an optional array of ignorable Ace errors. Lets us filter out errors based on context
        ignorableErrors: [],

        // un-Reacty, but the code editor is a self-contained component and it's helpful to be able to tie into
        // editor specific events like content changes and leaving the editor
        change: function () {},
        blur: function () {}
      };
    },

    getInitialState: function () {
      return {
        originalCode: this.props.defaultCode,

        // these are all related to the (optional) string edit modal
        stringEditModalVisible: false,
        stringEditIconVisible: false,
        stringEditIconStyle: {},
        stringEditModalDefaultString: ''
      };
    },

    hasChanged: function () {
      return !_.isEqual(this.state.originalCode, this.getValue());
    },

    clearChanges: function () {
      this.setState({
        originalCode: this.getValue()
      });
    },

    setupAce: function (props, shouldUpdateCode) {
      this.editor = ace.edit(this.refs.ace.getDOMNode());

      // suppresses an Ace editor error
      this.editor.$blockScrolling = Infinity;

      if (shouldUpdateCode) {
        this.setValue(props.defaultCode);
      }

      this.editor.setShowPrintMargin(props.showPrintMargin);
      this.editor.autoScrollEditorIntoView = props.autoScrollEditorIntoView;

      this.editor.setOption('highlightActiveLine', this.props.highlightActiveLine);

      if (this.props.setHeightToLineCount) {
        this.setHeightToLineCount();
      }

      if (this.props.ignorableErrors) {
        this.removeIgnorableAnnotations();
      }

      this.addCommands();
      this.editor.getSession().setMode('ace/mode/' + props.mode);
      this.editor.setTheme('ace/theme/' + props.theme);
      this.editor.setFontSize(props.fontSize);
      this.editor.getSession().setTabSize(2);
      this.editor.getSession().setUseSoftTabs(true);

      if (this.props.autoFocus) {
        this.editor.focus();
      }
    },

    addCommands: function () {
      _.each(this.props.editorCommands, function (command) {
        this.editor.commands.addCommand(command);
      }, this);
    },

    setupEvents: function () {
      this.editor.on('blur', _.bind(this.onBlur, this));
      this.editor.on('change', _.bind(this.onContentChange, this));

      if (this.props.stringEditModalEnabled) {
        this.editor.on('changeSelection', _.bind(this.showHideEditStringGutterIcon, this));
        this.editor.getSession().on('changeBackMarker', _.bind(this.showHideEditStringGutterIcon, this));
        this.editor.getSession().on('changeScrollTop', _.bind(this.updateEditStringGutterIconPosition, this));
      }

      if (this.props.notifyUnsavedChanges) {
        $(window).on('beforeunload.editor_' + this.props.id, _.bind(this.quitWarningMsg));
        FauxtonAPI.beforeUnload('editor_' + this.props.id, _.bind(this.quitWarningMsg, this));
      }
    },

    onBlur: function () {
      this.props.blur(this.getValue());
    },

    onContentChange: function () {
      if (this.props.setHeightToLineCount) {
        this.setHeightToLineCount();
      }
      this.props.change(this.getValue());
    },

    quitWarningMsg: function () {
      if (this.hasChanged()) {
        return 'Your changes have not been saved. Click Cancel to return to the document, or OK to proceed.';
      }
    },

    removeEvents: function () {
      if (this.props.notifyUnsavedChanges) {
        $(window).off('beforeunload.editor_' + this.props.id);
        FauxtonAPI.removeBeforeUnload('editor_' + this.props.id);
      }
    },

    setHeightToLineCount: function () {
      var numLines = this.editor.getSession().getDocument().getLength();
      var maxLines = (numLines > this.props.maxLines) ? this.props.maxLines : numLines;
      this.editor.setOptions({
        maxLines: maxLines
      });
    },

    componentDidMount: function () {
      this.setupAce(this.props, true);
      this.setupEvents();

      if (this.props.autoFocus) {
        this.editor.focus();
      }
    },

    componentWillUnmount: function () {
      this.removeEvents();
      this.editor.destroy();
    },

    componentWillReceiveProps: function (nextProps) {
      this.setupAce(nextProps, false);
    },

    getAnnotations: function () {
      return this.editor.getSession().getAnnotations();
    },

    isIgnorableError: function (msg) {
      return _.contains(this.props.ignorableErrors, msg);
    },

    removeIgnorableAnnotations: function () {
      var isIgnorableError = this.isIgnorableError;
      this.editor.getSession().on('changeAnnotation', function () {
        var annotations = this.editor.getSession().getAnnotations();
        var newAnnotations = _.reduce(annotations, function (annotations, error) {
          if (!isIgnorableError(error.raw)) {
            annotations.push(error);
          }
          return annotations;
        }, []);

        if (annotations.length !== newAnnotations.length) {
          this.editor.getSession().setAnnotations(newAnnotations);
        }
      }.bind(this));
    },

    showHideEditStringGutterIcon: function (e) {
      if (this.hasErrors() || !this.parseLineForStringMatch()) {
        this.setState({ stringEditIconVisible: false });
        return false;
      }

      this.setState({
        stringEditIconVisible: true,
        stringEditIconStyle: {
          top: this.getGutterIconPosition()
        }
      });

      return true;
    },

    updateEditStringGutterIconPosition: function () {
      if (!this.state.stringEditIconVisible) {
        return;
      }
      this.setState({
        stringEditIconStyle: {
          top: this.getGutterIconPosition()
        }
      });
    },

    getGutterIconPosition: function () {
      var rowHeight = this.getRowHeight();
      var scrollTop = this.editor.session.getScrollTop();
      var positionFromTop = (rowHeight * this.documentToScreenRow(this.getSelectionStart().row)) - scrollTop;
      return positionFromTop + 'px';
    },

    parseLineForStringMatch: function () {
      var selStart = this.getSelectionStart().row;
      var selEnd   = this.getSelectionEnd().row;

      // one JS(ON) string can't span more than one line - we edit one string, so ensure we don't select several lines
      if (selStart >= 0 && selEnd >= 0 && selStart === selEnd && this.isRowExpanded(selStart)) {
        var editLine = this.getLine(selStart),
            editMatch = editLine.match(/^([ \t]*)("[a-zA-Z0-9_]*["|']: )?(["|'].*",?[ \t]*)$/);

        if (editMatch) {
          return editMatch;
        }
      }
      return false;
    },

    openStringEditModal: function () {
      var matches = this.parseLineForStringMatch();
      var string = matches[3];
      var lastChar = string.length - 1;
      if (string.substring(string.length - 1) === ',') {
        lastChar = string.length - 2;
      }
      string = string.substring(1, lastChar);

      this.setState({ stringEditModalVisible: true });
      this.refs.stringEditModal.setValue(string);
    },

    saveStringEditModal: function (newString) {
      // replace the string on the selected line
      var line = this.parseLineForStringMatch();
      var indent = line[1] || '',
          key = line[2] || '',
          originalString = line[3],
          comma = '';
      if (originalString.substring(originalString.length - 1) === ',') {
        comma = ',';
      }
      this.replaceCurrentLine(indent + key + JSON.stringify(newString) + comma + '\n');
      this.closeStringEditModal();
    },

    closeStringEditModal: function () {
      this.setState({
        stringEditModalVisible: false
      });
    },

    hasErrors: function () {
      return !_.every(this.getAnnotations(), function (error) {
        return this.isIgnorableError(error.raw);
      }, this);
    },

    setReadOnly: function (readonly) {
      this.editor.setReadOnly(readonly);
    },

    setValue: function (code, lineNumber) {
      lineNumber = lineNumber ? lineNumber : -1;
      this.editor.setValue(code, lineNumber);
    },

    getValue: function () {
      return this.editor.getValue();
    },

    getEditor: function () {
      return this;
    },

    getLine: function (lineNum) {
      return this.editor.session.getLine(lineNum);
    },

    getSelectionStart: function () {
      return this.editor.getSelectionRange().start;
    },

    getSelectionEnd: function () {
      return this.editor.getSelectionRange().end;
    },

    getRowHeight: function () {
      return this.editor.renderer.layerConfig.lineHeight;
    },

    isRowExpanded: function (row) {
      return !this.editor.getSession().isRowFolded(row);
    },

    documentToScreenRow: function (row) {
      return this.editor.getSession().documentToScreenRow(row, 0);
    },

    replaceCurrentLine: function (replacement) {
      this.editor.getSelection().selectLine();
      this.editor.insert(replacement);
      this.editor.getSelection().moveCursorUp();
    },

    render: function () {
      return (
        <div>
          <div ref="ace" className="js-editor" id={this.props.id}></div>
          <button ref="stringEditIcon" className="btn string-edit" title="Edit string" disabled={!this.state.stringEditIconVisible}
            style={this.state.stringEditIconStyle} onClick={this.openStringEditModal}>
            <i className="icon icon-edit"></i>
          </button>
          <StringEditModal
            ref="stringEditModal"
            visible={this.state.stringEditModalVisible}
            onSave={this.saveStringEditModal}
            onClose={this.closeStringEditModal} />
        </div>
      );
    }
  });


  // this appears when the cursor is over a string. It shows an icon in the gutter that opens the modal.
  var StringEditModal = React.createClass({

    propTypes: {
      visible: React.PropTypes.bool.isRequired,
      onClose: React.PropTypes.func.isRequired,
      onSave: React.PropTypes.func.isRequired
    },

    getDefaultProps: function () {
      return {
        visible: false,
        onClose: function () { },
        onSave: function () { }
      };
    },

    componentDidUpdate: function () {
      var params = (this.props.visible) ? { show: true, backdrop: 'static', keyboard: true } : 'hide';
      $(this.getDOMNode()).modal(params);

      $(this.getDOMNode()).on('shown.bs.modal', function () {
        this.editor.focus();

        // re-opening the modal to edit a second string doesn't update the content. This forces the editor to redraw
        // to show the latest content each time it opens
        this.editor.resize();
        this.editor.renderer.updateFull();
      }.bind(this));
    },

    // ensure that if the user clicks ESC to close the window, the store gets wind of it
    componentDidMount: function () {
      $(this.getDOMNode()).on('hidden.bs.modal', function () {
        this.props.onClose();
      }.bind(this));

      this.editor = ace.edit(this.refs.stringEditor.getDOMNode());

      // suppresses an Ace editor error
      this.editor.$blockScrolling = Infinity;

      this.editor.setShowPrintMargin(false);
      this.editor.setOption('highlightActiveLine', true);
      this.editor.setTheme('ace/theme/idle_fingers');
    },

    setValue: function (val) {
      // we do the JSON.parse so the string editor modal shows newlines
      val = JSON.parse('"' + val + '"');      //returns an object, expects a JSON string
      this.editor.setValue(val, -1);
    },

    componentWillUnmount: function () {
      $(this.getDOMNode()).off('hidden.bs.modal shown.bs.modal');
    },

    closeModal: function () {
      this.props.onClose();
    },

    save: function () {
      this.props.onSave(this.editor.getValue());
    },

    render: function () {
      return (
        <div className="modal hide fade string-editor-modal" tabIndex="-1">
          <div className="modal-header">
            <button type="button" className="close" onClick={this.closeModal} aria-hidden="true">&times;</button>
            <h3>Edit text <span id="string-edit-header"></span></h3>
          </div>
          <div className="modal-body">
            <div id="modal-error" className="hide alert alert-error"/>
            <div id="string-editor-wrapper"><div ref="stringEditor" className="doc-code"></div></div>
          </div>
          <div className="modal-footer">
            <button className="cancel-button btn" onClick={this.closeModal}><i className="icon fonticon-circle-x"></i> Cancel</button>
            <button id="string-edit-save-btn" onClick={this.save} className="btn btn-success save">
              <i className="fonticon-circle-check"></i> Save
            </button>
          </div>
        </div>
      );
    }
  });


  // Zen mode editing has very few options:
  // - It covers the full screen, hiding everything else
  // - Two themes: light & dark (choice stored in local storage)
  // - No save option, but has a 1-1 map with a <CodeEditor /> element which gets updated when the user leaves
  // - [Escape] closes the mode, as does clicking the shrink icon at the top right
  var ZenModeOverlay = React.createClass({
    getDefaultProps: function () {
      return {
        mode: 'javascript',
        defaultCode: '',
        ignorableErrors: [],
        onExit: null,
        highlightActiveLine: false
      };
    },

    themes: {
      dark: 'idle_fingers',
      light: 'dawn'
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        theme: this.getZenTheme(),
        code: this.props.defaultCode
      };
    },

    getZenTheme: function () {
      var selectedTheme = app.utils.localStorageGet('zenTheme');
      return _.isUndefined(selectedTheme) ? 'dark' : selectedTheme;
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      $(this.refs.exit.getDOMNode()).tooltip({ placement: 'left' });
      $(this.refs.theme.getDOMNode()).tooltip({ placement: 'left' });
    },

    exitZenMode: function () {
      this.props.onExit(this.getValue());
    },

    getValue: function () {
      return this.refs.ace.getValue();
    },

    toggleTheme: function () {
      var newTheme = (this.state.theme === 'dark') ? 'light' : 'dark';
      this.setState({
        theme: newTheme,
        code: this.getValue()
      });
      app.utils.localStorageSet('zenTheme', newTheme);
    },

    setValue: function (code, lineNumber) {
      lineNumber = lineNumber ? lineNumber : -1;
      this.editor.setValue(code, lineNumber);
    },

    render: function () {
      var classes = 'full-page-editor-modal-wrapper zen-theme-' + this.state.theme;

      var editorCommands = [{
        name: 'close',
        bindKey: { win: 'ESC', mac: 'ESC' },
        exec: this.exitZenMode
      }];

      return (
        <div className={classes}>
          <div className="zen-mode-controls">
            <ul>
              <li>
                <span ref="exit"
                  className="fonticon fonticon-resize-small js-exit-zen-mode"
                  data-toggle="tooltip"
                  data-container=".zen-mode-controls .tooltips"
                  title="Exit zen mode (`esc`)"
                  onClick={this.exitZenMode}></span>
              </li>
              <li>
                <span ref="theme"
                  className="fonticon fonticon-picture js-toggle-theme"
                  data-toggle="tooltip"
                  data-container=".zen-mode-controls .tooltips"
                  title="Switch zen theme"
                  onClick={this.toggleTheme}></span>
              </li>
            </ul>
            <div className="tooltips"></div>
          </div>
          <CodeEditor
            ref="ace"
            autoFocus={true}
            theme={this.themes[this.state.theme]}
            defaultCode={this.props.defaultCode}
            editorCommands={editorCommands}
            ignorableErrors={this.props.ignorableErrors}
            highlightActiveLine={this.props.highlightActiveLine}
          />
        </div>
      );
    }
  });


  var Beautify = React.createClass({
    noOfLines: function () {
      return this.props.code.split(/\r\n|\r|\n/).length;
    },

    canBeautify: function () {
      return this.noOfLines() === 1;
    },

    addTooltip: function () {
      if (this.canBeautify) {
        $('.beautify-tooltip').tooltip({ placement: 'right' });
      }
    },

    componentDidMount: function () {
      this.addTooltip();
    },

    beautify: function (event) {
      event.preventDefault();
      var beautifiedCode = beautifyHelper(this.props.code);
      this.props.beautifiedCode(beautifiedCode);
      $('.beautify-tooltip').tooltip('hide');
    },

    render: function () {
      if (!this.canBeautify()) {
        return null;
      }

      return (
        <button
          onClick={this.beautify}
          className="beautify beautify_map btn btn-primary beautify-tooltip"
          type="button"
          data-toggle="tooltip"
          title="Reformat your minified code to make edits to it."
        >
          beautify this code
        </button>
      );
    }
  });

  var PaddedBorderedBox = React.createClass({
    render: function () {
      return (
        <div className="bordered-box">
          <div className="padded-box">
            {this.props.children}
          </div>
        </div>
      );
    }
  });

  var Document = React.createClass({
    propTypes: {
      docIdentifier: React.PropTypes.string.isRequired,
      docChecked: React.PropTypes.func.isRequired
    },

    onChange: function (e) {
      e.preventDefault();
      this.props.docChecked(this.props.docIdentifier, this.props.doc, e);
    },

    getUrlFragment: function () {
      if (!this.props.children) {
        return '';
      }

      return (
        <div className="doc-edit-symbol pull-right" title="Edit document">
          {this.props.children}
        </div>
      );
    },

    getExtensionIcons: function () {
      var extensions = FauxtonAPI.getExtensions('DocList:icons');
      return _.map(extensions, function (Extension, i) {
        return (<Extension doc={this.props.doc} key={i} />);
      }, this);
    },

    getCheckbox: function () {
      if (!this.props.isDeletable) {
        return <div className="checkbox-dummy"></div>;
      }

      return (
        <div className="checkbox inline">
          <input
            id={'checkbox-' + this.props.docIdentifier}
            checked={this.props.checked ? 'checked="checked"' : null}
            type="checkbox"
            onChange={this.onChange}
            className="js-row-select" />
          <label onClick={this.onChange}
            className="label-checkbox-doclist"
            htmlFor={'checkbox-' + this.props.docIdentifier} />
        </div>
      );
    },

    onDoubleClick: function (e) {
      this.props.onDoubleClick(this.props.docIdentifier, this.props.doc, e);
    },

    getDocContent: function () {
      if (!_.isEmpty(this.props.docContent)) {
        return (
          <div className="doc-data">
            <pre className="prettyprint">{this.props.docContent}</pre>
          </div>
        );
      }
    },

    render: function () {
      return (
        <div data-id={this.props.docIdentifier} onDoubleClick={this.onDoubleClick} className="doc-row">
          <div className="custom-inputs">
            {this.getCheckbox()}
          </div>
          <div className="doc-item">
            <header>
              <span className="header-keylabel">
                {this.props.keylabel}
              </span>
              <span className="header-doc-id">
                {this.props.header ? '"' + this.props.header + '"' : null}
              </span>
              {this.getUrlFragment()}
              <div className="doc-item-extension-icons pull-right">{this.getExtensionIcons()}</div>
            </header>
            {this.getDocContent()}
          </div>
          <div className="clearfix"></div>
        </div>
      );
    }
  });

  var LoadLines = React.createClass({
    render: function () {
      return (
        <div className="loading-lines">
          <div id="line1"> </div>
          <div id="line2"> </div>
          <div id="line3"> </div>
          <div id="line4"> </div>
        </div>
      );
    }
  });

  var ConfirmButton = React.createClass({
    render: function () {
      return (
        <button type="submit" className="btn btn-success save" id={this.props.id}>
          <i className="icon fonticon-ok-circled"></i>
          {this.props.text}
        </button>
      );
    }
  });

  var MenuDropDown = React.createClass({

    getDefaultProps: function () {
      return {
        icon: 'fonticon-plus-circled'
      };
    },

    createSectionLinks: function (links) {
      if (!links) { return null; }
      return links.map(function (link, key) {
        return (
          <li key={key}>
            <a className={link.icon ? 'icon ' + link.icon : ''}
              data-bypass={link.external ? 'true' : ''}
              href={link.url}
              target={link.external ? '_blank' : ''}>
              {link.title}
            </a>
          </li>
        );
      });
    },

    createSectionTitle: function (title) {
      if (!title) {
        return null;
      }

      return (
        <li className="header-label">{title}</li>
      );
    },

    createSection: function () {
      return this.props.links.map(function (linkSection, key) {
        return (
          <ul className="dropdown-menu arrow" key={key} role="menu" aria-labelledby="dLabel">
            {this.createSectionTitle(linkSection.title)}
            {this.createSectionLinks(linkSection.links)}
          </ul>
        );
      }.bind(this));
    },

    render: function () {
      return (
        <div className="dropdown">
          <a className={"dropdown-toggle icon " + this.props.icon} data-toggle="dropdown" href="#" data-bypass="true"></a>
            {this.createSection()}
        </div>
      );
    }
  });

  var TrayContents = React.createClass({
    getChildren: function () {
      if (!this.props.trayVisible) {
        return null;
      }

      var className = "tray show-tray " + this.props.className;
      return (
        <div key={1} id={this.props.id} className={className}>
          {this.props.children}
        </div>);
    },

    render: function () {
      return (
        <ReactCSSTransitionGroup transitionName="tray" transitionAppear={true} component="div">
          {this.getChildren()}
        </ReactCSSTransitionGroup>
      );
    }
  });

  // The tray components work as follows:
  // <Tray> Outer wrapper for all components in the tray
  // <ToggleHeaderButton /> The tray button to activate the tray, e.g the ToggleHeaderButton
  // <TrayContents> </TrayContents> What is displayed when the tray is active
  // </Tray>
  // See documents/queryoptions/queryoptions.react.jsx for a complete example

  var Tray = React.createClass({

    propTypes: {
      id: React.PropTypes.string.isRequired
    },

    componentDidMount: function () {
      $('body').on('click.' + this.props.id, _.bind(this.closeIfOpen, this));
      FauxtonAPI.Events.on(FauxtonAPI.constants.EVENTS.TRAY_HIDE, this.closeIfOpen, this);
    },

    componentWillUnmount: function () {
      FauxtonAPI.Events.off(FauxtonAPI.constants.EVENTS.TRAY_HIDE);
      $('body').off('click.' + this.props.id);
    },

    getInitialState: function () {
      return {
        trayVisible: false
      };
    },

    toggleTray: function () {
      this.setState({trayVisible: !this.state.trayVisible});
    },

    hideTray: function () {
      this.setState({ trayVisible: false });
    },

    renderChildren: function () {
      return React.Children.map(this.props.children, function (child, key) {
        return React.addons.cloneWithProps(child, {
          trayVisible: this.state.trayVisible,
          selected: this.state.trayVisible,
          toggleCallback: this.toggleTray,
          key: key
        });
      }.bind(this));
    },

    render: function () {
      return (
        <div>
          {this.renderChildren()}
        </div>
      );
    },

    closeIfOpen: function (e) {
      if (!this.state.trayVisible) { return; }
      var trayEl = $(this.getDOMNode());

      if (!trayEl.is(e.target) && trayEl.has(e.target).length === 0) {
        this.toggleTray();
      }
    }

  });


  var ApiBarController = React.createClass({

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        visible: componentStore.isAPIBarVisible(),
        endpoint: componentStore.getEndpoint(),
        docURL: componentStore.getDocURL()
      };
    },

    onChange: function () {
      if (this.isMounted()) {
        this.setState(this.getStoreState());
      }
    },

    componentDidMount: function () {
      componentStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      componentStore.off('change', this.onChange);
    },

    showCopiedMessage: function () {
      FauxtonAPI.addNotification({
        msg: 'The API URL has been copied to the clipboard.',
        type: 'success',
        clear: true
      });
    },

    getDocIcon: function () {
      if (!this.state.docURL) {
        return false;
      }
      return (
        <a className="help-link" data-bypass="true" href={this.state.docURL} target="_blank">
          <i className="icon icon-question-sign"></i>
        </a>
      );
    },

    render: function () {
      if (!this.state.visible || !this.state.endpoint) {
        return null;
      }

      return (
        <Tray id="api-bar-controller" ref="tray">

          <ToggleHeaderButton
            containerClasses="header-control-box control-toggle-api-url"
            title="API URL"
            fonticon="fonticon-link"
            text="API URL" />

          <TrayContents
            className="api-bar-tray">
            <div className="input-prepend input-append">
              <span className="add-on">
                API URL
                {this.getDocIcon()}
              </span>

              <FauxtonComponents.ClipboardWithTextField
                onClipBoardClick={this.showCopiedMessage}
                text="Copy"
                textToCopy={this.state.endpoint}
                uniqueKey="clipboard-apiurl" />

              <div className="add-on">
                <a data-bypass="true" href={this.state.endpoint} target="_blank" className="btn">
                  <i className="fonticon-eye icon"></i>
                  View JSON
                </a>
              </div>
            </div>

          </TrayContents>
        </Tray>
      );
    }
  });

  var TrayLink = React.createClass({

    onClick: function (e) {
      e.preventDefault();
      this.props.toggleTray();
    },

    render: function () {
      return (
        <a
          onClick={this.onClick}
          id={this.props.id}
          data-bypass="true"
          data-toggle="tab"
          className={this.props.className}
        >
          <i className={this.props.icon} />
          {this.props.text}
        </a>
      );
    }
  });

  var ToggleButton = React.createClass({
    propTypes: {
      id: React.PropTypes.string.isRequired,
      labelText: React.PropTypes.string.isRequired,
      onClick: React.PropTypes.func.isRequired,
      selected: React.PropTypes.bool.isRequired,
      disabled: React.PropTypes.bool.isRequired
    },

    render: function () {
      var id = this.props.id;

      return (
        <div>
          <input type="radio"
            id={"toggle-state-id-" + id}
            name="toggle-button-switch"
            className="input-toggle-hidden"
            checked={this.props.selected}
            onChange={this.props.onClick}
            disabled={this.props.disabled} />
          <label
            htmlFor={"toggle-state-id-" + id}
            className={"checkbox-label toggle-state-button " + this.props.toggleClassName}>
            {this.props.labelText}
          </label>
        </div>
      );
    }

  });

  var ToggleStateController = React.createClass({
    propTypes: {
      // example button
      // [{
      //   id: 'left',
      //   className: 'somethingsomething'
      //   onClick: callbackForLeftButton,
      //   selected: true,
      //   labelText: 'foo'
      // },
      // {
      //   id: 'right',
      //   className: 'somethingsomething'
      //   onClick: callbackForRightButton,
      //   selected: false,
      //   labelText: 'bar'
      // }]
      buttons: React.PropTypes.array.isRequired,
      title: React.PropTypes.string.isRequired,
      disabled: React.PropTypes.bool.isRequired
    },

    getInitialState: function () {
      return {
        buttons: this.props.buttons
      };
    },

    onClick: function (index, cb) {
      var newButtons = this.state.buttons.map(function (button, i) {
        var selected = false;
        if (i === index) {
          selected = true;
        }

        button.selected = selected;
        return button;
      });

      this.setState({buttons: newButtons});
      cb();
    },

    getToggleButtons: function () {

      return this.state.buttons.map(function (config, i) {
        return (
          <ToggleButton
            index={i}
            id={config.id}
            toggleClassName={config.className}
            key={i}
            onClick={this.onClick.bind(this, i, config.onClick)}
            selected={config.selected}
            labelText={config.labelText}
            disabled={this.props.disabled} />
        );
      }.bind(this));
    },

    getDocIcon: function () {
      if (!this.state.docURL) {
        return false;
      }
      return (
        <a className="help-link" data-bypass="true" href={this.state.docURL} target="_blank">
          <i className="icon icon-question-sign"></i>
        </a>
      );
    },

    render: function () {

      return (
        <div className="toggle-states">
          <div className="toggle-title">{this.props.title}</div>
          <form className="toggles">
            {this.getToggleButtons()}
          </form>
        </div>
      );
    }
  });

  var SimpleDoc = React.createClass({
    //must be enclosed in tag with id = "doc-list"
    render: function () {
      return (
        <div className="doc-row">
          <div className="doc-item">
            <header>
              <span className="header-keylabel">_id</span>
              <span className="header-doc-id">{this.props.id}</span>
            </header>
            <div className="doc-data">
              <pre className="prettyprint">{this.props.content}</pre>
            </div>
          </div>
          <div className="clearfix"></div>
        </div>
      );
    }
  });

  var SmallDropdown = React.createClass({
    propTypes: {
      dropdownSetup: React.PropTypes.object.isRequired
      // this dropdownSetup object should look like this:
      // {
      //   title: 'Choose a database',       // title of dropdown
      //   id: 'data-importer-choose-db',    // html tag ID
      //   selected: selected,               // the option that is default selected
      //   selectOptions: xyz                // array of objs that will populate the dropdown list
      // };
      // -----------------^
      // xyy would look like this:
      //
      // xyz = [
      //   {name: selectionA, onClick: function_for_when_selectA_is_chosen_from_dropdown },
      //   {name: selectionB, onClick: function_for_when_selectB_is_chosen_from_dropdown } ]
    },

    getInitialState: function () {
      return {
        show: false
      };
    },

    toggleMenu: function () {
      this.setState({ show: !this.state.show});
    },

    selectOptions: function () {
      var selects = this.props.dropdownSetup.selectOptions;

      return selects.map(function (opt, i) {
        var name = opt.name,
            fn = opt.onClick;

        return (
          <li key={i}
            onClick={fn}
            className="dropdown-options">
          {name}
          </li>
        );
      }.bind(this));
    },

    render: function () {
      var setup = this.props.dropdownSetup,
          show = this.state.show ? 'show' : '';

      return (
        <div id={setup.id} className="small-dropdown">
          <h1 className="title">{setup.title}</h1>
          <div className="selected" onClick={this.toggleMenu}>
            {setup.selected}
            <div id="dropdown-icon" className="icon icon-caret-down">
            </div>
          </div>
          <ul
            onClick={this.toggleMenu}
            className={"dropdown-select " + show}>
            {this.selectOptions()}
          </ul>
        </div>
      );
    }
  });

  return {
    BulkActionComponent: BulkActionComponent,
    ConfirmButton: ConfirmButton,
    ToggleHeaderButton: ToggleHeaderButton,
    StyledSelect: StyledSelect,
    CodeEditorPanel: CodeEditorPanel,
    CodeEditor: CodeEditor,
    StringEditModal: StringEditModal,
    ZenModeOverlay: ZenModeOverlay,
    Beautify: Beautify,
    PaddedBorderedBox: PaddedBorderedBox,
    Document: Document,
    LoadLines: LoadLines,
    MenuDropDown: MenuDropDown,
    Tray: Tray,
    TrayContents: TrayContents,
    ApiBarController: ApiBarController,
    TrayLink: TrayLink,
    ToggleStateController: ToggleStateController,
    SimpleDoc: SimpleDoc,
    SmallDropdown: SmallDropdown
  };

});
