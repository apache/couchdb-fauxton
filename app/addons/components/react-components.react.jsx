
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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import React from "react";
import ReactDOM from "react-dom";
import Stores from "./stores";
import Actions from "./actions";
import FauxtonComponents from "../fauxton/components.react";
import Helpers from "../documents/helpers";
import beautifyHelper from "../../../assets/js/plugins/beautify";
import {Modal, Popover, OverlayTrigger} from "react-bootstrap";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import ace from "brace";

const { componentStore } = Stores;

var BadgeList = React.createClass({

  propTypes: {
    elements: React.PropTypes.array.isRequired,
    removeBadge: React.PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return {
      getLabel: function (el) {
        return el;
      },

      getId: function (el) {
        return el;
      }

    };
  },

  getBadges: function () {
    return this.props.elements.map(function (el, i) {
      return <Badge
        label={this.props.getLabel(el)}
        key={i}
        id={el}
        remove={this.removeBadge} />;
    }.bind(this));
  },

  removeBadge: function (label, el) {
    this.props.removeBadge(label, el);
  },

  render: function () {
    return (
      <ul className="component-badgelist">
        {this.getBadges()}
      </ul>
    );
  }
});

var Badge = React.createClass({
  propTypes: {
    label: React.PropTypes.string.isRequired,
    remove: React.PropTypes.func.isRequired
  },

  remove: function (e) {
    e.preventDefault();
    this.props.remove(this.props.label, this.props.id);
  },

  render: function () {
    return (
      <li className="component-badge">
        <span className="label label-info">{this.props.label}</span>
        <a
          href="#"
          className="label label-info remove-filter"
          onClick={this.remove} data-bypass="true"
        >
          &times;
        </a>
      </li>
    );
  }
});

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
      text: '',
      iconDefaultClass: 'icon'
    };
  },

  render: function () {
    const { iconDefaultClass, fonticon, innerClasses, selected, containerClasses, title, disabled, text, toggleCallback } = this.props;
    const selectedBtnClass = (selected) ? 'js-headerbar-togglebutton-selected' : '';

    return (
      <button
        title={title}
        disabled={disabled}
        onClick={toggleCallback}
        className={`button ${containerClasses} ${selectedBtnClass}`}
        >
        <i className={`${iconDefaultClass} ${fonticon} ${innerClasses}`}></i><span>{text}</span>
      </button>
    );
  }
});


var BulkActionComponent = React.createClass({

  propTypes: {
    hasSelectedItem: React.PropTypes.bool.isRequired,
    removeItem: React.PropTypes.func.isRequired,
    selectAll: React.PropTypes.func,
    toggleSelect: React.PropTypes.func.isRequired,
    isChecked: React.PropTypes.bool.isRequired,
    disabled: React.PropTypes.bool
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
      <OverlayTrigger
        ref="bulkActionPopover"
        trigger="click"
        placement="bottom"
        rootClose={true}
        overlay={
          <Popover id="bulk-action-component-popover" title={this.props.title}>
            {this.getPopupContent()}
          </Popover>
        }>
        <div className="arrow-button">
          <i className="fonticon fonticon-play"></i>
        </div>
      </OverlayTrigger>
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
  propTypes: {
    selectValue: React.PropTypes.string.isRequired,
    selectId: React.PropTypes.string.isRequired,
    selectChange: React.PropTypes.func.isRequired,
    autoFocus: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      autoFocus: false
    };
  },

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
            autoFocus={this.props.autoFocus}
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
    this.getEditor().setValue(code);
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
          <span>{this.props.title}</span>
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


require('brace/mode/javascript');
require('brace/mode/json');
require('brace/theme/idle_fingers');

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
      stringEditModalValue: ''
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
    this.editor = ace.edit(ReactDOM.findDOMNode(this.refs.ace));

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

    this.setState({
      stringEditModalVisible: true,
      stringEditModalValue: string
    });
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
          value={this.state.stringEditModalValue}
          onSave={this.saveStringEditModal}
          onClose={this.closeStringEditModal} />
      </div>
    );
  }
});


