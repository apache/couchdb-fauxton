define([
  "app",
  "api",
  "react",
  "addons/documents/stores",
  "addons/documents/actions",
  "addons/fauxton/components",
  'addons/documents/animate.react'
],

function(app, FauxtonAPI, React, Stores, Actions, Components, VelocityTransitionGroup) {
  var indexEditorStore = Stores.indexEditorStore;
  var getDocUrl = app.helpers.getDocUrl;

  var ToggleButton = React.createClass({

    render: function() {
      return (
        <div className="dashboard-upper-menu">
          <ul className="nav nav-tabs" id="db-views-tabs-nav">
            <li className="active"> 
              <a ref="toggle" data-bypass="true" id="index-nav" data-toggle="tab" href="#index" onClick={this.props.toggleEditor}>
                <i className="fonticon-wrench fonticon"></i>
                {this.props.title}
              </a>
            </li>
          </ul>
        </div>
      );
    }
  });

  var DesignDocSelector = React.createClass({

    getStoreState: function () {
      return {
        designDocId: indexEditorStore.getDesignDocId(),
        designDocs: indexEditorStore.getDesignDocs(),
        newDesignDoc: indexEditorStore.isNewDesignDoc()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    getNewDesignDocInput: function () {
      return (
        <div id="new-ddoc-section" className="span5">
          <label className="control-label" htmlFor="new-ddoc"> _design/ </label>
          <div className="controls">
            <input value={this.state.designDoc} type="text" id="new-ddoc" onChange={this.onDesignDocChange} placeholder="newDesignDoc" />
          </div>
        </div>
      );
    },

    onDesignDocChange: function (event) {
      Actions.designDocChange('_design/' + event.target.value, true);
    },

    getDesignDocOptions: function () {
      return this.state.designDocs.map(function (doc, i) {
        return <option key={i} value={doc.id}> {doc.id} </option>;
      });
    },

    render: function () {
      var designDocOptions = this.getDesignDocOptions();
      var designDocInput;
      var designDocId = this.state.designDocId;

      if (this.state.newDesignDoc) {
        designDocInput = this.getNewDesignDocInput();
        designDocId = 'new';
      }

      return (
        <div className="control-group design-doc-group">
          <div className="span3">
            <label htmlFor="ddoc">Save to Design Document 
              <a className="help-link" data-bypass="true" href={getDocUrl('DESIGN_DOCS')} target="_blank">
                <i className="icon-question-sign">
                </i>
              </a>
            </label>
            <select id="ddoc" value={designDocId} onChange={this.selectChange}>
              <optgroup label="Select a document">
                <option value="new">New Design Document </option>
                {designDocOptions}
              </optgroup>
            </select>
          </div>

          {designDocInput}
        </div>
      );
    },

    selectChange: function (event) {
      var designDocId = event.target.value;

      if (designDocId === 'new') {
        Actions.newDesignDoc();
      } else {
        Actions.designDocChange(designDocId, false);
      }
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      indexEditorStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      indexEditorStore.off('change', this.onChange);
    },

  });

  var MapEditor = React.createClass({
    getInitialState: function () {
      return {
        map: indexEditorStore.getMap()
      };
    },

    render: function () {
      return (
        <div className="control-group">
          <label htmlFor="map-function">Map function <a className="help-link" data-bypass="true" href={getDocUrl('MAP_FUNCS')} target="_blank"><i className="icon-question-sign"></i></a></label>
          <div className="js-editor" id="map-function"> {this.state.map}</div>
          <button className="beautify beautify_map btn btn-primary btn-large hide beautify-tooltip" type="button" data-toggle="tooltip" title="Reformat your minified code to make edits to it.">beautify this code</button>
        </div>
      );
    },

    getMapValue: function () {
      return this.mapEditor.getValue();
    },

    getEditor: function () {
      return this.mapEditor;
    },

    componentDidMount: function () {
      this.mapEditor = new Components.Editor({
        editorId: "map-function",
        mode: "javascript",
        couchJSHINT: true
      });
      this.mapEditor.render();
    }
  }); 

  var ReduceEditor = React.createClass({

    getStoreState: function () {
      return {
        reduce: indexEditorStore.getReduce(),
        reduceOptions: indexEditorStore.reduceOptions(),
        reduceSelectedOption: indexEditorStore.reduceSelectedOption(),
        hasCustomReduce: indexEditorStore.hasCustomReduce(),
        hasReduce: indexEditorStore.hasReduce()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    getOptionsList: function () {
      return _.map(this.state.reduceOptions, function (reduce, i) {
        return <option key={i} value={reduce}> {reduce} </option>;
      }, this);

    },

    getReduceValue: function () {
      if (!this.state.hasReduce) {
        return null;
      }

      if (!this.state.hasCustomReduce) {
        return this.state.reduce;
      }

      return this.reduceEditor.getValue();
    },

    getEditor: function () {
      return this.reduceEditor;
    },

    render: function () {
      var reduceOptions = this.getOptionsList(),
      customReduceSection;

      if (this.state.hasCustomReduce) {
        customReduceSection = <div className="control-group reduce-function">
          <label htmlFor="reduce-function">Custom Reduce function</label>
          <div className="js-editor" id="reduce-function"> {this.state.reduce}</div>
        </div>;
      }

      return (
        <div>
          <div className="control-group">
            <label htmlFor="reduce-function-selector">Reduce (optional) <a className="help-link" data-bypass="true" href={getDocUrl('REDUCE_FUNCS')} target="_blank"><i className="icon-question-sign"></i></a></label>

            <select id="reduce-function-selector" value={this.state.reduceSelectedOption} onChange={this.selectChange}>
              {reduceOptions}
            </select>
          </div>

          {customReduceSection}
        </div>
      );
    },

    selectChange: function (event) {
      Actions.selectReduceChanged(event.target.value);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    renderEditor: function () {
      if (!this.state.hasReduce) {
        return;
      }

      if (this.state.hasCustomReduce) {
        this.reduceEditor = new Components.Editor({
          editorId: "reduce-function",
          mode: "javascript",
          couchJSHINT: true
        });
        this.reduceEditor.render();
      }
    },

    componentDidMount: function () {
      indexEditorStore.on('change', this.onChange, this);
      this.renderEditor();

    },

    componentWillUnmount: function() {
      indexEditorStore.off('change', this.onChange);
    },

    componentDidUpdate: function () {
      this.renderEditor();
    }

  });

  var DeleteView = React.createClass({
    getStoreState: function () {
      return {
        isNewView: indexEditorStore.isNewView(),
        designDocs: indexEditorStore.getDesignDocs(),
        viewName: indexEditorStore.getViewName(),
        designDocId: indexEditorStore.getDesignDocId(),
        database: indexEditorStore.getDatabase()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    render: function () {
      if (this.state.isNewView) {
        return null;
      }

      return (
        <button onClick={this.deleteView} className="btn btn-danger delete">
          <i className="icon fonticon-cancel-circled"></i> 
          Delete
        </button>
      );
    },

    deleteView: function (event) {
      event.preventDefault();

      if (!confirm('Are you sure you want to delete this view?')) {return;}

      Actions.deleteView({
        designDocs: this.state.designDocs,
        viewName: this.state.viewName, 
        designDocId: this.state.designDocId, 
        database: this.state.database
      });
    }

  });

  var Editor = React.createClass({
    getStoreState: function () {
      return {
        database: indexEditorStore.getDatabase(),
        isNewView: indexEditorStore.isNewView(),
        viewName: indexEditorStore.getViewName(),
        designDocs: indexEditorStore.getDesignDocs(),
        hasDesignDocChanged: indexEditorStore.hasDesignDocChanged(),
        newDesignDoc: indexEditorStore.isNewDesignDoc(),
        designDocId: indexEditorStore.getDesignDocId()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    componentDidMount: function () {
      indexEditorStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      indexEditorStore.off('change', this.onChange);
    },

    hasValidCode: function() {
      return _.every(["mapEditor", "reduceEditor"], function(editorName) {
        var editor = this.refs[editorName].getEditor();
        if (editorName === "reduceEditor" && !indexEditorStore.hasCustomReduce()) {
          return true;
        }
        return editor.hadValidCode();
      }, this);
    },

    saveView: function (event) {
      event.preventDefault();

      if (!this.hasValidCode()) {
        FauxtonAPI.addNotification({
          msg:  "Please fix the Javascript errors and try again.",
          type: "error",
          selector: "#define-view .errors-container",
          clear: true
        });
        return;
      }

      Actions.saveView({
        database: this.state.database,
        newView: this.state.isNewView,
        viewName: this.state.viewName,
        designDocId: this.state.designDocId,
        newDesignDoc: this.state.newDesignDoc,
        designDocChanged: this.state.hasDesignDocChanged,
        map: this.refs.mapEditor.getMapValue(),
        reduce: this.refs.reduceEditor.getReduceValue(),
        designDocs: this.state.designDocs
      });
    },

    viewChange: function (event) {
      this.setState({viewName: event.target.value});
    },

    render: function () {
      return (
        <div className="tab-content" >
          <div className="tab-pane active" id="index">
            <div id="define-view" className="ddoc-alert well">
              <div className="errors-container"> </div>
              <form className="form-horizontal view-query-save" onSubmit={this.saveView}>

                <DesignDocSelector />

                <div className="control-group">
                  <label htmlFor="index-name">Index name <a className="help-link" data-bypass="true" href={getDocUrl('VIEW_FUNCS')} target="_blank"><i className="icon-question-sign"></i></a></label>
                  <input type="text" id="index-name" value={this.state.viewName} onChange={this.viewChange} placeholder="Index name" />
                </div>

                <MapEditor ref="mapEditor"/>
                <ReduceEditor ref="reduceEditor"/>

                <div className="control-group">
                  <button className="btn btn-success save"><i className="icon fonticon-ok-circled"></i> Save &amp; Build Index</button>
                  <DeleteView />
                </div>
              </form>
            </div>

          </div>
        </div>
      );
    }
  });

  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

  var EditorController = React.createClass({
    getInitialState: function () {
      return {
        showEditor: indexEditorStore.showEditor(),
        isNewView: indexEditorStore.isNewView(),
        title: indexEditorStore.getTitle()
      };
    },

    onChange: function () {
      this.setState({showEditor: indexEditorStore.showEditor()});
    },

    componentDidMount: function() {
      indexEditorStore.on('change', this.onChange, this);
    },

    componentWillUnmount: function() {
      indexEditorStore.off('change', this.onChange);
    },

    toggleEditor: function () {
      Actions.toggleEditor();
    },

    render: function () {
      var editor = null;
      //a bit of hack for now.
      var wrapperClassName = "editorWrapper";
      var doTransitions = !this.state.isNewView;

      if (this.state.showEditor) {
        //key is needed for animation;
        editor = <Editor key={1} />;
        wrapperClassName = '';
      }

      return (
        <div className={wrapperClassName}>
          <ToggleButton title={this.state.title} toggleEditor={this.toggleEditor} />
          <VelocityTransitionGroup transitionName="fadeInDown" transitionLeave={doTransitions} transitionEnter={doTransitions}>
            {editor}
          </VelocityTransitionGroup>
        </div>
      );
    }

  });

  var Views = {
    renderEditor: function (el) {
      React.render(<EditorController/>, el);
    },
    removeEditor: function (el) {
      React.unmountComponentAtNode(el);
    },
    ToggleButton: ToggleButton,
    ReduceEditor: ReduceEditor,
    Editor: Editor,
    DesignDocSelector: DesignDocSelector
  };

  return Views;
});


