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

import { sendRequest } from './helpers';
import Model from './model';

/**
 * A replacement for Backbone.Collection that only depends on 'fetch' and 'Promise'.
 * Note it's not intended to be a full replacement for Backbone. It only replicates
 * the Backbone.Model functions required by Fauxton.
 *
 * @export
 * @class Model
 */
export default class Collection {

  models = [];

  constructor(models, options) {
    if (models) {
      // shallow copy
      this.models = models.slice(0);
    }
    this.initialize(models, options);
  }

  initialize() {
    // default is a no-op
  }

  url() {
    return '/';
  }

  fetch() {
    const url = this.url();
    return sendRequest(url).then(res => {
      const parsedRes = this.parse(res);
      this.models = parsedRes.map(obj => {
        let newModel;
        const options = { collection: this };
        if (this.model) {
          newModel = new this.model(obj, options);
        } else {
          newModel = new Model(obj, options);
        }
        return newModel;
      });
      return res;
    });
  }

  parse(res) {
    return res;
  }

  filter(fn) {
    return this.models.filter(fn);
  }

  find(fn) {
    return this.models.find(fn);
  }

  map(fn) {
    return this.models.map(fn);
  }

  onRemove() {
    // default is a no-op
  }

  toJSON() {
    return this.models.map(obj => obj.toJSON());
  }

  add(models) {
    const toAdd = Array.isArray(models) ? models : [models];
    toAdd.forEach(modelToAdd => {
      const idx = this.models.findIndex(el => el.id === modelToAdd.id);
      //Only add if it's not part of the collection yet
      if (idx === -1) {
        modelToAdd.collection = this;
        this.models.push(modelToAdd);
      }
    });
  }

  remove(models) {
    const toRemove = Array.isArray(models) ? models : [models];
    toRemove.forEach(modelToRemove => {
      const idx = this.models.findIndex(el => el.id === modelToRemove.id);
      if (idx > -1) {
        this.models.splice(idx, 1);
        this.onRemove();
      }
    });
  }
}
