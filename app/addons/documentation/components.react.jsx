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
  '../../app',
  '../../core/api',
  'react',
  './stores'
], function (app, FauxtonAPI, React, Stores) {

  var documentationStore = Stores.documentationStore;

  var DocumentationController = React.createClass({
    getStoreState: function () {
      return {
        links: documentationStore.getLinks()
      };
    },

    getInitialState: function () {
      return this.getStoreState();
    },

    createLinkRows: function () {
      return this.state.links.map(function (linkObject) {
        return (
          <tr key={linkObject.title}>
            <td className="icons-container">
              <div className={"icon " + linkObject.iconClassName}> </div>
            </td>
            <td>
              <a href={linkObject.link} target="_blank" data-bypass="true">{linkObject.title}</a>
            </td>
          </tr>
        );
      });
    },

    render: function () {
      return (
        <div id="documentation-page" className="scrollable">
          <div className="links">
            <table>
              <tbody>
              {this.createLinkRows()}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  });

  return {
    DocumentationController: DocumentationController
  };

});
