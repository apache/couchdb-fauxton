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
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

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


  /**
   * A pre-packaged JS editor panel for use on the Edit Index / Mango pages. Includes options for a title, zen mode
   * icon and beautify button.
   */
  var CodeEditorPanel = React.createClass({
    getDefaultProps: function () {
      return {
        id: 'code-editor',
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
            onExit={this.exitZenMode}
          />
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
      this.setState({
        zenModeEnabled: false,
        code: content
      });
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

    render: function () {
      return (
        <div className="control-group">
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


  // a generic Ace Editor component. This should be the only place in the app that instantiates an editor
  var CodeEditor = React.createClass({
    getDefaultProps: function () {
      return {
        id: 'code-editor',
        mode: 'javascript',
        theme: 'idle_fingers',
        fontSize: 13,
        defaultCode: '',
        showGutter: true,
        highlightActiveLine: true,
        showPrintMargin: false,
        autoScrollEditorIntoView: true,
        autoFocus: false,

        // these two options create auto-resizeable code editors, with a maximum number of lines
        setHeightToLineCount: false,
        maxLines: 10,

        // optional editor key commands (e.g. specific save action)
        editorCommands: [],

        // notifies users that there is unsaved changes in the editor when navigating away from the page
        notifyUnsavedChanges: false,

        // an optional array of ignorable Ace editors. Lets us filter out errors based on context
        ignorableErrors: [],

        // un-Reacty, but the code editor is a self-contained component and it's helpful to be able to tie into
        // editor specific events like content changes and leaving the editor
        change: function () {},
        blur: function () {}
      };
    },

    // used purely to keep track of content changes. This is only reset via an explicit clearChanges() call
    getInitialState: function () {
      return {
        originalCode: this.props.defaultCode
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
        this.setEditorValue(props.defaultCode);
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
        return 'Your changes have not been saved. Click cancel to return to the document.';
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
    },

    componentWillUnmount: function () {
      this.removeEvents();
      this.editor.destroy();
    },

    componentWillReceiveProps: function (nextProps) {
      var codeChanged = !_.isEqual(nextProps.defaultCode, this.getValue());
      this.setupAce(nextProps, codeChanged);
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

    // ------------------
    // TODO two things to do after full page doc editor refactor:
    // 1. rename to hasErrors()
    hadValidCode: function () {
      var errors = this.getAnnotations();
      return _.every(errors, function (error) {
        return this.isIgnorableError(error.raw);
      }, this);
    },
    // ------------------

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

    render: function () {
      return (
        <div ref="ace" className="js-editor" id={this.props.id}></div>
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

    setEditorValue: function (code, lineNumber) {
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
        <ReactCSSTransitionGroup transitionName="tray" transitionAppear={true}>
          {this.getChildren()}
        </ReactCSSTransitionGroup>
      );
    }
  });

  // The tray components work as follows:
  // <Tray> Outer wrapper for all components in the tray
  // <TrayLink></TrayLink> The tray button to activate the tray
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

    renderChildren: function () {
      return React.Children.map(this.props.children, function (child, key) {
        return React.addons.cloneWithProps(child, {
          trayVisible: this.state.trayVisible,
          toggleTray: this.toggleTray,
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
    },

  });

  return {
    ConfirmButton: ConfirmButton,
    ToggleHeaderButton: ToggleHeaderButton,
    StyledSelect: StyledSelect,
    CodeEditorPanel: CodeEditorPanel,
    CodeEditor: CodeEditor,
    ZenModeOverlay: ZenModeOverlay,
    Beautify: Beautify,
    PaddedBorderedBox: PaddedBorderedBox,
    Document: Document,
    LoadLines: LoadLines,
    MenuDropDown: MenuDropDown,
    Tray: Tray,
    TrayContents: TrayContents,
    TrayLink: TrayLink
  };

});
