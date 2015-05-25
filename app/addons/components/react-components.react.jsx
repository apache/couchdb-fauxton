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
        id: 'code-editor',
        mode: 'javascript',
        theme: 'idle_fingers',
        fontSize: 13,
        code: '',
        showEditorOnly: false,
        showGutter: true,
        highlightActiveLine: true,
        showPrintMargin: false,
        autoScrollEditorIntoView: true,
        setHeightWithJS: true,
        isFullPageEditor: false,
        disableUnload: false,
        allowZenMode: true,
        allowAnonFunction: true, // allows JS fragments, like `function (doc) { emit(doc._id, 1); `}. Suppresses JS errors
        change: function () {}
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    getStoreState: function () {
      return {
        zenModeEnabled: false
      };
    },

    hasChanged: function () {
      return !_.isEqual(this.props.code, this.getValue());
    },

    setupAce: function (props, shouldUpdateCode) {
      var el = this.refs.ace.getDOMNode();

      //set the id so our nightwatch tests can find it
      el.id = props.id;

      this.editor = ace.edit(el);
      // Automatically scrolling cursor into view after selection
      // change this will be disabled in the next version
      // set editor.$blockScrolling = Infinity to disable this message
      this.editor.$blockScrolling = Infinity;

      if (shouldUpdateCode) {
        this.setEditorValue(props.code);
      }

      this.editor.setShowPrintMargin(props.showPrintMargin);
      this.editor.autoScrollEditorIntoView = props.autoScrollEditorIntoView;
      this.editor.setOption('highlightActiveLine', this.props.highlightActiveLine);
      this.setHeightToLineCount();

      if (this.props.allowAnonFunction) {
        this.removeIncorrectAnnotations(this.editor);
      }

      this.editor.getSession().setMode("ace/mode/" + props.mode);
      this.editor.setTheme("ace/theme/" + props.theme);
      this.editor.setFontSize(props.fontSize);
      this.editor.getSession().setUseSoftTabs(true);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    setupEvents: function () {
      this.editor.on('blur', _.bind(this.saveCodeChange, this));

      if (this.props.disableUnload) {
        return;
      }

      $(window).on('beforeunload.editor_' + this.props.id, _.bind(this.quitWarningMsg));
      FauxtonAPI.beforeUnload('editor_' + this.props.id, _.bind(this.quitWarningMsg, this));
    },

    saveCodeChange: function () {
      this.props.change(this.getValue());
    },

    quitWarningMsg: function () {
      if (this.hasChanged()) {
        return 'Your changes have not been saved. Click cancel to return to the document.';
      }
    },

    removeEvents: function () {
      if (this.props.disableUnload) {
        return;
      }

      $(window).off('beforeunload.editor_' + this.props.id);
      FauxtonAPI.removeBeforeUnload('editor_' + this.props.id);
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

    removeIncorrectAnnotations: function (editor) {
      var isIgnorableError = this.isIgnorableError;
      editor.getSession().on("changeAnnotation", function () {
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
      this.setupAce(this.props, true);
      this.setupEvents();
    },

    componentWillUnmount: function () {
      this.removeEvents();
      this.editor.destroy();
    },

    componentWillReceiveProps: function (nextProps) {
      var codeChanged = !_.isEqual(nextProps.code, this.getValue());
      this.setupAce(nextProps, codeChanged);
    },

    editSaved: function () {
      return this.hasChanged();
    },

    zenModeIcon: function () {
      if (this.props.allowZenMode) {
        return <span className="fonticon fonticon-resize-full zen-editor-icon" title="Enter Zen mode" onClick={this.enterZenMode}></span>;
      }
    },

    enterZenMode: function () {
      this.setState({ zenModeEnabled: true });
    },

    getTitleFragment: function () {
      if (!this.props.docs) {
        return (<strong>{this.props.title}</strong>);
      }

      return (
        <label>
          <strong>{this.props.title + ' '}</strong>
          <a
            className="help-link"
            data-bypass="true"
            href={this.props.docs}
            target="_blank"
          >
          <i className="icon-question-sign"></i>
          </a>
          {this.zenModeIcon()}
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
      lineNumber = lineNumber ? lineNumber : -1;
      this.editor.setValue(code, lineNumber);
    },

    getValue: function () {
      return this.editor.getValue();
    },

    getEditor: function () {
      return this;
    },

    getZenModeOverlay: function () {
      if (this.state.zenModeEnabled) {
        return (
          <ZenModeOverlay
            visible={this.state.zenModeEnabled}
            defaultCode={this.getValue()}
            mode={this.props.mode}
            removeIncorrectAnnotations={this.removeIncorrectAnnotations}
            onExit={this.onExitZenMode}
          />
        );
      }
    },

    onExitZenMode: function (content) {
      this.setEditorValue(content);
      this.setState({ zenModeEnabled: false });
    },

    render: function () {
      if (this.props.showEditorOnly) {
        return (<div ref="ace" className="js-editor" id={this.props.id}></div>);
      }

      return (
        <div className="control-group">
          {this.getTitleFragment()}
          <div ref="ace" className="js-editor" id={this.props.id}></div>
          <Beautify code={this.props.code} beautifiedCode={this.setEditorValue} />
          {this.getZenModeOverlay()}
        </div>
      );
    }
  });


  // Zen mode editing has very few options:
  // - It covers the full screen hiding everything else.
  // - It has two themes: light & dark (choice stored in local storage)
  // - It has no save option, but has a 1-1 map with a <CodeEditor /> element which gets updated when the user leaves
  // - [Escape] closes the mode, as does clicking the shrink icon at the top right
  var ZenModeOverlay = React.createClass({
    getDefaultProps: function () {
      return {
        mode: 'javascript',
        defaultCode: '',
        removeIncorrectAnnotations: null,
        onExit: null,
        highlightActiveLine: false
      };
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
      this.update();
      this.editor.focus();
      $(this.refs.exit.getDOMNode()).tooltip({ placement: 'left' });
      $(this.refs.theme.getDOMNode()).tooltip({ placement: 'left' });
    },

    componentDidUpdate: function () {
      this.update();
    },

    exitZenMode: function () {
      this.props.onExit(this.editor.getValue());
    },

    toggleTheme: function () {
      var newTheme = (this.state.theme === 'dark') ? 'light' : 'dark';
      this.setState({
        theme: newTheme,
        code: this.editor.getValue()
      });
      app.utils.localStorageSet('zenTheme', newTheme);
    },

    update: function () {
      var el = this.refs.ace.getDOMNode();
      this.editor = ace.edit(el);
      this.editor.$blockScrolling = Infinity;
      this.setEditorValue(this.state.code);

      var theme = this.state.theme === 'dark' ? 'idle_fingers' : 'dawn';
      this.editor.setTheme('ace/theme/' + theme);
      this.editor.getSession().setMode('ace/mode/' + this.props.mode);
      this.editor.getSession().setUseSoftTabs(true);
      this.editor.setOption('highlightActiveLine', this.props.highlightActiveLine);
      this.editor.setShowPrintMargin(false);

      // escape exits zen mode. Add the key binding
      this.editor.commands.addCommand({
        name: "close",
        bindKey: { win: "ESC", mac: "ESC" },
        exec: function () {
          this.exitZenMode();
        }.bind(this)
      });

      // if an annotation removal method has been passed, ensure it's called so that error messages are cleaned
      if (this.props.removeIncorrectAnnotations) {
        this.props.removeIncorrectAnnotations(this.editor);
      }
    },

    setEditorValue: function (code, lineNumber) {
      lineNumber = lineNumber ? lineNumber : -1;
      this.editor.setValue(code, lineNumber);
    },

    render: function () {
      var classes = "full-page-editor-modal-wrapper zen-theme-" + this.state.theme;
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
          <div ref="ace" className="js-editor"></div>
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

  var ReactComponents = {
    ConfirmButton: ConfirmButton,
    ToggleHeaderButton: ToggleHeaderButton,
    StyledSelect: StyledSelect,
    CodeEditor: CodeEditor,
    ZenModeOverlay: ZenModeOverlay,
    Beautify: Beautify,
    PaddedBorderedBox: PaddedBorderedBox,
    Document: Document,
    LoadLines: LoadLines,
    MenuDropDown: MenuDropDown
  };

  return ReactComponents;

});