// this appears when the cursor is over a string. It shows an icon in the gutter that opens the modal.
var StringEditModal = React.createClass({

  propTypes: {
    value: React.PropTypes.string.isRequired,
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

  componentDidMount: function () {
    if (!this.props.visible) {
      return;
    }
    this.initEditor(this.props.value);
  },

  componentDidUpdate: function (prevProps) {
    if (!this.props.visible) {
      return;
    }
    var val = '';
    if (!prevProps.visible && this.props.visible) {
      val = Helpers.parseJSON(this.props.value);
    }

    this.initEditor(val);
  },

  initEditor: function (val) {
    this.editor = ace.edit(ReactDOM.findDOMNode(this.refs.stringEditor));
    this.editor.$blockScrolling = Infinity; // suppresses an Ace editor error
    this.editor.setShowPrintMargin(false);
    this.editor.setOption('highlightActiveLine', true);
    this.editor.setTheme('ace/theme/idle_fingers');
    this.editor.setValue(val, -1);
  },

  closeModal: function () {
    this.props.onClose();
  },

  save: function () {
    this.props.onSave(this.editor.getValue());
  },

  render: function () {
    return (
      <Modal dialogClassName="string-editor-modal" show={this.props.visible} onHide={this.closeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Edit Value <span id="string-edit-header"></span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div id="modal-error" className="hide alert alert-error"/>
          <div id="string-editor-wrapper"><div ref="stringEditor" className="doc-code"></div></div>
        </Modal.Body>
        <Modal.Footer>
          <a className="cancel-link" onClick={this.closeModal}>Cancel</a>
          <button id="string-edit-save-btn" onClick={this.save} className="btn btn-success save">
            <i className="fonticon-circle-check"></i> Modify Text
          </button>
        </Modal.Footer>
      </Modal>
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
    $(ReactDOM.findDOMNode(this.refs.exit)).tooltip({ placement: 'left' });
    $(ReactDOM.findDOMNode(this.refs.theme)).tooltip({ placement: 'left' });
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
        className="beautify beautify_map btn btn-primary btn-small beautify-tooltip"
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
    docChecked: React.PropTypes.func.isRequired,
    truncate: React.PropTypes.bool,
    maxRows: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      truncate: true,
      maxRows: 500
    };
  },

  onChange: function (e) {
    e.preventDefault();
    this.props.docChecked(this.props.doc.id, this.props.doc._rev);
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
          checked={this.props.checked}
          data-checked={this.props.checked}
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
    if (_.isEmpty(this.props.docContent)) {
      return null;
    }

    // if need be, truncate the document
    var content = this.props.docContent;
    var isTruncated = false;
    if (this.props.truncate) {
      var result = Helpers.truncateDoc(this.props.docContent, this.props.maxRows);
      isTruncated = result.isTruncated;
      content = result.content;
    }

    return (
      <div className="doc-data">
        <pre className="prettyprint">{content}</pre>
        {isTruncated ? <div className="doc-content-truncated">(truncated)</div> : null}
      </div>
    );
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

const ConfirmButton = React.createClass({
  propTypes: {
    showIcon: React.PropTypes.bool,
    id: React.PropTypes.string,
    customIcon: React.PropTypes.string,
    style: React.PropTypes.object,
    buttonType: React.PropTypes.string,
    'data-id': React.PropTypes.string,
    onClick: React.PropTypes.func,
    disabled: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      disabled: false,
      showIcon: true,
      customIcon: 'fonticon-ok-circled',
      buttonType: 'btn-success',
      style: {},
      'data-id': null,
      onClick: function () { },
      disabled: false
    };
  },

  getIcon: function () {
    if (!this.props.showIcon) {
      return null;
    }
    return (
      <i className={"icon " + this.props.customIcon} />
    );
  },

  render: function () {
    const { onClick, buttonType, id, style, text, disabled } = this.props;
    return (
      <button
        onClick={onClick}
        type="submit"
        disabled={disabled}
        data-id={this.props['data-id']}
        className={'btn save ' + buttonType}
        id={id}
        style={style}
        disabled={disabled}
      >
        {this.getIcon()}
        {text}
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
      return this.createEntry(link, key);
    }.bind(this));
  },

  createEntry: function (link, key) {
    return (
      <li key={key}>
        <a className={link.icon ? 'icon ' + link.icon : ''}
          data-bypass={link.external ? 'true' : ''}
          href={link.url}
          onClick={link.onClick}
          target={link.external ? '_blank' : ''}>
          {link.title}
        </a>
      </li>
    );
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
      if (linkSection.title && linkSection.links) {
        return ([
          this.createSectionTitle(linkSection.title),
          this.createSectionLinks(linkSection.links)
        ]);
      }

      return this.createEntry(linkSection, 'el' + key);

    }.bind(this));
  },

  render: function () {
    return (
      <div className="dropdown">
        <a className={"dropdown-toggle icon " + this.props.icon}
          data-toggle="dropdown"
          href="#"
          data-bypass="true"></a>
        <ul className="dropdown-menu arrow" role="menu" aria-labelledby="dLabel">
          {this.createSection()}
        </ul>
      </div>
    );
  }
});

var TrayContents = React.createClass({
  getChildren: function () {
    var className = "tray show-tray " + this.props.className;
    return (
      <div key={1} id={this.props.id} className={className}>
        {this.props.children}
      </div>);
  },

  render: function () {
    return (
      <ReactCSSTransitionGroup transitionName="tray" transitionAppear={true} component="div" transitionAppearTimeout={500}
        transitionEnterTimeout={500} transitionLeaveTimeout={300}>
        {this.getChildren()}
      </ReactCSSTransitionGroup>
    );
  }
});


function connectToStores (Component, stores, getStateFromStores) {

  var WrappingElement = React.createClass({

    componentDidMount: function () {
      stores.forEach(function (store) {
        store.on('change', this.onChange, this);
      }.bind(this));
    },

    componentWillUnmount: function () {
      stores.forEach(function (store) {
        store.off('change', this.onChange);
      }.bind(this));
    },

    getInitialState: function () {
      return getStateFromStores(this.props);
    },

    onChange: function () {
      if (!this.isMounted()) {
        return;
      }

      this.setState(getStateFromStores(this.props));
    },

    handleStoresChanged: function () {
      if (this.isMounted()) {
        this.setState(getStateFromStores(this.props));
      }
    },

    render: function () {
      return <Component {...this.state} {...this.props} />;
    }

  });

  return WrappingElement;
}

var TrayWrapper = React.createClass({
  getDefaultProps: function () {
    return {
      className: ''
    };
  },

  renderChildren: function () {
    return React.Children.map(this.props.children, function (child, key) {

      const props = {};
      Object.keys(this.props).filter((k) => {
        return this.props.hasOwnProperty(k);
      }).map((k) => {
        return props[k] = this.props[k];
      });

      return React.cloneElement(child, props);
    }.bind(this));
  },

  render: function () {
    return (
      <div>
        {this.renderChildren()}
      </div>
    );
  }
});

var APIBar = React.createClass({
  propTypes: {
    buttonVisible: React.PropTypes.bool.isRequired,
    contentVisible: React.PropTypes.bool.isRequired,
    docURL: React.PropTypes.string,
    endpoint: React.PropTypes.string
  },

  showCopiedMessage: function () {
    FauxtonAPI.addNotification({
      msg: 'The API URL has been copied to the clipboard.',
      type: 'success',
      clear: true
    });
  },

  getDocIcon: function () {
    if (!this.props.docURL) {
      return null;
    }
    return (
      <a
        className="help-link"
        data-bypass="true"
        href={this.props.docURL}
        target="_blank"
      >
        <i className="icon icon-question-sign"></i>
      </a>
    );
  },

  getTray: function () {
    if (!this.props.contentVisible) {
      return null;
    }

    return (
      <TrayContents className="tray show-tray api-bar-tray">
        <div className="input-prepend input-append">
          <span className="add-on">
            API URL
            {this.getDocIcon()}
          </span>

          <FauxtonComponents.ClipboardWithTextField
            onClipBoardClick={this.showCopiedMessage}
            text="Copy URL"
            textToCopy={this.props.endpoint}
            showCopyIcon={false}
            uniqueKey="clipboard-apiurl" />

          <div className="add-on">
            <a
              data-bypass="true"
              href={this.props.endpoint}
              target="_blank"
              className="btn"
            >
              View JSON
            </a>
          </div>
        </div>
      </TrayContents>
    );
  },

  toggleTrayVisibility: function () {
    Actions.toggleApiBarVisibility(!this.props.contentVisible);
  },

  componentDidMount: function () {
    $('body').on('click.APIBar', function (e) {
      if ($(e.target).closest('.api-bar-tray,.control-toggle-api-url').length === 0) {
        Actions.toggleApiBarVisibility(false);
      }
    }.bind(this));
  },

  componentWillUnmount: function () {
    $('body').off('click.APIBar');
  },

  render: function () {
    if (!this.props.buttonVisible || !this.props.endpoint) {
      return null;
    }

    return (
      <div>
        <ToggleHeaderButton
          containerClasses="header-control-box control-toggle-api-url"
          title="API URL"
          fonticon="fonticon-link"
          text="API"
          toggleCallback={this.toggleTrayVisibility} />

        {this.getTray()}
      </div>
    );
  }
});

var ApiBarController = React.createClass({

  getWrap: function () {
    return connectToStores(TrayWrapper, [componentStore], function () {
      return {
        buttonVisible: componentStore.getIsAPIBarButtonVisible(),
        contentVisible: componentStore.getIsAPIBarVisible(),
        endpoint: componentStore.getEndpoint(),
        docURL: componentStore.getDocURL()
      };
    });
  },

  render: function () {
    var TrayWrapper = this.getWrap();
    return (
      <TrayWrapper>
        <APIBar buttonVisible={true} contentVisible={false} />
      </TrayWrapper>
    );
  }
});

var DeleteDatabaseModal = React.createClass({

  getInitialState: function () {
    return {
      inputValue: '',
      disableSubmit: true
    };
  },

  propTypes: {
    showHide: React.PropTypes.func.isRequired,
    modalProps: React.PropTypes.object
  },

  close: function (e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      inputValue: '',
      disableSubmit: true
    });

    this.props.showHide({showModal: false});
  },

  open: function () {
    this.props.showHide({showModal: true});
  },

  getDatabaseName: function () {
    return this.props.modalProps.dbId.trim();
  },

  onInputChange: function (e) {
    var val = encodeURIComponent(e.target.value.trim());

    this.setState({
      inputValue: val
    });

    this.setState({
      disableSubmit: val !== this.getDatabaseName()
    });
  },

  onDeleteClick: function (e) {
    e.preventDefault();

    Actions.deleteDatabase(this.getDatabaseName());
  },

  onInputKeypress: function (e) {
    if (e.keyCode === 13 && this.state.disableSubmit !== true) {
      Actions.deleteDatabase(this.getDatabaseName());
    }
  },

  render: function () {
    var isSystemDatabase = this.props.modalProps.isSystemDatabase;
    var showDeleteModal = this.props.modalProps.showDeleteModal;
    var dbId = this.props.modalProps.dbId;

    var warning = isSystemDatabase ? (
      <p style={{color: '#d14'}} className="warning">
        <b>You are about to delete a system database, be careful!</b>
      </p>
    ) : null;

    return (
      <Modal dialogClassName="delete-db-modal" show={showDeleteModal} onHide={this.close}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Delete Database</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {warning}
          <p>
            Warning: This action will permanently delete <code>{dbId}</code>.
            To confirm the deletion of the database and all of the
            database's documents, you must enter the database's name.
          </p>
          <input
            type="text"
            className="input-block-level"
            onKeyUp={this.onInputKeypress}
            onChange={this.onInputChange}
            autoFocus={true} />
        </Modal.Body>
        <Modal.Footer>
          <a href="#" onClick={this.close} data-bypass="true" className="cancel-link">Cancel</a>
          <button
            disabled={this.state.disableSubmit}
            onClick={this.onDeleteClick}
            className="btn btn-danger delete">
            <i className="icon fonticon-cancel-circled" /> Delete
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
});

const TabElement = ({selected, text, onChange, iconClass}) => {

  const additionalClass = selected ? 'tab-element-checked' : '';

  return (
    <li className={`component-tab-element ${additionalClass}`}>

      <label>
        <div className="tab-element-indicator-wrapper">
          <div className="tab-element-indicator"></div>
        </div>
        <div className="tab-element-content">
          <i className={iconClass}></i>
          <input
            type="radio"
            value={text}
            checked={selected}
            onChange={onChange} />

          {text}
        </div>
      </label>
    </li>

  );
};
TabElement.propTypes = {
  selected: React.PropTypes.bool.isRequired,
  text: React.PropTypes.string.isRequired,
  onChange: React.PropTypes.func.isRequired,
  iconClass: React.PropTypes.string,
};

const TabElementWrapper = ({children}) => {
  return (
    <ul className="nav nav-tabs component-tab-element-wrapper">
      {children}
    </ul>
  );
};


export default {
  BadgeList: BadgeList,
  Badge: Badge,
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
  TrayContents: TrayContents,
  TrayWrapper: TrayWrapper,
  connectToStores: connectToStores,
  ApiBarController: ApiBarController,
  renderMenuDropDown: function (el, opts) {
    ReactDOM.render(<MenuDropDown icon="fonticon-vertical-ellipsis" links={opts.links} />, el);
  },
  removeMenuDropDown: function (el) {
    ReactDOM.unmountComponentAtNode(el);
  },
  DeleteDatabaseModal: DeleteDatabaseModal,
  TabElement: TabElement,
  TabElementWrapper: TabElementWrapper
};
