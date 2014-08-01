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

define(function(require, exports, module) {
  var Backbone = require("backbone");
  var LayoutManager = require("plugins/backbone.layoutmanager");

  var Layout = Backbone.Layout.extend({
    template: "templates/layouts/with_sidebar",

    // Either tests or source are expecting synchronous renders, so disable
    // asynchronous rendering improvements.
    useRAF: false,

    setTemplate: function(template) {
      if (template.prefix){
        this.template = template.prefix + template.name;
      } else{
        this.template = "templates/layouts/" + template;
      }

      // If we're changing layouts all bets are off, so kill off all the
      // existing views in the layout.
      this.removeView();
      this.render();
    }
  });

  module.exports = Layout;

});
