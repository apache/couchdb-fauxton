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

import FauxtonAPI from "../../../core/api";

const getIndexName = ({def, type}) => {
  let nameArray = [],
      indexes;

  nameArray = def.fields.reduce(function (acc, el, i) {
    if (i === 0) {
      acc.push(type + ': ' + Object.keys(el)[0]);
    } else {
      acc.push(Object.keys(el)[0]);
    }

    return acc;
  }, []);

  if (!nameArray.length) {
    indexes = FauxtonAPI.getExtensions('mango:additionalIndexes')[0];
    if (indexes) {
      nameArray = indexes.createHeader({def, type});
    } else {
      nameArray = [type + ': ' + (def.selector ? JSON.stringify(def.selector) : '{}')];
    }
  }

  return nameArray.join(', ');
};

const formatCode = (code) => {
  return JSON.stringify(code, null, 3);
};

const getIndexContent = (doc) => {
  const content = {
    ...doc
  };

  delete content.ddoc;
  delete content.name;

  return JSON.stringify(content, null, ' ');
};

export default {
  getIndexName,
  formatCode,
  getIndexContent
};
