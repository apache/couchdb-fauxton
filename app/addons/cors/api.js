// import 'whatwg-fetch';

/**
 * Fetches the current CORS configuration.
 * @param {string} baseURL
 * @returns {Promise}
 */
export const fetchCORSConfig = (baseURL) => {
  const configURL = baseURL + '/cors';
  return fetch(configURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'GET'
  })
    .then((res) => res.json())
    .then((json) => {
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

/**
 * Fetches the current Httpd configuration.
 * @param {string} baseURL
 * @returns {Promise}
 */
export const fetchHttpdConfig = (baseURL) => {
  const configURL = baseURL + '/httpd';
  return fetch(configURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'GET'
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error(json.reason);
      }
      return json;
    });
};

export const updateEnableCorsToHttpd = (baseURL, node, enableCors) => {
  if (!node) {
    throw new Error('node not set');
  }
  const configURL = baseURL + '/httpd/enable_cors';
  return fetch(configURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'PUT',
    body: JSON.stringify(enableCors.toString())
  })
    .then((res) => res.json())
    .then((json) => {
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
  return fetch(configURL, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    method: 'PUT',
    body: JSON.stringify(propValue)
  })
    .then((res) => res.json())
    .then((json) => {
      if (json.error) {
        throw new Error(json.reason);
      }
      return json;
    });
};
