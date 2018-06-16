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
import {CodeEditor} from './codeeditor';
import {Beautify} from './beautify';
import {ZenModeOverlay} from './zenmodeoverlay';


// list of JSHINT errors to ignore: gets around problem of anonymous functions not being valid
const ignorableErrors = [
  'Missing name in function declaration.',
  "['{a}'] is better written in dot notation."
];

/**
 * A pre-packaged JS editor panel for use on the Edit Index / Mango pages. Includes options for a title, zen mode
 * icon and beautify button.
 */
export class CodeEditorPanel extends React.Component {
  static defaultProps = {
    id: 'code-editor',
    className: '',
    defaultCode: '',
    title: '',
    docLink: '',
    allowZenMode: true,
    blur () {}
  };

  getStoreState = () => {
    return {
      zenModeEnabled: false,
      code: this.props.defaultCode
    };
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.defaultCode !== this.props.defaultCode) {
      this.setState({ code: nextProps.defaultCode });
    }
  }

  getZenModeIcon = () => {
    if (this.props.allowZenMode) {
      return <span className="fonticon fonticon-resize-full zen-editor-icon" title="Enter Zen mode" onClick={this.enterZenMode}></span>;
    }
  };

  getDocIcon = () => {
    if (this.props.docLink) {
      return (
        <a className="help-link"
          data-bypass="true"
          href={this.props.docLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="icon-question-sign"></i>
        </a>
      );
    }
  };

  getZenModeOverlay = () => {
    if (this.state.zenModeEnabled) {
      return (
        <ZenModeOverlay
          defaultCode={this.state.code}
          mode={this.props.mode}
          ignorableErrors={ignorableErrors}
          onExit={this.exitZenMode} />
      );
    }
  };

  enterZenMode = () => {
    this.setState({
      zenModeEnabled: true,
      code: this.codeEditor.getValue()
    });
  };

  exitZenMode = (content) => {
    this.setState({ zenModeEnabled: false });
    this.getEditor().setValue(content);
  };

  getEditor = () => {
    return this.codeEditor;
  };

  getValue = () => {
    return this.getEditor().getValue();
  };

  beautify = (code) => {
    this.setState({ code: code });
    this.getEditor().setValue(code);
  };

  update = () => {
    this.getEditor().setValue(this.state.code);
  };

  state = this.getStoreState();

  render() {
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
          ref={node => this.codeEditor = node}
          mode="javascript"
          defaultCode={this.state.code}
          showGutter={true}
          ignorableErrors={ignorableErrors}
          setHeightToLineCount={true}
          maxLines={10000}
          blur={this.props.blur}
        />
        <Beautify code={this.state.code} beautifiedCode={this.beautify} />
        {this.getZenModeOverlay()}
      </div>
    );
  }
}
