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

import FauxtonAPI from "../../../core/api";
import React from "react";
import Stores from "./stores";
import Actions from "./actions";
import Components from "../../components/react-components";
import Constants from "../constants";
import ReactSelect from "react-select";
import {ResultsToolBar} from "../components/results-toolbar";
import "../../../../assets/js/plugins/prettify";
import uuid from 'uuid';

const {LoadLines, Copy} = Components;
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
    data: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func.isRequired
  },

  onChange: function () {
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
        <td key={key} title={stringified} onClick={this.onClick}>
          {stringified}
        </td>
      );
    }.bind(this));

    return row;
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
      <td className="tableview-el-last" onClick={this.onClick}>
        {conflictIndicator}
        {attachmentIndicator}
      </td>
    );
  },

  getCopyButton: function (el) {
    var text = JSON.stringify(el, null, '  ');
    return (
      <td title={text} className="tableview-el-copy">
        <Copy
          title={text}
          text={text}
          uniqueKey={uuid.v4()}
          onClipboardClick={this.showCopiedMessage} />
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

  onClick: function (e) {
    this.props.onClick(this.props.el._id, this.props.el, e);
  },

  render: function () {
    var i = this.props.index;
    var docContent = this.props.el.content;
    var el = this.props.el;

    return (
      <tr key={"tableview-content-row-" + i}>
        {this.maybeGetCheckboxCell(el, i)}
        {this.getCopyButton(docContent)}
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
          onClick={this.props.onClick}
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
    var row = this.getOptionFieldRows(selectedFields);

    return (
      <tr key="tableview-content-row-header">
        <th className="tableview-header-el-checkbox"></th>
        <th className="tableview-el-copy"></th>
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

  onClick: function (id, doc) {
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
         onClick={this.props.isEditable ? this.onClick : noop}
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

  getDocumentStyleView: function () {
    let classNames = 'view';

    if (this.props.isListDeletable) {
      classNames += ' show-select';
    }

    return (
      <div className={classNames}>
        <div id="doc-list">
          {this.getDocumentList()}
        </div>
      </div>
    );
  },

  getTableStyleView: function () {
    return (
      <div>
        <TableView
          onClick={this.onClick}
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
    let mainView = null;
    let toolbar = <ResultsToolBar toggleSelectAll={this.toggleSelectAll} {...this.props} />;

    if (this.props.isLoading) {
      mainView = <div className="loading-lines-wrapper"><LoadLines /></div>;
    } else if (!this.props.hasResults) {
      mainView = <NoResultsScreen text={this.props.textEmptyIndex}/>;
    } else if (this.props.selectedLayout === Constants.LAYOUT_ORIENTATION.JSON) {
      mainView = this.getDocumentStyleView();
    } else {
      mainView = this.getTableStyleView();
    }

    return (
      <div className="document-result-screen">
        {toolbar}
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
    const selectedItemsLength = store.getSelectedItemsLength();
    const isLoading = store.isLoading();
    return {
      hasResults: store.hasResults(),
      results: isLoading ? {} : store.getResults(),
      isLoading: isLoading,
      isEditable: store.isEditable(),
      textEmptyIndex: store.getTextEmptyIndex(),
      selectedLayout: store.getSelectedLayout(),
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
    return (
      <ResultsScreen
        removeItem={this.removeItem}
        hasSelectedItem={this.state.hasSelectedItem}
        allDocumentsSelected={this.state.allDocumentsSelected}
        isSelected={this.isSelected}
        isEditable={this.state.isEditable}
        isListDeletable={this.state.results.hasBulkDeletableDoc}
        docChecked={this.docChecked}
        isLoading={this.state.isLoading}
        hasResults={this.state.hasResults}
        textEmptyIndex={this.state.textEmptyIndex}
        results={this.state.results}
        selectedLayout={this.state.selectedLayout} />
    );
  }
});

export default {
  List: ViewResultListController,
  NoResultsScreen: NoResultsScreen,
  ResultsScreen: ResultsScreen,
  WrappedAutocomplete: WrappedAutocomplete
};
