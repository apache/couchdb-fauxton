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
  'addons/documents/index-results/stores',
  'addons/documents/index-results/actions',
  'addons/components/react-components.react',
  'addons/documents/resources',

  'plugins/prettify'
],

function (app, FauxtonAPI, React, Stores, Actions, Components, Documents) {
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
  var store = Stores.indexResultsStore;
  var BulkActionComponent = Components.BulkActionComponent;

  var NoResultScreen = React.createClass({
    render: function () {
      return (
        <div className="watermark-logo">
          <h3>{this.props.text}</h3>
        </div>
      );
    }
  });

  var TableRow = React.createClass({
    propTypes: {
      docIdentifier: React.PropTypes.string.isRequired,
      docChecked: React.PropTypes.func.isRequired,
      isSelected: React.PropTypes.bool.isRequired,
      index: React.PropTypes.number.isRequired,
      data: React.PropTypes.object.isRequired
    },

    onChange: function (e) {
      this.props.docChecked(this.props.docIdentifier, this.props.data, e);
    },

    getInitialState: function () {
      return {
        checked: this.props.isSelected
      };
    },

    getRowContents: function (element, rownumber) {
      var row = this.props.schema.map(function (k, i) {
        var el = element.content;
        var key = 'tableview-data-cell-' + rownumber + k + i + el[k];
        var stringified = typeof el[k] === 'object' ? JSON.stringify(el[k]) : el[k];
        var className = k === '_id' ? 'tableview-data-cell-id' : null;

        return (
          <td className={className} key={key} title={stringified}>
            {k === '_id' ? this.maybeGetUrl(element.url, stringified) : stringified}
          </td>
        );
      }.bind(this));

      return row;
    },

    maybeGetUrl: function (url, stringified) {
      if (!url) {
        return stringified;
      }

      return (
        <a href={url}>
          {stringified}
        </a>
      );
    },

    maybeGetCheckboxCell: function (i) {
      if (!this.props.docId) {
        return null;
      }

      return (
        <td className="tableview-checkbox-cell" key={"tableview-checkbox-cell-" + i}>
          <input
            id={"checkbox-" + this.props.docIdentifier}
            checked={this.props.isSelected}
            type="checkbox"
            onChange={this.onChange} />
        </td>
      );
    },

    render: function () {
      var i = this.props.index;

      return (
        <tr key={"tableview-content-row-" + i}>
          {this.maybeGetCheckboxCell(i)}
          {this.getRowContents(this.props.data, i)}
        </tr>
      );
    }
  });

  var TableView = React.createClass({
    getContentRows: function () {
      var data = this.props.data.results;
      var schema = this.props.data.schema;

      var res = data.map(function (el, i) {

        return (
          <TableRow
            key={"tableview-row-component-" + i}
            index={i}
            data={el}
            docId={el.id}
            docIdentifier={el.id || "tableview-row-component-" + i}
            docChecked={this.props.docChecked}
            isSelected={this.props.isSelected(el.id)}
            schema={schema} />
        );
      }.bind(this));

      return res;
    },

    getHeader: function () {
      var row = this.props.data.schema.map(function (el, i) {
        return <th key={"header-el-" + i} title={el}>{el}</th>;
      });

      var box = null;

      if (this.props.isListDeletable) {
        box = (<th className="tableview-header-el-checkbox" key="tableview-header-el-checkbox"></th>);
      }

      return (
        <tr key="tableview-content-row-header">
          {box}
          {row}
        </tr>
      );
    },

    render: function () {
      var header = this.getHeader();
      var contentRows = this.getContentRows();

      return (
        <table className="table table-striped table-view-docs">
          <thead>
            {header}
          </thead>
          <tbody>
            {contentRows}
          </tbody>
        </table>
      );
    }
  });


  var ResultsScreen = React.createClass({

    onDoubleClick: function (id, doc) {
      FauxtonAPI.navigate(doc.url);
    },

    getUrlFragment: function (url) {
      if (!this.props.isEditable) {
        return null;
      }

      return (
        <a href={url}>
          <i className="fonticon-pencil"></i>
        </a>);
    },

    getDocumentList: function () {
      var noop = function () {};
      var data = this.props.results.results;

      return _.map(data, function (doc, i) {
        return (
         <Components.Document
           key={doc.id + i}
           doc={doc}
           onDoubleClick={this.props.isEditable ? this.onDoubleClick : noop}
           keylabel={doc.keylabel}
           docContent={doc.content}
           checked={this.props.isSelected(doc.id)}
           header={doc.header}
           docChecked={this.props.docChecked}
           isDeletable={doc.isDeletable}
           docIdentifier={doc.id} >
           {doc.url ? this.getUrlFragment('#' + doc.url) : doc.url}
         </Components.Document>
       );
      }, this);
    },

    getDocumentStyleView: function (loadLines) {
      var classNames = 'view';

      if (this.props.isListDeletable) {
        classNames += ' show-select';
      }

      return (
        <div className={classNames}>
          {loadLines}


          <div id="doc-list">
            <ReactCSSTransitionGroup transitionName="slow-fade">
              {this.getDocumentList()}
            </ReactCSSTransitionGroup>
          </div>
        </div>
      );
    },

    getTableStyleView: function (loadLines) {
      return (
        <div>
          <TableView
            docChecked={this.props.docChecked}
            isSelected={this.props.isSelected}
            isListDeletable={this.props.isListDeletable}
            data={this.props.results} />
        </div>
      );
    },

    render: function () {

      var loadLines = null;
      var isTableView = this.props.isTableView;

      if (this.props.isLoading) {
        loadLines = <Components.LoadLines />;
      }

      var mainView = isTableView ? this.getTableStyleView(loadLines) : this.getDocumentStyleView(loadLines);
      return (
        <div className="document-result-screen">
          <BulkActionComponent
            removeItem={this.props.removeItem}
            isChecked={this.props.allDocumentsSelected}
            hasSelectedItem={this.props.hasSelectedItem}
            selectAll={this.selectAllDocs}
            toggleSelect={this.toggleSelectAll}
            title="Select all docs that can be..." />
          {mainView}
        </div>
      );
    },

    selectAllDocs: function () {
      Actions.selectAllDocuments();
    },

    toggleSelectAll: function () {
      Actions.toggleAllDocuments();
    },

    componentDidMount: function () {
      prettyPrint();
    },

    componentDidUpdate: function () {
      prettyPrint();
    },

  });



  var ViewResultListController = React.createClass({
    getStoreState: function () {
      return {
        hasResults: store.hasResults(),
        results: store.getResults(),
        selectedItems: store.getSelectedItems(),
        isLoading: store.isLoading(),
        isEditable: store.isEditable(),
        textEmptyIndex: store.getTextEmptyIndex(),
        isTableView: store.getIsTableView(),

        canDeselectAll: store.canDeselectAll(),
        canSelectAll: store.canSelectAll(),
        allDocumentsSelected: store.areAllDocumentsSelected(),
        hasSelectedItem: !!store.getSelectedItemsLength()
      };
    },

    isSelected: function (id) {
      return !!this.state.selectedItems[id];
    },

    removeItem: function () {
      Actions.deleteSelected();
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    componentDidMount: function () {
      store.on('change', this.onChange, this);
    },

    componentWillUnmount: function () {
      store.off('change', this.onChange);
    },

    onChange: function () {
      this.setState(this.getStoreState());
    },

    docChecked: function (id) {
      Actions.selectDoc(id);
    },

    render: function () {
      var view = <NoResultScreen text={this.state.textEmptyIndex}/>;

      if (this.state.hasResults) {
        view = <ResultsScreen
          removeItem={this.removeItem}
          hasSelectedItem={this.state.hasSelectedItem}
          allDocumentsSelected={this.state.allDocumentsSelected}
          canSelectAll={this.state.canSelectAll}
          isSelected={this.isSelected}
          isEditable={this.state.isEditable}
          isListDeletable={this.state.results.hasEditableAndDeleteableDoc}
          docChecked={this.docChecked}
          isLoading={this.state.isLoading}
          results={this.state.results}
          isTableView={this.state.isTableView} />;
      }

      return (
        view
      );
    }
  });

  var Views = {
    List: ViewResultListController,
    ResultsScreen: ResultsScreen
  };

  return Views;
});
