// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import {findIndex} from 'lodash';

const stores = [];
let dispatchId = 0;

export const register = (store) => {
  if (typeof store !== "function") {
    throw new Error("Store dispatch method must be a function");
  }

  dispatchId += 1;
  stores.push(store);
  store.dispatchId = dispatchId;
  return dispatchId;
};

export const dispatch = (msg) => {
  stores.forEach(store => {
    store(msg);
  });
};

export const unregister = (id) => {
  const storeIndex = findIndex(stores, store => store.dispatchId === id);

  if (storeIndex === -1) {
    return;
  }

  stores.splice(storeIndex, 1);
};

export default {
  register,
  dispatch,
  unregister
};
