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

import React from 'react';
import FauxtonAPI from '../../core/api';
import ReplicationController from './controller';
import Actions from './actions';

const ReplicationRouteObject = FauxtonAPI.RouteObject.extend({
  routes: {
    'replication/_create': 'defaultView',
    'replication/_create/:dbname': 'defaultView',
    'replication/id/:id': 'fromId',
    'replication': 'activityView',
    'replication/_replicate': 'replicateView'
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
    const localSource = databaseName || '';
    Actions.changeTabSection('new replication');
    Actions.clearReplicationForm();

    return <ReplicationController
      localSource={localSource}
      />;
  },

  fromId: function (replicationId) {
    Actions.clearReplicationForm();
    Actions.changeTabSection('new replication');
    return <ReplicationController
      replicationId={replicationId}
    />;
  },

  activityView: function () {
    Actions.changeTabSection('activity');
    return <ReplicationController/>;
  },

  replicateView: function () {
    Actions.changeTabSection('_replicate');
    return <ReplicationController/>;
  }
});

export default {
  RouteObjects: [ReplicationRouteObject]
};
