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

import FauxtonAPI from "../../../../core/api";
import Views from "../mango.components";
import MangoActions from "../mango.actions";
import ActionTypes from "../mango.actiontypes";
import Resources from "../../resources";
import Databases from "../../../databases/resources";
import utils from "../../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";

var assert = utils.assert;

describe('Mango QueryEditor', function () {
  var database = new Databases.Model({id: 'testdb'}),
      container,
      editor,
      mangoCollection;

  beforeEach(function () {
    container = document.createElement('div');
    MangoActions.setDatabase({
      database: database
    });

    mangoCollection = new Resources.MangoIndexCollection([{
      ddoc: '_design/e4d338e5d6f047749f5399ab998b4fa04ba0c816',
      def: {
        fields: [
          {'_id': 'asc'},
          {'foo': 'bar'},
          {'ente': 'gans'}
        ]
      },
      name: 'e4d338e5d6f047749f5399ab998b4fa04ba0c816',
      type: 'json'
    }, {
      ddoc: null,
      def: {
        fields: [{
          '_id': 'asc'
        }]
      },
      name: '_all_docs',
      type: 'special'
    }], {
      params: {},
      database: {
        safeID: function () { return '1'; }
      }
    });

    FauxtonAPI.dispatch({
      type: ActionTypes.MANGO_NEW_AVAILABLE_INDEXES,
      options: {indexList: mangoCollection}
    });

  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('has a default query', function () {
    editor = ReactDOM.render(
      <Views.MangoQueryEditorController description="foo" />,
      container
    );
    var json = JSON.parse(editor.getMangoEditor().getEditorValue());
    assert.equal(Object.keys(json.selector)[0], '_id');
  });
});
