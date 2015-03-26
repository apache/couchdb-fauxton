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
  'addons/fauxton/components',
  'plugins/beautify'
],

function (app, FauxtonAPI, React, Components, beautifyHelper) {

  var ToggleHeaderButton = React.createClass({
    render: function () {
      var iconClasses = 'icon ' + this.props.fonticon + ' ' + this.props.innerClasses,
          containerClasses = 'button ' + this.props.containerClasses;

      if (this.props.setEnabledClass) {
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

  var CodeEditor = React.createClass({
    render: function () {
      var code = this.aceEditor ? this.aceEditor.getValue() : this.props.code;
      var docsLink;
      if (this.props.docs) {
        docsLink = <a
                      className="help-link"
                      data-bypass="true"
                      href={this.props.docs}
                      target="_blank"
                    >
                    <i className="icon-question-sign"></i>
                   </a>;

      }
      return (
        <div className="control-group">
          <label htmlFor="ace-function">
            <strong>{this.props.title}</strong>
            {docsLink}
          </label>
          <div className="js-editor" id={this.props.id}>{this.props.code}</div>
          <Beautify code={code} beautifiedCode={this.setEditorValue} />
        </div>
      );
    },

    setEditorValue: function (code) {
      this.aceEditor.setValue(code);
      //this is not a good practice normally but because we working with a backbone view as the mapeditor
      //that keeps the map code state this is the best way to force a render so that the beautify button will hide
      this.forceUpdate();
    },

    getValue: function () {
      return this.aceEditor.getValue();
    },

    getEditor: function () {
      return this.aceEditor;
    },

    componentDidMount: function () {
      this.aceEditor = new Components.Editor({
        editorId: this.props.id,
        mode: 'javascript',
        couchJSHINT: true
      });
      this.aceEditor.render();
    },

    shouldComponentUpdate: function () {
      //we don't want to re-render the map editor as we are using backbone underneath
      //which will cause the editor to break
      this.aceEditor.editSaved();

      return false;
    },

    componentWillUnmount: function () {
      this.aceEditor.remove();
    }

  });

  var Beautify = React.createClass({
    noOfLines: function () {
      return this.props.code.split(/\r\n|\r|\n/).length;
    },

    canBeautify: function () {
      if (this.noOfLines() === 1) {
        return true;
      }

      return false;
    },

    addTooltip: function () {
      if (this.canBeautify) {
        $('.beautify-tooltip').tooltip();
      }
    },

    componentDidMount: function () {
      this.addTooltip();
    },

    beautify: function (event) {
      event.preventDefault();
      var beautifiedCode = beautifyHelper(this.props.code);
      this.props.beautifiedCode(beautifiedCode);

    },

    render: function () {
      if (!this.canBeautify()) {
        return null;
      }

      return (
        <button
          onClick={this.beautify}
          className="beautify beautify_map btn btn-primary btn-large beautify-tooltip"
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
        <div className="doc-edit-symbol pull-right">
          {this.props.children}
        </div>
      );
    },

    getCheckbox: function () {
      return (
        <div className="checkbox inline">
          <input
            id={'checkbox-' + this.props.docIdentifier}
            checked={this.props.checked ? 'checked="checked"': null}
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
                "{this.props.docIdentifier}"
              </span>
              {this.getUrlFragment()}
            </header>
            <div className="doc-data">
              <pre className="prettyprint">{this.props.docContent}</pre>
            </div>
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
        <button type="submit" className="btn btn-success save">
          <i className="icon fonticon-ok-circled"></i>
          {this.props.text}
        </button>
      );
    }
  });


  var ReactComponents = {
    ConfirmButton: ConfirmButton,
    ToggleHeaderButton: ToggleHeaderButton,
    StyledSelect: StyledSelect,
    CodeEditor: CodeEditor,
    Beautify: Beautify,
    PaddedBorderedBox: PaddedBorderedBox,
    Document: Document,
    LoadLines: LoadLines
  };

  return ReactComponents;

});
