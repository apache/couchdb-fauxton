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
import FauxtonAPI from "../../core/api";
import VerifyInstall from "./resources";
import VerifyInstallContainer from "./components/VerifyInstallContainer";
import {OnePaneSimpleLayout} from '../components/layouts';

const VerifyRouteObject = FauxtonAPI.RouteObject.extend({
  routes: {
    'verifyinstall': 'verifyInstall'
  },
  selectedHeader: 'Verify',

  verifyInstall: function () {
    return <OnePaneSimpleLayout
      component={<VerifyInstallContainer/>}
      crumbs={[
        {name: 'Verify CouchDB Installation'}
      ]}
    />;
  }
});

VerifyInstall.RouteObjects = [VerifyRouteObject];

export default VerifyInstall;
