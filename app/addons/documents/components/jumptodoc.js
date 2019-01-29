import app from "../../../app";
import FauxtonAPI from "../../../core/api";

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
import Components from "../../components/react-components";


const JumpToDoc = ({database, loadOptions}) => {
  return (
    <div>
      <Components.ThrottledReactSelectAsync
        className="jump-to-doc"
        name="jump-to-doc"
        placeholder="Document ID"
        loadOptions={loadOptions}
        clearable={false}
        ignoreCase={false}
        ignoreAccents={false}
        cache={false}
        onChange={({value: docId}) => {
          const url = FauxtonAPI.urls('document', 'app', app.utils.safeURLName(database.id), app.utils.safeURLName(docId));
          // We navigating away from the page. So we need to take that navigation out of the loop otherwise
          // it causes an issue where the react-select state is changed after its unmounted
          setTimeout(() => FauxtonAPI.navigate(url, {trigger: true}));
        }} />
    </div>
  );
};

JumpToDoc.propTypes = {
  database: PropTypes.object.isRequired,
  loadOptions: PropTypes.func.isRequired,
};

export default JumpToDoc;
