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
var Views = {};

Views.Tabs = FauxtonAPI.View.extend({
  className: "sidenav",
  tagName: "nav",
  template: 'addons/config/templates/sidebartabs',
  initialize: function (options) {
    this.sidebarItems = options.sidebarItems;
  },

  setSelectedTab: function (selectedTab) {
    this.selectedTab = selectedTab;
    this.$('li').removeClass('active');
    this.$('a[data-type-select="' + this.selectedTab + '"]').parent("li").addClass('active');
  },
  afterRender: function () {
    this.setSelectedTab(this.selectedTab);
  },

  serialize: function () {
    return {
      sidebarItems: this.sidebarItems
    };
  }
});

export default Views;
