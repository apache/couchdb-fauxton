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

import Backbone from "backbone";
import _ from "lodash";

var Store = function () {
  this.initialize.apply(this, arguments);
  _.bindAll(this);
};

Store.extend = Backbone.Model.extend;
_.extend(Store.prototype, Backbone.Events, {
  triggerChange: function () {
    this.trigger('change');
  },

  initialize: function () {}
});

export default Store;
