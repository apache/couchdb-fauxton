import 'whatwg-fetch';
import {defaultsDeep} from "lodash";
import {Subject} from 'rxjs';

/* Add a multicast observer so that all fetch requests can be observed
  Some usage examples:

  This logs all status codes
  fetchObserver.subscribe((resp) => console.log(resp.statusCode));


  This only logs all status codes that are great than 201
  fetchObserver.filter(resp.statusCode > 201).subscribe(resp => console.log(resp.statusCode));
*/
export const fetchObserver = new Subject();

// The default pre-fetch function which simply resolves to the original parameters.
export function defaultPreFetch(url, options) {
  return Promise.resolve({url, options});
}

let _preFetchFn = defaultPreFetch;

/**
 * setPreFetchFn - sets a 'pre-fetch' function that is executed before each network request
 * originated from this module, i.e. before fetch() is executed. Any fetch() calls from
 * outside this module are not affected.
 *
 * The provided function will receive the 'url' and 'options' parameters that would be sent to fetch(),
 * and it is expected to return a Promise that resolves to a {url, options} object.
 * Once this Promise resolves, fetch() is then executed with the 'url' and 'options' returned by the Promise.
 * This means, the 'pre-fetch' function can transform the original values before fetch() is called.
 *
 * @param {function} fn  The pre-fetch function
 */
export const setPreFetchFn = fn => {
  if (fn && typeof fn === "function" && fn.length === 2) {
    _preFetchFn = fn;
  } else {
    throw new Error('preFetch must be a function that accepts two parameters (url and options) like the native fetch()');
  }
};

/**
 * json - The lowlevel fetch request with some basic headers
 * that are always needed.
 *
 * @param {string}   url          The url for the request
 * @param {string} [method=GET] The request method
 * @param {object} [opts={}]    Extra fetch options that will be added.
 * Any opts added here will override the default ones
 * Passing in `raw: true` in here will return the raw response instead of a json body response.
 *
 * @return {Promise}
 */
export const json = (url, method = "GET", opts = {}) => {
  const fetchOptions = defaultsDeep(
    {},
    opts,
    {
      method,
      credentials: "include",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "Pragma":"no-cache" //Disables cache for IE11
      },
      cache: "no-cache"
    }
  );
  return _preFetchFn(url, fetchOptions).then((result) => {
    return fetch(
      result.url,
      result.options,
    ).then(resp => {
      fetchObserver.next(resp);
      if (opts.raw) {
        return resp;
      }
      return resp.json();
    });
  });
};


/**
 * get - Get request
 *
 * @param {string}   url Url of request
 * @param {object} [opts={}] Opts to add to request
 *
 * @return {Promise} A promise with the request's response
 */
export const get = (url, opts = {}) => {
  return json(url, "GET", opts);
};

export const deleteRequest = (url, opts = {}) => {
  return json(url, "DELETE", opts);
};

/**
 * post - Post request
 *
 * @param {string}   url  Url of request
 * @param {object} [body] Body of request
 * @param {object} [opts={}] Opts to add to request
 *
 * @return {Promise} A promise with the request's response
 */
export const post = (url, body, opts = {}) => {
  if (typeof body !== 'undefined') {
    if (opts.rawBody)
      opts.body = body;
    else
      opts.body = JSON.stringify(body);
  }
  return json(url, "POST", opts);
};

/**
 * put - Put request
 *
 * @param {string}   url  Url of request
 * @param {object} [body] Body of request
 * @param {object} [opts={}] Opts to add to request
 * Passing in `rawBody: true` in here will not stringify the body.
 *
 * @return {Promise} A promise with the request's response
 */
export const put = (url, body, opts = {}) => {
  if (typeof body !== 'undefined') {
    if (opts.rawBody)
      opts.body = body;
    else
      opts.body = JSON.stringify(body);
  }
  return json(url, "PUT", opts);
};

export const formEncoded = (url, method, opts = {}) => {
  return json(url, method, defaultsDeep(
    {},
    opts,
    {
      headers: {
        "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    }));
};

export const postFormEncoded = (url, body, opts = {}) => {
  if (body)
    opts.body = body;
  return formEncoded(url, "POST", opts);
};

export const putFormEncoded = (url, body, opts = {}) => {
  if (body)
    opts.body = body;
  return formEncoded(url, "PUT", opts);
};

export const deleteFormEncoded = (url, body, opts = {}) => {
  if (body)
    opts.body = body;
  return formEncoded(url, "DELETE", opts);
};
