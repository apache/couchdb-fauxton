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

define([
  'app',
  'api',
  'react'
],

function (app, FauxtonAPI, React) {

  var NoResultScreen = React.createClass({
    render: function () {
      return (
        <div className="watermark-logo">
          <h3>No Index Created Yet!</h3>
        </div>
      );
    }
  });

  var ViewResultListController = React.createClass({
    render: function () {
      var view = <NoResultScreen />;

      return (
        view
      );
    }
  });

  var Views = {
    renderViewResultList: function (el) {
      React.render(<ViewResultListController />, el);
    },
    removeViewResultList: function (el) {
      React.unmountComponentAtNode(el);
    },
    List: ViewResultListController
  };

  return Views;
});
