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
import ReactDOM from "react-dom";
import ReactSelect from "react-select";

const JumpToDoc = ({database, loadOptions}) => {
  return (
    <div id="jump-to-doc" class="input-append">
      <ReactSelect.Async
        name="jump-to-doc"
        placeholder="Document ID"
        className="jump-to-doc"
        loadOptions={loadOptions}
        clearable={false}
        onChange={({value: docId}) => {
          const url = FauxtonAPI.urls('document', 'app', app.utils.safeURLName(database.id), app.utils.safeURLName(docId));
          // We navigating away from the page. So we need to take that navigation out of the loop otherwise
          // it causes an issue where the react-select state is changed after its unmounted
          setTimeout(() => FauxtonAPI.navigate(url, {trigger: true}));
        }}
      />
    </div>
  );
};

JumpToDoc.propTypes = {
  database: React.PropTypes.object.isRequired,
};

export default JumpToDoc;
