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
import React from 'react';
import {TabsSidebarHeader} from '../documents/layouts';
import SidebarControllerContainer from '../documents/sidebar/SidebarControllerContainer';
import SearchFormContainer from './components/SearchFormContainer';
import SearchIndexEditorContainer from './components/SearchIndexEditorContainer';


const getContent = (section, database, indexName,
  ddocName, designDocs, ddoc, partitionKey) => {
  if (section === 'create') {
    return <SearchIndexEditorContainer
      designDocs={designDocs}
      ddoc={ddoc}
      database={database}
      isCreatingIndex={true}
      partitionKey={partitionKey}
    />;

  } else if (section === 'edit') {
    return <SearchIndexEditorContainer
      database={database}
      indexName={indexName}
      ddocName={ddocName}
      isCreatingIndex={false}
      partitionKey={partitionKey}
    />;
  }

  return <SearchFormContainer />;
};

export const SearchLayout = ({
  section,
  database,
  indexName,
  ddocName,
  docURL, endpoint,
  dropDownLinks,
  designDocs,
  ddoc,
  selectedNavItem,
  partitionKey,
  onPartitionKeySelected,
  onGlobalModeSelected,
  globalMode
}) => {
  return (
    <div id="dashboard" className="with-sidebar">
      <TabsSidebarHeader
        hideQueryOptions={true}
        docURL={docURL}
        endpoint={endpoint}
        dbName={database.id}
        dropDownLinks={dropDownLinks}
        database={database}
        showPartitionKeySelector={section === 'search'}
        partitionKey={partitionKey}
        onPartitionKeySelected={onPartitionKeySelected}
        onGlobalModeSelected={onGlobalModeSelected}
        globalMode={globalMode}
      />
      <div className="with-sidebar tabs-with-sidebar content-area">
        <aside id="sidebar-content" className="scrollable">
          <SidebarControllerContainer selectedNavItem={selectedNavItem} selectedPartitionKey={partitionKey}/>
        </aside>
        <section id="dashboard-content" className="flex-layout flex-col">
          <div className="flex-body" id='dashboard-lower-content'>
            <div className="search-index-content">
              <div className="tab-content search-index-tab-content">
                {getContent(section, database, indexName, ddocName, designDocs, ddoc, partitionKey)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

SearchLayout.propTypes = {
  section: PropTypes.string.isRequired,
  docURL: PropTypes.string,
  endpoint: PropTypes.string,
  ddocName: PropTypes.string,
  indexName: PropTypes.string,
  dropDownLinks: PropTypes.array.isRequired,
  database: PropTypes.object.isRequired,
};

export default SearchLayout;
