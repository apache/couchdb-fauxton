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
import Config from './routes';
import reducers from './reducers';
import './assets/less/config.less';

Config.initialize = function () {
  FauxtonAPI.addHeaderLink({
    title: 'Configuration',
    href: '#/_config',
    icon: 'fonticon-cog',
    className: 'config'
  });
};

FauxtonAPI.addReducers({
  config: reducers
});

export default Config;
