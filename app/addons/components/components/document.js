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
import PropTypes from 'prop-types';

import React from "react";
import ReactDOM from "react-dom";
import FauxtonAPI from "../../../core/api";
import Helpers from "../../documents/helpers";

export class Document extends React.Component {
  static propTypes = {
    docIdentifier: PropTypes.string.isRequired,
    docChecked: PropTypes.func.isRequired,
    truncate: PropTypes.bool,
    maxRows: PropTypes.number
  };

  static defaultProps = {
    truncate: true,
    maxRows: 500
  };

  onChange = (e) => {
    e.preventDefault();
    this.props.docChecked(this.props.doc.id, this.props.doc._rev);
  };

  getUrlFragment = () => {
    if (!this.props.children) {
      return '';
    }

    return (
      <div className="doc-edit-symbol pull-right" title="Edit document">
        {this.props.children}
      </div>
    );
  };

  getExtensionIcons = () => {
    var extensions = FauxtonAPI.getExtensions('DocList:icons');
    return _.map(extensions, (Extension, i) => {
      return (<Extension doc={this.props.doc} key={i} />);
    });
  };

  getCheckbox = () => {
    if (!this.props.isDeletable) {
      return <div className="checkbox-dummy"></div>;
    }

    return (
      <div className="checkbox inline">
        <input
          id={'checkbox-' + this.props.docIdentifier}
          checked={this.props.checked}
          data-checked={this.props.checked}
          type="checkbox"
          onChange={this.onChange}
          className="js-row-select" />
        <label onClick={this.onChange}
          className="label-checkbox-doclist"
          htmlFor={'checkbox-' + this.props.docIdentifier} />
      </div>
    );
  };

  onClick = (e) => {
    this.props.onClick(this.props.docIdentifier, this.props.doc, e);
  };

  getDocContent = () => {
    if (_.isEmpty(this.props.docContent)) {
      return null;
    }

    // if need be, truncate the document
    var content = this.props.docContent;
    var isTruncated = false;
    if (this.props.truncate) {
      var result = Helpers.truncateDoc(this.props.docContent, this.props.maxRows);
      isTruncated = result.isTruncated;
      content = result.content;
    }

    return (
      <div className="doc-data">
        <pre className="prettyprint">{content}</pre>
        {isTruncated ? <div className="doc-content-truncated">(truncated)</div> : null}
      </div>
    );
  };

  render() {
    return (
      <div data-id={this.props.docIdentifier} className="doc-row">
        <div className="custom-inputs">
          {this.getCheckbox()}
        </div>
        <div className="doc-item" onClick={this.onClick}>
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
}
