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
import React, { Component } from 'react';
import FauxtonAPI from '../../../../core/api';
import ReactComponents from '../../../components/react-components';

const { StyledSelect } = ReactComponents;

export default class DesignDocSelector extends Component {

  constructor(props) {
    super(props);
    this.onTogglePartitioned = this.onTogglePartitioned.bind(this);
  }

  validate() {
    if (this.props.selectedDesignDocName === 'new-doc' && this.props.newDesignDocName === '') {
      FauxtonAPI.addNotification({
        msg: 'Please name your design doc.',
        type: 'error'
      });
      this.newDesignDocInput.focus();
      return false;
    }
    return true;
  }

  getDocList() {
    if (this.props.designDocList) {
      return this.props.designDocList.map ((designDoc) => {
        return (<option key={designDoc} value={designDoc}>{designDoc}</option>);
      });
    }
    return [];

  }

  selectDesignDoc(e) {
    this.props.onSelectDesignDoc(e.target.value);
  }

  updateDesignDocName(e) {
    this.props.onChangeNewDesignDocName(e.target.value);
  }

  getNewDDocField() {
    if (this.props.selectedDesignDocName !== 'new-doc') {
      return;
    }
    return (
      <div id="new-ddoc-section" className="span5">
        <label className="control-label" htmlFor="new-ddoc">_design/</label>
        <div className="controls">
          <input type="text" id="new-ddoc" placeholder="newDesignDoc"
            ref={(el) => { this.newDesignDocInput = el; }}
            onChange={this.updateDesignDocName.bind(this)} />
        </div>
      </div>
    );
  }

  getDocLink() {
    if (!this.props.docLink) {
      return null;
    }
    return (
      <a className="help-link" data-bypass="true" href={this.props.docLink} target="_blank" rel="noopener noreferrer">
        <i className="icon-question-sign" />
      </a>
    );
  }

  onTogglePartitioned() {
    this.props.onChangeNewDesignDocPartitioned(!this.props.newDesignDocPartitioned);
  }

  getPartitionedCheckbox() {
    if (!this.props.isDbPartitioned) {
      return null;
    }
    const isExistingDDoc = this.props.selectedDesignDocName !== 'new-doc';
    const checked = isExistingDDoc ?
      this.props.selectedDesignDocPartitioned :
      this.props.newDesignDocPartitioned;
    const labelClass = isExistingDDoc ? 'check--disabled' : '';
    const inputTitle = isExistingDDoc ?
      (this.props.selectedDesignDocPartitioned ? 'Design document is partitioned' : 'Design document is not partitioned') :
      (this.props.newDesignDocPartitioned ? 'New document will be partitioned' : 'New document will not be partitioned');
    return (
      <div className="ddoc-selector-partitioned">
        <label className={labelClass} title={inputTitle}>
          <input
            id="js-ddoc-selector-partitioned"
            type="checkbox"
            title={inputTitle}
            checked={checked}
            onChange={this.onTogglePartitioned}
            style={{margin: '0px 10px 0px 0px'}}
            disabled={isExistingDDoc}/>
          Partitioned
        </label>
      </div>
    );
  }

  render() {
    const selectContent =
      <optgroup label="Select a document">
        <option value="new-doc">New document</option>
        {this.getDocList()}
      </optgroup>;

    return (
      <div className="design-doc-group control-group">
        <div className="span3">
          <label htmlFor="ddoc">{this.props.designDocLabel}
            {this.getDocLink()}
          </label>
          <StyledSelect
            selectChange={this.selectDesignDoc.bind(this)}
            selectValue={this.props.selectedDesignDocName}
            selectId={"faux__edit-view__design-doc"}
            selectContent={selectContent}
          />
        </div>
        {this.getNewDDocField()}
        {this.getPartitionedCheckbox()}
      </div>
    );
  }
}

DesignDocSelector.defaultProps = {
  designDocLabel: 'Design Document',
  selectedDesignDocName: '',
  newDesignDocName: ''
};

DesignDocSelector.propTypes = {
  designDocList: PropTypes.array.isRequired,
  onSelectDesignDoc: PropTypes.func.isRequired,
  onChangeNewDesignDocName: PropTypes.func.isRequired,
  selectedDesignDocName: PropTypes.string.isRequired,
  selectedDesignDocPartitioned: PropTypes.bool.isRequired,
  newDesignDocName: PropTypes.string.isRequired,
  newDesignDocPartitioned: PropTypes.bool.isRequired,
  designDocLabel: PropTypes.string,
  docURL: PropTypes.string
};
