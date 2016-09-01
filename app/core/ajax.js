import $ from 'jquery';

export const buildQuery = (query) => (
  `?${Object.keys(query).reduce((items, item) => (
    query[item] ? [...items, `${item}=${encodeURIComponent(query[item])}`] : items
  ), []).join('&')}`
);

export const url = (path, query) => (
  `${path}${!emptyObject(query) ? buildQuery(query) : ''}`
);

const emptyObject = (object) => (
  Object.keys(object || {}).length == 0
);

//  ----------------------------------------
//  makes a GET request to the provided path
//  arguments: (options, query)
//  options: {
//    path: '/foo', // the location you want to send the request to
//  }
//  Any optional query paramaters you want to pass
//  query: {}
//  for example
//  query: {
//    page: 1,
//    term: 'foo',
//  }
//  will generate
//  /${path}?page=1&term=foo
export const request = (options, query) => (
  $.ajax(Object.assign(
    emptyObject(options.data)
      ? options
      : Object.assign(options, {
          contentType: 'application/json; charset=UTF-8',
          dataType: 'json',
          data: JSON.stringify(options.data),
        }), {
    url: url(options.url, query),
  }))
);

//  ----------------------------------------
//  makes a GET request to the provided path
//  arguments: (options, query)
//  options: {
//    path: '/foo', // the location you want to send the request to
//  }
//  Any optional query paramaters you want to pass
//  query: {}
//  for example
//  query: {
//    page: 1,
//    term: 'foo',
//  }
//  will generate
//  /${path}?page=1&term=foo
export const get = (options, query = {}) => (
  request(Object.assign({
    path: '/',
    type: 'GET',
  }, options), query)
);

//  ----------------------------------------
//  makes a PUT request to the provided path
//  arguments: (options, query)
//  options: {
//    path: '/foo', // the location you want to send the request to
//    data: {}, // the body of the request
//  }
//  Any optional query paramaters you want to pass
//  query: {}
//  for example
//  query: {
//    page: 1,
//    term: 'foo',
//  }
//  will generate
//  /${path}?page=1&term=foo
export const put = (options, query = {}) => (
  request(Object.assign({
    path: '/',
    type: 'PUT',
  }, options), query)
);

//  ----------------------------------------
//  makes a POST request to the provided path
//  arguments: (options, query)
//  options: {
//    path: '/foo', // the location you want to send the request to
//    data: {}, // the body of the request
//  }
//  Any optional query paramaters you want to pass
//  query: {}
//  for example
//  query: {
//    page: 1,
//    term: 'foo',
//  }
//  will generate
//  /${path}?page=1&term=foo
export const post = (options, query = {}) => (
  request(Object.assign({
    path: '/',
    type: 'POST',
  }, options), query)
);

//  ----------------------------------------
//  makes a DELETE request to the provided path
//  arguments: (options, query)
//  options: {
//    path: '/foo', // the location you want to send the request to
//    data: {}, // the body of the request
//  }
//  Any optional query paramaters you want to pass
//  query: {}
//  for example
//  query: {
//    page: 1,
//    term: 'foo',
//  }
//  will generate
//  /${path}?page=1&term=foo
export const del = (options, query = {}) => (
  request(Object.assign({
    path: '/',
    type: 'DELETE',
  }, options), query)
);

//  ----------------------------------------
//  makes a COPY request to the provided path
//  arguments: (options, query)
//  options: {
//    path: '/foo', // the location you want to send the request to
//    data: {}, // the body of the request
//  }
//  Any optional query paramaters you want to pass
//  query: {}
//  for example
//  query: {
//    page: 1,
//    term: 'foo',
//  }
//  will generate
//  /${path}?page=1&term=foo
export const copy = (options, query = {}) => (
  request(Object.assign({
    path: '/',
    type: 'COPY',
  }, options), query)
);

//  ----------------------------------------
//  makes a OPTIONS request to the provided path
//  arguments: (options, query)
//  options: {
//    path: '/foo', // the location you want to send the request to
//  }
//  Any optional query paramaters you want to pass
//  query: {}
//  for example
//  query: {
//    page: 1,
//    term: 'foo',
//  }
//  will generate
//  /${path}?page=1&term=foo
export const options = (opts, query = {}) => (
  request(Object.assign({
    path: '/',
    type: 'OPTIONS',
  }, opts), query)
);

export default {
  get,
  put,
  post,
  copy,
  del,
  options,
};
