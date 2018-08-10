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

import React from 'react';
import FauxtonAPI from '../../../../../core/api';
import Constants from '../../../constants';
import Components from "../../../../components/react-components";
import {ResultsToolBar} from "../../../components/results-toolbar";
import NoResultsScreen from './NoResultsScreen';
import TableView from './TableView';

const { LoadLines, Document } = Components;

export default class ResultsScreen extends React.Component {
  constructor (props) {
    super(props);
  }

  componentDidMount () {
    prettyPrint();
  }

  componentDidUpdate () {
    prettyPrint();
  }

  onClick (id, doc) {
    if (doc.url) {
      FauxtonAPI.navigate(doc.url);
    }
  }

  getUrlFragment (url) {
    if (!this.props.isEditable) {
      return null;
    }

    return (
      <a href={url}>
        <i className="fonticon-pencil"></i>
      </a>);
  }

  getDocumentList () {
    let noop = () => {};
    let data = this.props.results.results;
    return _.map(data, (doc, i) => {
      return (
        <Document
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
        </Document>
      );
    });
  }

  getDocumentStyleView () {
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
  }

  getTableStyleView () {
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
          changeField={this.props.changeTableHeaderAttribute}
          title="Select all docs that can be..." />
      </div>
    );
  }

  render () {
    let mainView = null;

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
        <ResultsToolBar {...this.props} />
        {mainView}
      </div>
    );
  }

}
