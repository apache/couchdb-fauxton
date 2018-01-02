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
import ReactSelect from "react-select";

export default function WrappedAutocomplete ({
  selectedField,
  notSelectedFields,
  index,
  changeField,
  selectedFields
}) {
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
            changeField({newSelectedRow: el.value, index: index}, selectedFields);
          }}
        />
      </div>
    </div>
  );
}
