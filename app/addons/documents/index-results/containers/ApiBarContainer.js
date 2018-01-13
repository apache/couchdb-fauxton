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
import { connect } from 'react-redux';
import app from '../../../../app';
import { ApiBarWrapper } from '../../../components/layouts';
import { getQueryOptionsParams } from '../reducers';
import FauxtonAPI from '../../../../core/api';

const mapStateToProps = ({indexResults}, {docUrl, endpoint, endpointAddQueryOptions}) => {
  if (!docUrl) {
    docUrl = FauxtonAPI.constants.DOC_URLS.GENERAL;
  }

  if (endpoint && endpointAddQueryOptions) {
    const query = app.utils.queryString(getQueryOptionsParams(indexResults));
    if (query) {
      endpoint = endpoint.indexOf('?') == -1 ? `${endpoint}?${query}` : `${endpoint}&${query}`;
    }
  }
  return { docUrl, endpoint };
};

const ApiBarContainer = connect (
  mapStateToProps
)(ApiBarWrapper);

export default ApiBarContainer;

ApiBarContainer.propTypes = {
  databaseName: PropTypes.string,
  docUrl: PropTypes.string,
  endpoint: PropTypes.string,
  endpointAddQueryOptions: PropTypes.bool
};
