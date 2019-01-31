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
import QueryOptionsContainer from '../index-results/containers/QueryOptionsContainer';
import JumpToDoc from './jumptodoc';
import Actions from './actions';

const RightAllDocsHeader = ({database, hideQueryOptions, hideJumpToDoc, queryDocs, ddocsOnly, selectedNavItem, partitionKey}) =>
  <div className="header-right right-db-header flex-layout flex-row">

    <div className="faux-header__searchboxwrapper">
      <div className="faux-header__searchboxcontainer">
        {hideJumpToDoc ? null :
          <JumpToDoc
            // 'key' is set to force mounting a new component when the partition key changes
            // otherwise the internal ReactSelect doesn't reload the options even though
            // it loadOptions is assigned a new function
            key={JSON.stringify(database + partitionKey)}
            cache={false}
            loadOptions={Actions.fetchAllDocsWithKey(database, partitionKey)}
            database={database} /> }
      </div>
    </div>
    {hideQueryOptions ? null :
      <QueryOptionsContainer ddocsOnly={ddocsOnly} queryDocs={ queryDocs } selectedNavItem={selectedNavItem} /> }
  </div>;

RightAllDocsHeader.propTypes = {
  database: PropTypes.object.isRequired,
  hideQueryOptions: PropTypes.bool,
  isRedux: PropTypes.bool,
  queryDocs: PropTypes.func,
  selectedNavItem: PropTypes.object,
  partitionKey: PropTypes.string
};

RightAllDocsHeader.defaultProps = {
  hideQueryOptions: false
};

export default RightAllDocsHeader;
