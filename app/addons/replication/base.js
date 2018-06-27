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

import FauxtonAPI from '../../core/api';
import Helpers from "../../helpers";
import replication from './route';
import './assets/less/replication.less';
import { checkForNewApi } from './actions';
import replicationReducer from './reducers';

replication.initialize = function () {
  FauxtonAPI.addHeaderLink({ title: 'Replication', href: '#/replication', icon: 'fonticon-replicate' });
  FauxtonAPI.session.isAuthenticated().then(() => {
    checkForNewApi();
  });
};

FauxtonAPI.addReducers({
  replication: replicationReducer
});

FauxtonAPI.registerUrls('replication', {
  app: (db) => '#/replication/_create/' + db,
  api: () => Helpers.getApiUrl('/_replicator')
});

export default replication;
