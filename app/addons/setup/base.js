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

import FauxtonAPI from "../../core/api";
import app from '../../app';
import Setup from "./route";
import reducers from './reducers';
import "./assets/less/setup.less";
Setup.initialize = function () {
  FauxtonAPI.addHeaderLink({
    title: 'Setup',
    href: "#/setup",
    icon: 'fonticon-wrench'
  });
};

FauxtonAPI.addReducers({
  setup: reducers
});

FauxtonAPI.registerUrls('cluster_setup', {
  server: () => app.host + '/_cluster_setup',
  app: () => '/_cluster_setup',
  apiurl: () => window.location.origin + "/_cluster_setup"
});

export default Setup;
