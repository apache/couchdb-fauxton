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

import { get, put, deleteRequest } from '../../core/ajax';
import Helpers from "../../helpers";

export const configUrl = (node) => {
  return Helpers.getServerUrl('/_node/' + node + '/_config');
};

export const fetchConfig = (node) => {
  const url = configUrl(node);
  return get(url).then((json) => {
    if (json.error) {
      throw new Error(json.reason);
    }
    return { sections: json };
  });
};

export const optionUrl = (node, sectionName, optionName) => {
  const endpointUrl = '/_node/' + node + '/_config/' +
    encodeURIComponent(sectionName) + '/' + encodeURIComponent(optionName);
  return Helpers.getServerUrl(endpointUrl);
};

export const saveConfigOption = (node, sectionName, optionName, value) => {
  const url = optionUrl(node, sectionName, optionName);
  return put(url, value).then((json) => {
    if (json.error) {
      throw new Error(json.reason || json.error);
    }
    return json;
  });
};

export const deleteConfigOption = (node, sectionName, optionName) => {
  const url = optionUrl(node, sectionName, optionName);
  return deleteRequest(url).then((json) => {
    if (json.error) {
      throw new Error(json.reason);
    }
    return json;
  });
};
