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

import app from '../../app';
import FauxtonAPI from '../../core/api';
import Actions from './actions';
import Components from './components.react';


var ReplicationRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'one_pane',
  routes: {
    'replication': 'defaultView',
    'replication/:dbname': 'defaultView'
  },
  selectedHeader: 'Replication',
  apiUrl: function () {
    return [FauxtonAPI.urls('replication', 'api'), FauxtonAPI.constants.DOC_URLS.REPLICATION];
  },
  crumbs: [
    { name: 'Replication', link: 'replication' }
  ],
  roles: ['fx_loggedIn'],
  defaultView: function (databaseName) {
    const sourceDatabase = databaseName || '';
    Actions.initReplicator(sourceDatabase);
    this.setComponent('#dashboard-content', Components.ReplicationController);
  }
});

var Replication = {};
Replication.RouteObjects = [ReplicationRouteObject];

export default Replication;
