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

import {get, put} from '../../core/ajax';

export const fetchCORSConfig = (baseURL) => {
  const configURL = baseURL + '/cors';
  return get(configURL).then((json) => {
    if (json.error) {
      throw new Error(json.reason);
    }

    const origins = !json.origins ? [] : json.origins.split(',');
    return {
      origins: origins,
      methods: json.methods,
      credentials: json.credentials,
      headers: json.headers
    };
  });
};

export const fetchChttpdConfig = (baseURL) => {
  const configURL = baseURL + '/chttpd';
  return get(configURL).then((json) => {
    if (json.error) {
      throw new Error(json.reason);
    }
    return json;
  });
};

export const updateEnableCorsToChttpd = (baseURL, node, enableCors) => {
  if (!node) {
    throw new Error('node not set');
  }
  const configURL = baseURL + '/chttpd/enable_cors';
  return put(configURL, enableCors.toString())    .then((json) => {
    if (json.error) {
      throw new Error(json.reason);
    }
    return json;
  });
};

export const updateCorsOrigins = (baseURL, node, origins) => {
  return updateCorsProperty(baseURL, node, 'origins', origins);
};

export const updateCorsCredentials = (baseURL, node) => {
  return updateCorsProperty(baseURL, node, 'credentials', 'true');
};

export const updateCorsHeaders = (baseURL, node) => {
  return updateCorsProperty(baseURL, node, 'headers', 'accept, authorization, content-type, origin, referer');
};

export const updateCorsMethods = (baseURL, node) => {
  return updateCorsProperty(baseURL, node, 'methods', 'GET, PUT, POST, HEAD, DELETE');
};

const updateCorsProperty = (baseURL, node, propName, propValue) => {
  if (!node) {
    throw new Error('node not set');
  }
  const configURL = baseURL + '/cors/' + propName;
  return put(configURL, propValue).then((json) => {
    if (json.error) {
      throw new Error(json.reason);
    }
    return json;
  });
};
