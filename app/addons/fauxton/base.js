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
import * as NavigationActions from './navigation/actions';
import navigationReducers from './navigation/reducers';
import notificationsReducer from './notifications/reducers';
import './assets/less/fauxton.less';

const Fauxton = FauxtonAPI.addon();

Fauxton.initialize = () => {
  const versionInfo = new Fauxton.VersionInfo();
  versionInfo.fetch().then(function () {
    NavigationActions.setNavbarVersionInfo(versionInfo.get('version'));
  });
};

Fauxton.VersionInfo = Backbone.Model.extend({
  url: function () {
    return app.host;
  }
});

FauxtonAPI.addReducers({
  navigation: navigationReducers,
  notifications: notificationsReducer
});

export default Fauxton;
