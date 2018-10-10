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

import Helpers from "../../helpers";
import {get} from '../../core/ajax';

export default () => {
  return get(Helpers.getServerUrl('/_membership'))
    .then(res => {
      if (!res.all_nodes) {
        const details = res.reason ? res.reason : '';
        throw new Error('Failed to load list of nodes.' + details);
      }

      const list = res.all_nodes.reduce(function (acc, node) {
        var isInCluster = res.cluster_nodes.indexOf(node) !== -1;

        acc.push({node: node, isInCluster: isInCluster});
        return acc;
      }, []);

      res.nodes_mapped = list;
      return res;
    });
};
