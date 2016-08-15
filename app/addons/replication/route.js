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
import ReplicationController from './controller';
import ComponentActions from '../components/actions';

const ReplicationRouteObject = FauxtonAPI.RouteObject.extend({
  layout: 'empty',
  hideNotificationCenter: true,
  hideApiBar: true,

  routes: {
    'replication/create': 'defaultView',
    'replication/:dbname': 'defaultView',
    'replication/id/:id': 'fromId',
    'replication': 'activityView'
  },
  selectedHeader: 'Replication',

  roles: ['fx_loggedIn'],

  setActivityCrumbs () {
    this.crumbs = [
      {name: 'Replication'}
    ];
  },

  setCreateReplicationCrumbs () {
    this.crumbs = [
      {name: 'Replication', link: 'replication'},
      {name: 'New Replication'}
    ];
  },

  defaultView: function (databaseName) {
    // ComponentActions.hideAPIBarButton();
    // this.setCreateReplicationCrumbs();
    const localSource = databaseName || '';
    this.setComponent('.template', ReplicationController, {
      localSource: localSource,
      section: 'new replication'
    });

  },

  fromId: function (replicationId) {
    // ComponentActions.hideAPIBarButton();
    // this.setCreateReplicationCrumbs();
    this.setComponent('.template', ReplicationController, {
      replicationId: replicationId,
      section: 'new replication'
    });
  },

  activityView: function () {
    // ComponentActions.hideAPIBarButton();
    // this.setActivityCrumbs();
    this.setComponent('.template', ReplicationController, {
      section: 'activity'
    });
  }
});

export default {
  RouteObjects: [ReplicationRouteObject]
};
