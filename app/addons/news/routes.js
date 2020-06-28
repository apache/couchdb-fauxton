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
import NewsComponents from "./components";
import {OnePaneSimpleLayout} from '../components/layouts';

var NewsRouteObject = FauxtonAPI.RouteObject.extend({
  selectedHeader: 'News',
  hideApiBar: true,
  hideNotificationCenter: true,
  routes: {
    'news': 'news'
  },
  roles: ['fx_loggedIn'],
  news: function () {
    return <OnePaneSimpleLayout
      component={<NewsComponents.NewsPage/>}
      crumbs={[
        {'name': 'News'}
      ]}
    />;
  }
});
NewsRouteObject.RouteObjects = [NewsRouteObject];

export default NewsRouteObject;
