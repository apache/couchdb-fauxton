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
import { connect } from 'react-redux';
import queryString from 'query-string';
import { ApiBarWrapper } from '../../../components/layouts';
import { getQueryOptionsParams } from '../reducers';
import FauxtonAPI from '../../../../core/api';

const urlRef = (databaseName, params) => {
  let query = queryString.stringify(params);

  if (query) {
    query = `?${query}`;
  }

  return FauxtonAPI.urls('allDocs', "apiurl", encodeURIComponent(databaseName), query);
};

const mapStateToProps = ({indexResults}, {docUrl, endpoint, databaseName, endpointAddQueryOptions}) => {
  if (!docUrl) {
    docUrl = FauxtonAPI.constants.DOC_URLS.GENERAL;
  }
  if (!endpoint) {
    endpoint = urlRef(databaseName, getQueryOptionsParams(indexResults));
  } else {
    if (endpointAddQueryOptions) {
      const query = queryString.stringify(getQueryOptionsParams(indexResults));
      if (query) {
        endpoint = endpoint.indexOf('?') == -1 ? `${endpoint}?${query}` : `${endpoint}&${query}`;
      }
    }
  }
  return { docUrl, endpoint };
};

const ApiBarContainer = connect (
  mapStateToProps
)(ApiBarWrapper);

export default ApiBarContainer;

ApiBarContainer.propTypes = {
  databaseName: React.PropTypes.string,
  docUrl: React.PropTypes.string,
  endpoint: React.PropTypes.string,
  endpointAddQueryOptions: React.PropTypes.bool
};
