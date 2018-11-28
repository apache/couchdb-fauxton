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

import { sendRequest, isObject } from './helpers';

/**
 * A replacement for Backbone.Model that only depends on 'fetch' and 'Promise'.
 * Note it's not intended to be a full replacement for Backbone. It only replicates
 * the Backbone.Model functions required by Fauxton.
 *
 * @export
 * @class Model
 */
export default class Model {

  attributes = {};
  exists = false;
  isDirty = false;

  /**
   *Creates an instance of Model.
   * @param {*} attributes
   * @param {*} [options={}]
   * @memberof Model
   */
  constructor(attributes, options = {}) {
    if (attributes) {
      this.attributes = attributes;
    }
    if (options && options.collection) {
      this.collection = options.collection;
    }
    this.initialize(attributes, options);
  }

  get id() {
    if (this.idAttribute) {
      return this.attributes[this.idAttribute];
    }
    return this.attributes.id;
  }

  initialize() {
    // default is a no-op
  }

  isNew() {
    return this.exists;
  }

  save() {
    const url = this.url();
    const method = this.isNew() ? 'POST' : 'PUT';
    return sendRequest(url, method, this.attributes).then(res => {
      if (res.ok) {
        this.exists = true;
        this.isDirty = false;
      }
      return res;
    });
  }

  destroy() {
    return sendRequest(this.url(), 'DELETE');
  }

  url() {
    if (this.id) {
      return '/' + encodeURIComponent(this.id);
    }
  }

  fetch() {
    const url = this.url();
    if (url) {
      return sendRequest(url).then(res => {
        this.attributes = this.parse(res);
        this.exists = true;
        return res;
      });
    }
    return Promise.reject(new Error('Model has an invalid url.'));
  }

  parse(data) {
    return data;
  }

  get(propName) {
    return this.attributes[propName];
  }

  set(arg1, arg2) {
    if (typeof arg1 === 'string' && arg2 !== undefined && arg2 !== null) {
      this.attributes[arg1] = arg2;
      this.isDirty = true;
    } else if (isObject(arg1)) {
      Object.assign(this.attributes, arg1);
      this.isDirty = true;
    }
  }

  unset(propName) {
    delete this.attributes[propName];
  }

  hasChanged() {
    return this.isDirty;
  }

  clear() {
    this.attributes = {};
    this.exists = false;
    this.isDirty = false;
    return this;
  }

  on() {
    // no-op
  }

  trigger() {
    // no-op
  }

  toJSON() {
    return this.attributes;
  }
}
