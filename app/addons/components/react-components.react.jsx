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
  'ace/ace',
  'plugins/beautify'
],

function (app, FauxtonAPI, React, Components, ace, beautifyHelper) {

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
    getDefaultProps: function () {
      return {
        id   : 'code-editor',
        mode : 'javascript',
        theme : 'idle_fingers',
        fontSize : 13,
        code  : '',
        showGutter : true,
        onChange   : null,
        highlightActiveLine : true,
        showPrintMargin     : false,
        autoScrollEditorIntoView: true,
        setHeightWithJS: true,
        isFullPageEditor: false,
      };
    },

    setupAce: function (props) {
      this.editor = ace.edit(this.getDOMNode(this.refs.ace));
      // Automatically scrolling cursor into view after selection
      // change this will be disabled in the next version
      // set editor.$blockScrolling = Infinity to disable this message
      this.editor.$blockScrolling = Infinity;

      this.editor.setShowPrintMargin(props.showPrintMargin);
      this.editor.autoScrollEditorIntoView = props.autoScrollEditorIntoView;
      this.setEditorValue(props.code);
      this.setHeightToLineCount();
      this.removeIncorrectAnnotations();
      this.editor.getSession().setMode("ace/mode/" + props.mode);
      this.editor.setTheme("ace/theme/" + props.theme);
      this.editor.setFontSize(this.props.fontSize);
    },

    setupChange: function () {
      this.editor.getSession().on('change', function () {
        this.setHeightToLineCount();
        this.edited = true;
      }.bind(this));

      $(window).on('beforeunload.editor_' + this.editorId, function () {
        if (this.edited) {
          return 'Your changes have not been saved. Click cancel to return to the document.';
        }
      }.bind(this));

      FauxtonAPI.beforeUnload('editor_' + this.editorId, function (deferred) {
        if (this.edited) {
          return 'Your changes have not been saved. Click cancel to return to the document.';
        }
      }.bind(this));
    },

    setHeightToLineCount: function () {
      if (!this.props.setHeightWithJS) {
        return;
      }

      var lines = this.editor.getSession().getDocument().getLength();

      if (this.props.isFullPageEditor) {
        var maxLines = this.getMaxAvailableLinesOnPage();
        lines = lines < maxLines ? lines : maxLines;
      }
      this.editor.setOptions({
        maxLines: lines
      });
    },

    // List of JSHINT errors to ignore
    // Gets around problem of anonymous functions not being a valid statement
    excludedViewErrors: [
      "Missing name in function declaration.",
      "['{a}'] is better written in dot notation."
    ],

    isIgnorableError: function (msg) {
      return _.contains(this.excludedViewErrors, msg);
    },

    removeIncorrectAnnotations: function () {
      var editor = this.editor,
          isIgnorableError = this.isIgnorableError;

      this.editor.getSession().on("changeAnnotation", function () {
        var annotations = editor.getSession().getAnnotations();

        var newAnnotations = _.reduce(annotations, function (annotations, error) {
          if (!isIgnorableError(error.raw)) {
            annotations.push(error);
          }
          return annotations;
        }, []);

        if (annotations.length !== newAnnotations.length) {
          editor.getSession().setAnnotations(newAnnotations);
        }
      });
    },

    componentDidMount: function () {
      this.edited = false;
      this.setupAce(this.props);
      this.setupChange();
    },

    componentWillUnmount: function () {
      $(window).off('beforeunload.editor_' + this.editorId);
      $(window).off('resize.editor', this.onPageResize);
      FauxtonAPI.removeBeforeUnload('editor_' + this.editorId);
      this.editor.destroy();
    },

    componentWillReceiveProps: function (nextProps) {
      this.setupAce(nextProps);
    },

    editSaved: function () {
      this.edited = false;
    },

    getTitleFragment: function () {
      if (!this.props.docs) {
        return <strong>{this.props.title}</strong>;
      }

      return (
        <label>
          <strong>{this.props.title}</strong>
          <a
            className="help-link"
            data-bypass="true"
            href={this.props.docs}
            target="_blank"
          >
          <i className="icon-question-sign"></i>
          </a>
        </label>
      );
    },

    getAnnotations: function () {
      return this.editor.getSession().getAnnotations();
    },

    hadValidCode: function () {
      var errors = this.getAnnotations();
      // By default CouchDB view functions don't pass lint
      return _.every(errors, function (error) {
        return this.isIgnorableError(error.raw);
      }, this);
    },

    setEditorValue: function (code, lineNumber) {
      if (this.edited) { return; }


      if (this.editor.getValue() !== code) {
        lineNumber = lineNumber ? lineNumber : -1;
        this.editor.setValue(code, lineNumber);
      }
    },

    getValue: function () {
      return this.editor.getValue();
    },

    getEditor: function () {
      return this;
    },

    render: function () {
      return (
        <div className="control-group">
          {this.getTitleFragment()}
          <div ref="ace" className="js-editor" id={this.props.id}></div>
          <Beautify code={this.props.code} beautifiedCode={this.setEditorValue} />
        </div>
      );
    }

  });

  /*var CodeEditor = React.createClass({
    render: function () {
      if (!this.props.code .aceEditor.getValue())) {
        return null;
      }

      var code = this.aceEditor ? this.aceEditor.getValue() : this.props.code;
      return (
        <div className="control-group">
          {this.getTitleFragment()}
          <div className="js-editor" id={this.props.id}>{this.props.code}</div>
          <Beautify code={code} beautifiedCode={this.setEditorValue} />
        </div>
      );
    },

    getTitleFragment: function () {
      if (!this.props.docs) {
        return <strong>{this.props.title}</strong>;
      }

      return (
        <label>
          <strong>{this.props.title}</strong>
          <a
            className="help-link"
            data-bypass="true"
            href={this.props.docs}
            target="_blank"
          >
          <i className="icon-question-sign"></i>
          </a>
        </label>
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

    shouldComponentUpdate: function (props) {
      console.log('should update', arguments, _.isEmpty(this.aceEditor.getValue()), this.aceEditor.getValue());
      if (props.code && _.isEmpty(this.aceEditor.getValue())) {
        console.log('update');
        //this.setEditorValue(props.code);
        return true;
      }
      //we don't want to re-render the map editor as we are using backbone underneath
      //which will cause the editor to break
      this.aceEditor.editSaved();

      return false;
    },

    componentWillUnmount: function () {
      this.aceEditor.remove();
    }

  });*/

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
                "{this.props.docIdentifier}"
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
