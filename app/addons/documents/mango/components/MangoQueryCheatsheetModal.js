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

export default function MangoQueryCheatsheetModal({isVisible, onHide}) {
  return <Modal dialogClassName="mango-cheatsheet-modal" show={isVisible}>
    <Modal.Header closeButton={false}>
      <Modal.Title>Query Cheatsheet</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className='table-wrapper'>

        <Table striped>
          <thead>
            <tr>
              <th>Condition Operator</th>
              <th>Argument</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>$eq</code>, <code>$ne</code><br/>
                <code>$lt</code>, <code>$lte</code><br/>
                <code>$gt</code>, <code>$gte</code>
              </td>
              <td>Any JSON value</td>
              <td>
                Equal, Not equal<br/>
                Lesser, Lesser or equal,<br/>
                Greater, Greater or equal
              </td>
            </tr>
            <tr>
              <td><code>$exists</code></td>
              <td>Boolean</td>
              <td>Check field exists or not</td>
            </tr>
            <tr>
              <td><code>$type</code></td>
              <td>String</td>
              <td>Check field type, accepts: <code>&quot;null&quot;</code>, <code>&quot;boolean&quot;</code>,
                <code>&quot;number&quot;</code>, <code>&quot;string&quot;</code>, <code>&quot;array&quot;</code> and <code>&quot;object&quot;</code>
              </td>
            </tr>
            <tr>
              <td><code>$in</code>, <code>$nin</code></td>
              <td>Array of JSON values</td>
              <td>Field must exist / not exist</td>
            </tr>
            <tr>
              <td><code>$size</code></td>
              <td>Integer</td>
              <td>Match length of an array field</td>
            </tr>
            <tr>
              <td><code>$mod</code></td>
              <td>[Divisor, Remainder]</td>
              <td>Matches <pre>field % Divisor == Remainder</pre></td>
            </tr>
            <tr>
              <td><code>$regex</code></td>
              <td>String</td>
              <td>String value matches a regex</td>
            </tr>
          </tbody>
        </Table>
        <br/>
        <Table striped>
          <thead>
            <tr>
              <th>Combination Operators</th>
              <th>Argument</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>$and</code></td>
              <td>Array</td>
              <td>Matches if ALL the selectors in the array match</td>
            </tr>
            <tr>
              <td><code>$or</code></td>
              <td>Array</td>
              <td>Matches if ANY the selectors in the array match</td>
            </tr>
            <tr>
              <td><code>$nor</code></td>
              <td>Array</td>
              <td>Matches if NONE of the selectors in the array match</td>
            </tr>
            <tr>
              <td><code>$not</code></td>
              <td>Selector</td>
              <td>Matches if the given selector does not match</td>
            </tr>
            <tr>
              <td><code>$all</code></td>
              <td>Array</td>
              <td>Matches an array value if it contains all the elements of the argument array</td>
            </tr>
            <tr>
              <td><code>$elemMatch</code></td>
              <td>Selector</td>
              <td>Matches an array field with AT LEAST ONE element that matches ALL the specified query criteria</td>
            </tr>
            <tr>
              <td><code>$allMatch</code></td>
              <td>Selector</td>
              <td>Matches an array field with ALL elements matching ALL the specified query criteria</td>
            </tr>
            <tr>
              <td><code>$keyMapMatch</code></td>
              <td>Selector</td>
              <td>Matches a map that contains AT LEAST ONE key that matches ALL the specified query criteria</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <button onClick={onHide} data-bypass="true" className="btn btn-cf-secondary">Close</button>
    </Modal.Footer>
  </Modal>;
}
