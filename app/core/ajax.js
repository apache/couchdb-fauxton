import 'whatwg-fetch';
import { defaultsDeep } from "lodash";
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/filter';

/* Add a multicast observer so that all fetch requests can be observed
  Some usage examples:

  This logs all status codes
  fetchObserver.subscribe((resp) => console.log(resp.statusCode));


  This only logs all status codes that are great than 201
  fetchObserver.filter(resp.statusCode > 201).subscribe(resp => console.log(resp.statusCode));
*/
export const fetchObserver = new Subject();


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
  return fetch(
    url,
    defaultsDeep(
      {
        method,
        credentials: "include",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json"
        }
      },
      opts
    )
  ).then(resp => {
    fetchObserver.next(resp);
    return resp.json();
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
  if (body) {
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
 *
 * @return {Promise} A promise with the request's response
 */
export const put = (url, body, opts = {}) => {
  if (body) {
    opts.body = JSON.stringify(body);
  }
  return json(url, "PUT", opts);
};
