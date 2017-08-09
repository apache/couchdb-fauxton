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

import FauxtonAPI from "../../core/api";
import ActionTypes from "./actiontypes";
import * as CorsAPI from "./api";

export const fetchAndLoadCORSOptions = (url, node) => (dispatch) => {
  const fetchCors = CorsAPI.fetchCORSConfig(url);
  const fetchHttp = CorsAPI.fetchHttpdConfig(url);

  FauxtonAPI.Promise.join(fetchCors, fetchHttp, (corsConfig, httpdConfig) => {
    const loadOptions = loadCORSOptions({
      origins: corsConfig.origins,
      corsEnabled: httpdConfig.enable_cors === 'true',
      node: node
    });
    dispatch(loadOptions);
  }).catch((error) => {
    FauxtonAPI.addNotification({
      msg: 'Could not load CORS settings.  ' + errorReason(error),
      type: 'error'
    });
  });
};

export const showLoadingBars = () => {
  return {
    type: ActionTypes.CORS_SET_IS_LOADING,
    isLoading: true
  };
};

export const hideLoadingBars = () => {
  return {
    type: ActionTypes.CORS_SET_IS_LOADING,
    isLoading: false
  };
};

export const loadCORSOptions = (options) => {
  return {
    type: ActionTypes.EDIT_CORS,
    options: options,
    isLoading: false
  };
};

export const showDomainDeleteConfirmation = (domain) => {
  return {
    type: ActionTypes.CORS_SHOW_DELETE_DOMAIN_MODAL,
    domainToDelete: domain
  };
};

export const hideDomainDeleteConfirmation = () => {
  return {
    type: ActionTypes.CORS_HIDE_DELETE_DOMAIN_MODAL
  };
};

export const saveCors = (url, options) => (dispatch) => {
  const promises = [];

  promises.push(CorsAPI.updateEnableCorsToHttpd(url, options.node, options.corsEnabled));
  if (options.corsEnabled) {
    promises.push(CorsAPI.updateCorsOrigins(url, options.node, sanitizeOrigins(options.origins)));
    promises.push(CorsAPI.updateCorsCredentials(url, options.node));
    promises.push(CorsAPI.updateCorsHeaders(url, options.node));
    promises.push(CorsAPI.updateCorsMethods(url, options.node));
  }

  return FauxtonAPI.Promise.all(promises).then(() => {
    FauxtonAPI.addNotification({
      msg: 'CORS settings updated.',
      type: 'success',
      clear: true
    });
    dispatch(loadCORSOptions(options));
  }).catch((error) => {
      FauxtonAPI.addNotification({
        msg: 'Error! Could not save your CORS settings. Please try again. ' + errorReason(error),
        type: 'error',
        clear: true
      });
      dispatch(hideDomainDeleteConfirmation());
      dispatch(hideLoadingBars());
    });
};

const errorReason = (error) => {
  return 'Reason: ' + ((error && error.message) || 'n/a');
};

export const sanitizeOrigins = (origins) => {
  if (_.isEmpty(origins)) {
    return '';
  }

  return origins.join(',');
};
