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
import FauxtonAPI from "../../../core/api";
import AceEditor from "react-ace";
import ace from 'ace-builds';
ace.config.set("useStrictCSP", true);
import './ace-webpack-resolvers';
import {StringEditModal} from './stringeditmodal';

import 'ace-builds/css/ace.css';
import 'ace-builds/css/theme/idle_fingers.css';
import 'ace-builds/css/theme/dawn.css';



export class CodeEditor extends React.Component {
  static defaultProps = {
    id: 'code-editor',
    mode: 'javascript',
    theme: 'idle_fingers',
    fontSize: 13,

    // this sets the default value for the editor. On the fly changes are stored in state in this component only. To
    // change the editor content after initial construction use CodeEditor.setValue()
    defaultCode: '',
    disabled: false,
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
    this.editor = ace.edit(this.ace);

    // see https://github.com/ajaxorg/ace/issues/36 don't steal browser's default keybinding
    this.editor.commands.bindKeys(
      {
        "Ctrl-L|Command-L": null,
        "Ctrl-Shift-L|Command-Shift-L": "gotoline"
      }
    );

    if (shouldUpdateCode) {
      this.setValue(props.defaultCode);
    }

    this.editor.autoScrollEditorIntoView = props.autoScrollEditorIntoView;

    if (this.props.setHeightToLineCount) {
      this.setHeightToLineCount();
    }

    if (this.props.ignorableErrors) {
      this.removeIgnorableAnnotations();
    }

    this.addCommands();
  };

  addCommands = () => {
    _.each(this.props.editorCommands, (command) => {
      this.editor.commands.addCommand(command);
    });
  };

  setupEvents = () => {
    if (this.props.stringEditModalEnabled) {
      this.editor.on('changeSelection', _.bind(this.showHideEditStringGutterIcon, this));
      this.editor.getSession().on('changeBackMarker', _.bind(this.showHideEditStringGutterIcon, this));
      this.editor.getSession().on('changeScrollTop', _.bind(this.updateEditStringGutterIconPosition, this));
    }

    if (this.props.notifyUnsavedChanges) {
      window.addEventListener('beforeunload', this.quitWarningMsg);
      FauxtonAPI.beforeUnload('editor_' + this.props.id, this.quitWarningMsg);
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
      window.removeEventListener('beforeunload', this.quitWarningMsg);
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
  }

  componentWillUnmount() {
    this.removeEvents();
    this.editor.destroy();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
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
    const selStart = this.getSelectionStart().row;
    const selEnd   = this.getSelectionEnd().row;

    // one JS(ON) string can't span more than one line - we edit one string, so ensure we don't select several lines
    if (selStart >= 0 && selEnd >= 0 && selStart === selEnd && this.isRowExpanded(selStart)) {
      const editLine = this.getLine(selStart);
      const editMatch = editLine.match(/^([ \t]*)("[^"]*["][ \t]*:[ \t]*)?(["|'].*"[ \t]*,?[ \t]*)$/);
      if (editMatch) {
        return editMatch;
      }
    }
    return false;
  };

  openStringEditModal = () => {
    const matches = this.parseLineForStringMatch();
    let string = matches[3].trim();
    // Removes trailing comma and surrouding spaces
    if (string.substring(string.length - 1) === ',') {
      string = string.substring(0, string.length - 1).trim();
    }
    // Removes surrouding quotes
    string = string.substring(1, string.length - 1);

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
    return !_.every(this.getAnnotations(), (error) => {
      return this.isIgnorableError(error.raw);
    });
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

  onAceLoad = (ace) => {
    this.ace = ace;
  };

  render() {
    return (
      <div>
        <AceEditor
          name={this.props.id}
          className="js-editor"
          mode={this.props.mode}
          theme={this.props.theme}
          onLoad={_.bind(this.onAceLoad, this)}
          onBlur={_.bind(this.onBlur, this)}
          onChange={_.bind(this.onContentChange, this)}
          editorProps={{
            $blockScrolling: Infinity,
            useSoftTabs: true
          }}
          readOnly={this.props.disabled}
          showPrintMargin={this.props.showPrintMargin}
          highlightActiveLine={this.props.highlightActiveLine}
          width="100%"
          height="100%"
          tabSize={2}
          fontSize={this.props.fontSize}
          focus={this.props.autoFocus}
          setOptions={{
          }}/>
        <button ref={node => this.stringEditIcon = node}
          className="btn string-edit"
          title="Edit string"
          disabled={!this.state.stringEditIconVisible || this.props.disabled}
          style={this.state.stringEditIconStyle} onClick={this.openStringEditModal}>
          <i className="icon icon-edit"></i>
        </button>
        <StringEditModal
          ref={node => this.stringEditModal = node}
          visible={this.state.stringEditModalVisible}
          value={this.state.stringEditModalValue}
          onSave={this.saveStringEditModal}
          onClose={this.closeStringEditModal} />
      </div>
    );
  }
}
