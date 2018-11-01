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
import TableRow from './TableRow';
import WrappedAutocomplete from './WrappedAutocomplete';

export default class TableView extends React.Component {
  constructor (props) {
    super(props);
  }

  getContentRows () {
    const data = this.props.data.results;
    const { textOverflow, fontSize } = this.props.resultsStyle;
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
          data={this.props.data}
          textOverflow={textOverflow}
          fontSize={fontSize} />
      );
    }.bind(this));
  }

  getOptionFieldRows (filtered) {
    const notSelectedFields = this.props.data.notSelectedFields;

    if (!notSelectedFields) {
      return filtered.map(function (el, i) {
        return <th key={'header-el-' + i}>{el}</th>;
      });
    }

    return filtered.map(function (el, i) {
      return (
        <th key={'header-el-' + i}>
          {this.getDropdown(
            el,
            this.props.data.schema,
            i,
            this.props.changeField,
            this.props.data.selectedFields
          )}
        </th>
      );
    }.bind(this));
  }

  getDropdown (selectedField, notSelectedFields, i, changeField, selectedFields) {

    return (
      <WrappedAutocomplete
        selectedField={selectedField}
        notSelectedFields={notSelectedFields}
        index={i}
        changeField={changeField}
        selectedFields={selectedFields} />
    );
  }

  getHeader () {
    const selectedFields = this.props.data.selectedFields;
    const row = this.getOptionFieldRows(selectedFields);

    return (
      <tr key="tableview-content-row-header">
        <th className="tableview-header-el-checkbox"></th>
        <th className="tableview-el-copy"></th>
        {row}
        <th className="tableview-el-last"></th>
      </tr>
    );
  }

  render () {
    return (
      <div className="table-view-docs">
        <table className="table table-striped">
          <thead>
            {this.getHeader()}
          </thead>
          <tbody>
            {this.getContentRows()}
          </tbody>
        </table>
      </div>
    );
  }
}
