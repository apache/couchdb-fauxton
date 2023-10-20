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
import { Modal, Table } from 'react-bootstrap';

export default function ExplainReasonsLegendModal({isVisible, onHide}) {
  return <Modal dialogClassName="explain-reasons-legend-modal" show={isVisible}>
    <Modal.Header closeButton={false}>
      <Modal.Title>Reasons for Unsuitable Indexes</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className='table-wrapper'>
        <Table striped>
          <thead>
            <tr>
              <th>Code</th>
              <th>Explanation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>alphabetically_comes_after</td>
              <td>If multiple indexes are equally valid, the first index sorted alphanumerically by name is selected.</td>
            </tr>
            <tr>
              <td>empty_selector</td>
              <td>The selector is empty.</td>
            </tr>
            <tr>
              <td>excluded_by_user</td>
              <td>Index did not match the specified <code>“use_index”</code> value.</td>
            </tr>
            <tr>
              <td>field_mismatch</td>
              <td>The index does contain the fields required to answer the query.</td>
            </tr>
            <tr>
              <td>less_overlap</td>
              <td>The index has less field coverage than the selected index.</td>
            </tr>
            <tr>
              <td>is_partial</td>
              <td>Partial indexes cannot be selected automatically.</td>
            </tr>
            <tr>
              <td>scope_mismatch</td>
              <td>The index scope does not match the query scope (e.g. the query is against a partition and the index is global).</td>
            </tr>
            <tr>
              <td>sort_order_mismatch</td>
              <td>The fields in the index are not sorted in the order as required by the query.</td>
            </tr>
            <tr>
              <td>unfavored_type</td>
              <td>An index with a preferred type was selected. Order of index type preference: json, text, special (<code>_all docs</code>).</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <button onClick={onHide} data-bypass="true" className="btn btn-cf-secondary" id='closeReasonModal'>Close</button>
    </Modal.Footer>
  </Modal>;
}
