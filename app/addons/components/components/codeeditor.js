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
import React from "react";
import ReactDOM from "react-dom";
import FauxtonAPI from "../../../core/api";
import ace from "brace";
import {StringEditModal} from './stringeditmodal';

require('brace/mode/javascript');
require('brace/mode/json');
require('brace/theme/idle_fingers');

export class CodeEditor extends React.Component {
  static defaultProps = {
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
    minLines: 11, // show double digits in sidebar

    // optional editor key commands (e.g. specific save action)
    editorCommands: [],

    // notifies users that there is unsaved changes in the editor when navigating away from the page
    notifyUnsavedChanges: false,

    // an optional array of ignorable Ace errors. Lets us filter out errors based on context
    ignorableErrors: [],

    // un-Reacty, but the code editor is a self-contained component and it's helpful to be able to tie into
    // editor specific events like content changes and leaving the editor
    change () {},
    blur () {}
  };

  state = {
    originalCode: this.props.defaultCode,

    // these are all related to the (optional) string edit modal
    stringEditModalVisible: false,
    stringEditIconVisible: false,
    stringEditIconStyle: {},
    stringEditModalValue: ''
  };

  hasChanged = () => {
    return !_.isEqual(this.state.originalCode, this.getValue());
  };

  clearChanges = () => {
    this.setState({
      originalCode: this.getValue()
    });
  };

  setupAce = (props, shouldUpdateCode) => {
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
  };

  addCommands = () => {
    _.each(this.props.editorCommands, function (command) {
      this.editor.commands.addCommand(command);
    }, this);
  };

  setupEvents = () => {
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
  };

  onBlur = () => {
    this.props.blur(this.getValue());
  };

  onContentChange = () => {
    if (this.props.setHeightToLineCount) {
      this.setHeightToLineCount();
    }
    this.props.change(this.getValue());
  };

  quitWarningMsg = () => {
    if (this.hasChanged()) {
      return 'Your changes have not been saved. Click Cancel to return to the document, or OK to proceed.';
    }
  };

  removeEvents = () => {
    if (this.props.notifyUnsavedChanges) {
      $(window).off('beforeunload.editor_' + this.props.id);
      FauxtonAPI.removeBeforeUnload('editor_' + this.props.id);
    }
  };

  setHeightToLineCount = () => {
    var numLines = this.editor.getSession().getDocument().getLength();
    var maxLines = (numLines > this.props.maxLines) ? this.props.maxLines : numLines;
    this.editor.setOptions({
      maxLines: maxLines,
      minLines: this.props.minLines
    });
  };

  componentDidMount() {
    this.setupAce(this.props, true);
    this.setupEvents();

    if (this.props.autoFocus) {
      this.editor.focus();
    }
  }

  componentWillUnmount() {
    this.removeEvents();
    this.editor.destroy();
  }

  componentWillReceiveProps(nextProps) {
    this.setupAce(nextProps, false);
  }

  getAnnotations = () => {
    return this.editor.getSession().getAnnotations();
  };

  isIgnorableError = (msg) => {
    return _.includes(this.props.ignorableErrors, msg);
  };

  removeIgnorableAnnotations = () => {
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
  };

  showHideEditStringGutterIcon = () => {
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
  };

  updateEditStringGutterIconPosition = () => {
    if (!this.state.stringEditIconVisible) {
      return;
    }
    this.setState({
      stringEditIconStyle: {
        top: this.getGutterIconPosition()
      }
    });
  };

  getGutterIconPosition = () => {
    var rowHeight = this.getRowHeight();
    var scrollTop = this.editor.session.getScrollTop();
    var positionFromTop = (rowHeight * this.documentToScreenRow(this.getSelectionStart().row)) - scrollTop;
    return positionFromTop + 'px';
  };

  parseLineForStringMatch = () => {
    var selStart = this.getSelectionStart().row;
    var selEnd   = this.getSelectionEnd().row;

    // one JS(ON) string can't span more than one line - we edit one string, so ensure we don't select several lines
    if (selStart >= 0 && selEnd >= 0 && selStart === selEnd && this.isRowExpanded(selStart)) {
      var editLine = this.getLine(selStart),
          editMatch = editLine.match(/^([ \t]*)("[a-zA-Z0-9_\-]*["|']: )?(["|'].*",?[ \t]*)$/);

      if (editMatch) {
        return editMatch;
      }
    }
    return false;
  };

  openStringEditModal = () => {
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
  };

  saveStringEditModal = (newString) => {
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
  };

  closeStringEditModal = () => {
    this.setState({
      stringEditModalVisible: false
    });
  };

  hasErrors = () => {
    return !_.every(this.getAnnotations(), function (error) {
      return this.isIgnorableError(error.raw);
    }, this);
  };

  setReadOnly = (readonly) => {
    this.editor.setReadOnly(readonly);
  };

  setValue = (code, lineNumber) => {
    lineNumber = lineNumber ? lineNumber : -1;
    this.editor.setValue(code, lineNumber);
  };

  getValue = () => {
    return this.editor.getValue();
  };

  getEditor = () => {
    return this;
  };

  getLine = (lineNum) => {
    return this.editor.session.getLine(lineNum);
  };

  getSelectionStart = () => {
    return this.editor.getSelectionRange().start;
  };

  getSelectionEnd = () => {
    return this.editor.getSelectionRange().end;
  };

  getRowHeight = () => {
    return this.editor.renderer.layerConfig.lineHeight;
  };

  isRowExpanded = (row) => {
    return !this.editor.getSession().isRowFolded(row);
  };

  documentToScreenRow = (row) => {
    return this.editor.getSession().documentToScreenRow(row, 0);
  };

  replaceCurrentLine = (replacement) => {
    this.editor.getSelection().selectLine();
    this.editor.insert(replacement);
    this.editor.getSelection().moveCursorUp();
  };

  render() {
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
}
