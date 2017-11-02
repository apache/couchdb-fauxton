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
import replication from './route';
import './assets/less/replication.less';
import Actions from './actions';

replication.initialize = function () {
  FauxtonAPI.addHeaderLink({ title: 'Replication', href: '#/replication', icon: 'fonticon-replicate' });
  FauxtonAPI.session.isAuthenticated().then(() => {
    Actions.checkForNewApi();
  });
};

FauxtonAPI.registerUrls('replication', {
  app: (db) => {
    return '#/replication/_create/' + db;
  },
  api: () => {
    return window.location.origin + '/_replicator';
  }
});

export default replication;
