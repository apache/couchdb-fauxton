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
import Resources from "./resources";

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

export const fetchAndLoadCORSOptions = (node) => (dispatch) => {
  console.log('fetchAndLoadCORSOptions started for node111:', node);
  const cors = new Resources.Config({ node: node });
  const httpd = new Resources.Httpd({ node: node });

  FauxtonAPI.when([cors.fetch(), httpd.fetch()]).then(
    () => {
      console.log('fetchAndLoadCORSOptions... Promise resolved');
      const loadOptions = loadCORSOptions({
        origins: cors.get('origins'),
        corsEnabled: httpd.corsEnabled(),
        node: node
      });
      console.log(loadOptions);
      dispatch(loadOptions);
    },
    (error) => {
      const reason = (error && error.statusText) || 'n/a';
      FauxtonAPI.addNotification({
        msg: 'Could not load CORS settings. Reason: ' + reason,
        type: 'error'
      });
    }
  );
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

export const saveCors = (options) => (dispatch) => {
  // console.log('newSaveCors::', options);
  const promises = [];
  promises.push(saveEnableCorsToHttpd(options.corsEnabled, options.node));

  if (options.corsEnabled) {
    promises.push(saveCorsOrigins(sanitizeOrigins(options.origins), options.node));
    promises.push(saveCorsCredentials(options.node));
    promises.push(saveCorsHeaders(options.node));
    promises.push(saveCorsMethods(options.node));
  }
  console.log('Sending Promisses with ', options);
  FauxtonAPI.when(promises).then(() => {
    FauxtonAPI.addNotification({
      msg: 'CORS settings updated.',
      type: 'success',
      clear: true
    });
    console.log('CORS updated... will update UI with ', options);
    dispatch(loadCORSOptions(options));
    // this.hideDeleteDomainModal(); // just in case it was already open
    // this.toggleLoadingBarsToEnabled(false);

  },
    (error) => {
      console.log(error);
      FauxtonAPI.addNotification({
        msg: 'Error! Could not save your CORS settings. Please try again. Reason - ' + error,
        type: 'error',
        clear: true
      });
      dispatch(hideLoadingBars());
    });
};

const saveEnableCorsToHttpd = (enableCors, node) => {
  const enableOption = new Resources.ConfigModel({
    section: 'httpd',
    attribute: 'enable_cors',
    value: enableCors.toString(),
    node: node
  });

  return enableOption.save();
};

const saveCorsOrigins = (origins, node) => {
  const allowOrigins = new Resources.ConfigModel({
    section: 'cors',
    attribute: 'origins',
    value: origins,
    node: node
  });

  return allowOrigins.save();
};

const saveCorsCredentials = (node) => {
  const allowCredentials = new Resources.ConfigModel({
    section: 'cors',
    attribute: 'credentials',
    value: 'true',
    node: node
  });

  return allowCredentials.save();
};

const saveCorsHeaders = (node) => {
  const corsHeaders = new Resources.ConfigModel({
    section: 'cors',
    attribute: 'headers',
    value: 'accept, authorization, content-type, origin, referer',
    node: node
  });

  return corsHeaders.save();
};

const saveCorsMethods = (node) => {
  const corsMethods = new Resources.ConfigModel({
    section: 'cors',
    attribute: 'methods',
    value: 'GET, PUT, POST, HEAD, DELETE',
    node: node
  });

  return corsMethods.save();
};

const sanitizeOrigins = (origins) => {
  if (_.isEmpty(origins)) {
    return '';
  }

  return origins.join(',');
};
