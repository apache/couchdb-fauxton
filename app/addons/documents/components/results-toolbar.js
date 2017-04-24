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
import Header from "../header/header";
import Stores from "../sidebar/stores";
import Components from "../../components/react-components";

const {BulkDocumentHeaderController} = Header;
const {BulkActionComponent} = Components;
const store = Stores.sidebarStore;

export const ResultsToolBar = ({removeItem, allDocumentsSelected, hasSelectedItem, toggleSelectAll, isLoading, isListDeletable}) => {
  const dbName = store.getDatabase().id;

  return (
    <div className="document-result-screen__toolbar">
      {isListDeletable ? <BulkActionComponent
        removeItem={removeItem}
        isChecked={allDocumentsSelected}
        hasSelectedItem={hasSelectedItem}
        toggleSelect={toggleSelectAll}
        disabled={isLoading}
        title="Select all docs that can be..." /> : null}
      <BulkDocumentHeaderController />
      <div className="document-result-screen__toolbar-flex-container">
        <a href={`#/database/${dbName}/new`} className="btn save document-result-screen__toolbar-create-btn btn-primary">
          Create Document
        </a>
      </div>
    </div>
  );
};
