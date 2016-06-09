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

import app from '../../../app';
import FauxtonAPI from '../../../core/api';
import Components from '../../fauxton/components';
import Documents from '../resources';
import Databases from '../../databases/resources';
import React from 'react';
import QueryOptions from '../queryoptions/queryoptions.react';
import QueryActions from '../queryoptions/actions';
import JumpToDoc from './jumptodoc.react';
import IndexResultStores from '../index-results/stores';
import Actions from './actions';

const { indexResultsStore } = IndexResultStores;

const { QueryOptionsController } = QueryOptions;

const RightAllDocsHeader = ({database}) =>
  <div className="header-right right-db-header flex-layout flex-row">
    <div className="searchbox-wrapper">
        <div id="header-search" className="searchbox-container">
          <JumpToDoc loadOptions={Actions.fetchAllDocsWithKey(database)} database={database} />
        </div>
    </div>
    <QueryOptionsController />
  </div>;

RightAllDocsHeader.propTypes = {
  database: React.PropTypes.object.isRequired
};

export default RightAllDocsHeader;
