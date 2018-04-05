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
import ReplicationController from './container';

const ReplicationRouteObject = FauxtonAPI.RouteObject.extend({
  routes: {
    'replication/_create': 'createView',
    'replication/_create/:dbname': 'createView',
    'replication/id/:id': 'createViewFromId',
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

  createView: function (databaseName) {
    const localSource = databaseName || '';

    return <ReplicationController
      routeLocalSource={localSource}
      section={'new replication'}
    />;
  },

  createViewFromId: function (replicationId) {
    return <ReplicationController
      replicationId={replicationId}
      section={'new replication'}
    />;
  },

  activityView: function () {
    return <ReplicationController
      section={"activity"}
    />;
  },

  replicateView: function () {
    return <ReplicationController
      section={"_replicate"}
    />;
  }
});

export default {
  RouteObjects: [ReplicationRouteObject]
};
