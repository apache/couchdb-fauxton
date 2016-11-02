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
import app from "../../../app";
import {CodeEditor} from './codeeditor';

require('brace/theme/dawn');

// Zen mode editing has very few options:
// - It covers the full screen, hiding everything else
// - Two themes: light & dark (choice stored in local storage)
// - No save option, but has a 1-1 map with a <CodeEditor /> element which gets updated when the user leaves
// - [Escape] closes the mode, as does clicking the shrink icon at the top right
export const ZenModeOverlay = React.createClass({
  getDefaultProps () {
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

  getInitialState () {
    return this.getStoreState();
  },

  getStoreState () {
    return {
      theme: this.getZenTheme(),
      code: this.props.defaultCode
    };
  },

  getZenTheme () {
    var selectedTheme = app.utils.localStorageGet('zenTheme');
    return _.isUndefined(selectedTheme) ? 'dark' : selectedTheme;
  },

  onChange () {
    this.setState(this.getStoreState());
  },

  componentDidMount () {
    $(ReactDOM.findDOMNode(this.refs.exit)).tooltip({ placement: 'left' });
    $(ReactDOM.findDOMNode(this.refs.theme)).tooltip({ placement: 'left' });
  },

  exitZenMode () {
    this.props.onExit(this.getValue());
  },

  getValue () {
    return this.refs.ace.getValue();
  },

  toggleTheme () {
    var newTheme = (this.state.theme === 'dark') ? 'light' : 'dark';
    this.setState({
      theme: newTheme,
      code: this.getValue()
    });
    app.utils.localStorageSet('zenTheme', newTheme);
  },

  setValue (code, lineNumber) {
    lineNumber = lineNumber ? lineNumber : -1;
    this.editor.setValue(code, lineNumber);
  },

  render () {
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
