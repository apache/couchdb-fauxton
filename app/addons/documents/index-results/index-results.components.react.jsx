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

import app from "../../../app";
import FauxtonAPI from "../../../core/api";
import React from "react";
import Stores from "./stores";
import Actions from "./actions";
import Components from "../../components/react-components.react";
import Documents from "../resources";
import FauxtonComponents from "../..//fauxton/components.react";
import { SplitButton, MenuItem } from "react-bootstrap";
import ReactSelect from "react-select";
import "../../../../assets/js/plugins/prettify";

const {LoadLines, BulkActionComponent} = Components;
const { Clipboard } = FauxtonComponents;
const store  = Stores.indexResultsStore;

var NoResultsScreen = React.createClass({
  propTypes: {
    text: React.PropTypes.string.isRequired
  },

  render: function () {
    return (
      <div className="no-results-screen">
        <div className="watermark-logo"></div>
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
    this.props.docChecked(this.props.el.id, this.props.el._rev);
  },

  getInitialState: function () {
    return {
      checked: this.props.isSelected
    };
  },

  getRowContents: function (element, rowNumber) {
    var el = element.content;

    var row = this.props.data.selectedFields.map(function (k, i) {

      var key = 'tableview-data-cell-' + rowNumber + k + i + el[k];
      var stringified = typeof el[k] === 'object' ? JSON.stringify(el[k], null, '  ') : el[k];

      return (
        <td key={key} title={stringified}>
          {stringified}
        </td>
      );
    }.bind(this));

    return row;
  },

  maybeGetSpecialField: function (element, i) {
    if (!this.props.data.hasMetadata) {
      return null;
    }

    var el = element.content;

    return (
      <td className="tableview-data-cell-id" key={'tableview-data-cell-id' + i}>
        <div>{this.maybeGetUrl(element.url, el._id || el.id)}</div>
        <div>{el._rev}</div>
      </td>
    );
  },

  maybeGetUrl: function (url, stringified) {
    if (!url) {
      return stringified;
    }

    return (
      <a href={'#' + url}>
        {stringified}
      </a>
    );
  },

  maybeGetCheckboxCell: function (el, i) {
    return (
      <td className="tableview-checkbox-cell" key={"tableview-checkbox-cell-" + i}>
        {el.isDeletable ? <input
          id={"checkbox-" + this.props.docIdentifier}
          checked={this.props.isSelected}
          type="checkbox"
          onChange={this.onChange} /> : null}
      </td>
    );
  },

  getAdditionalInfoRow: function (el) {
    const attachmentCount = Object.keys(el._attachments || {}).length;
    let attachmentIndicator = null;
    let textAttachments = null;

    const conflictCount = Object.keys(el._conflicts || {}).length;
    let conflictIndicator = null;
    let textConflicts = null;


    if (attachmentCount) {
      textAttachments = attachmentCount === 1 ? attachmentCount + ' Attachment' : attachmentCount + ' Attachments';
      attachmentIndicator = (
        <div style={{display: 'inline', marginLeft: '5px'}} title={textAttachments}>
          <i className="icon fonticon-paperclip"></i>{attachmentCount}
        </div>
      );
    }

    if (conflictCount) {
      textConflicts = conflictCount === 1 ? conflictCount + ' Conflict' : conflictCount + ' Conflicts';
      conflictIndicator = (
        <div className="tableview-conflict" data-conflicts-indicator style={{display: 'inline'}} title={textConflicts}>
          <i
            style={{fontSize: '17px'}}
            className="icon icon-code-fork"></i>{conflictCount}
        </div>
      );
    }

    return (
      <td className="tableview-el-last">
        {conflictIndicator}
        {attachmentIndicator}
      </td>
    );
  },

  getCopyButton: function (el) {
    var text = JSON.stringify(el, null, '  ');
    return (
      <td title={text} className="tableview-el-copy">
        <Clipboard
          onClipboardClick={this.showCopiedMessage}
          title={text}
          text={text} />
      </td>
    );
  },

  showCopiedMessage: function () {
    FauxtonAPI.addNotification({
      msg: 'The document content has been copied to the clipboard.',
      type: 'success',
      clear: true
    });
  },

  render: function () {
    var i = this.props.index;
    var docContent = this.props.el.content;
    var el = this.props.el;

    return (
      <tr key={"tableview-content-row-" + i}>
        {this.maybeGetCheckboxCell(el, i)}
        {this.getCopyButton(docContent)}
        {this.maybeGetSpecialField(el, i)}
        {this.getRowContents(el, i)}
        {this.getAdditionalInfoRow(docContent)}
      </tr>
    );
  }
});

const WrappedAutocomplete = ({selectedField, notSelectedFields, index}) => {
  const options = notSelectedFields.map((el) => {
    return {value: el, label: el};
  });

  return (
    <div className="table-container-autocomplete">
      <div className="table-select-wrapper">
        <ReactSelect
          value={selectedField}
          options={options}
          clearable={false}
          onChange={(el) => {
            Actions.changeField({
              newSelectedRow: el.value,
              index: index
            });
          }} />
      </div>
    </div>
  );
};


var TableView = React.createClass({

  getContentRows: function () {
    var data = this.props.data.results;

    return data.map(function (el, i) {

      return (
        <TableRow
          key={"tableview-row-component-" + i}
          index={i}
          el={el}
          docIdentifier={el.id || "tableview-row-component-" + i}
          docChecked={this.props.docChecked}
          isSelected={this.props.isSelected(el.id)}
          data={this.props.data} />
      );
    }.bind(this));
  },

  getOptionFieldRows: function (filtered) {
    var notSelectedFields = this.props.data.notSelectedFields;

    if (!notSelectedFields) {
      return filtered.map(function (el, i) {
        return <th key={'header-el-' + i}>{el}</th>;
      });
    }

    return filtered.map(function (el, i) {
      return (
        <th key={'header-el-' + i}>
          {this.getDropdown(el, this.props.data.schema, i)}
        </th>
      );
    }.bind(this));
  },

  getDropdown: function (selectedField, notSelectedFields, i) {

    return (
      <WrappedAutocomplete
        selectedField={selectedField}
        notSelectedFields={notSelectedFields}
        index={i} />
    );
  },

  getHeader: function () {
    var selectedFields = this.props.data.selectedFields;

    var specialField = null;
    if (this.props.data.hasMetadata) {
      specialField = (<th key="header-el-metadata" title="Metadata">Metadata</th>);
    }

    var row = this.getOptionFieldRows(selectedFields);

    var box = (
      <th className="tableview-header-el-checkbox" key="tableview-header-el-checkbox">
        {this.props.isListDeletable ? <BulkActionComponent
          disabled={this.props.isLoading}
          removeItem={this.props.removeItem}
          isChecked={this.props.isChecked}
          hasSelectedItem={this.props.hasSelectedItem}
          toggleSelect={this.props.toggleSelect}
          title="Select all docs that can be..." /> : null}
      </th>
    );


    return (
      <tr key="tableview-content-row-header">
        {box}
        <th className="tableview-el-copy"></th>
        {specialField}
        {row}
        <th className="tableview-el-last"></th>
      </tr>
    );
  },

  render: function () {
    var header = this.getHeader();
    var contentRows = this.getContentRows();

    return (
      <div className="table-view-docs">
        <table className="table table-striped">
          <thead>
            {header}
          </thead>
          <tbody>
            {contentRows}
          </tbody>
        </table>
      </div>
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
    var isDeletable = this.props.isListDeletable;

    if (this.props.isListDeletable) {
      classNames += ' show-select';
    }

    return (
      <div className={classNames}>
        <div className="loading-lines-wrapper">
          {loadLines}
        </div>

        <div id="doc-list">
          {isDeletable ? <BulkActionComponent
            removeItem={this.props.removeItem}
            isChecked={this.props.allDocumentsSelected}
            hasSelectedItem={this.props.hasSelectedItem}
            toggleSelect={this.toggleSelectAll}
            disabled={this.props.isLoading}
            title="Select all docs that can be..." /> : null}

            {this.getDocumentList()}
        </div>
      </div>
    );
  },

  getTableStyleView: function (loadLines) {
    return (
      <div>
        <div className="loading-lines-wrapper">
          {loadLines}
        </div>

        <TableView
          docChecked={this.props.docChecked}
          isSelected={this.props.isSelected}
          isListDeletable={this.props.isListDeletable}
          data={this.props.results}
          isLoading={this.props.isLoading}

          removeItem={this.props.removeItem}
          isChecked={this.props.allDocumentsSelected}
          hasSelectedItem={this.props.hasSelectedItem}
          toggleSelect={this.toggleSelectAll}
          title="Select all docs that can be..." />
      </div>
    );
  },

  render: function () {

    var loadLines = null;
    var isTableView = this.props.isTableView;

    if (this.props.isLoading) {
      loadLines = <LoadLines />;
    }

    var mainView = isTableView ? this.getTableStyleView(loadLines) : this.getDocumentStyleView(loadLines);
    return (
      <div className="document-result-screen">
        {mainView}
      </div>
    );
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
  propTypes: {
    designDocs: React.PropTypes.object
  },

  getStoreState: function () {
    var selectedItemsLength = store.getSelectedItemsLength();
    return {
      hasResults: store.hasResults(),
      results: store.getResults(),
      isLoading: store.isLoading(),
      isEditable: store.isEditable(),
      textEmptyIndex: store.getTextEmptyIndex(),
      isTableView: store.getIsTableView(),
      allDocumentsSelected: store.areAllDocumentsSelected(),
      hasSelectedItem: !!selectedItemsLength,
      selectedItemsLength: selectedItemsLength,
      bulkDeleteCollection: store.getBulkDocCollection()
    };
  },

  isSelected: function (id) {
    return !!this.state.bulkDeleteCollection.get(id);
  },

  removeItem: function () {
    Actions.deleteSelected(this.state.bulkDeleteCollection, this.state.selectedItemsLength, this.props.designDocs);
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

  docChecked: function (_id, _rev) {
    Actions.selectDoc({
      _id: _id,
      _rev: _rev
    });
  },

  render: function () {
    var view = <NoResultsScreen text={this.state.textEmptyIndex}/>;

    if (this.state.hasResults) {
      view = <ResultsScreen
        removeItem={this.removeItem}
        hasSelectedItem={this.state.hasSelectedItem}
        allDocumentsSelected={this.state.allDocumentsSelected}
        isSelected={this.isSelected}
        isEditable={this.state.isEditable}
        isListDeletable={this.state.results.hasBulkDeletableDoc}
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


export default {
  List: ViewResultListController,
  NoResultsScreen: NoResultsScreen,
  ResultsScreen: ResultsScreen,
  WrappedAutocomplete: WrappedAutocomplete
};
