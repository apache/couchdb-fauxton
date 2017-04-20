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
import React from "react";
import ReactDOM from "react-dom";
import utils from "../../../../../test/mocha/testUtils";
import Components from "../sidebar";
import TestUtils from "react-addons-test-utils";
var assert = utils.assert;
var DesignDoc = Components.DesignDoc;


describe('DesignDoc', function () {
  var container;
  var database = { id: 'db' };

  var selectedNavInfo = {
    navItem: 'all-docs',
    designDocName: '',
    designDocSection: '',
    indexName: ''
  };

  beforeEach(function () {
    container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(container);
  });

  it('confirm only single sub-option is shown by default (metadata link)', function () {
    var el = TestUtils.renderIntoDocument(<DesignDoc
      database={database}
      toggle={function () {}}
      sidebarListTypes={[]}
      isExpanded={true}
      selectedNavInfo={selectedNavInfo}
      toggledSections={{}}
      designDoc={{ customProp: { one: 'something' } }}
    />, container);

    var subOptions = $(ReactDOM.findDOMNode(el)).find('.accordion-body li');
    assert.equal(subOptions.length, 1);
 });

  it('confirm design doc sidebar extensions appear', function () {
    var el = TestUtils.renderIntoDocument(<DesignDoc
      database={database}
      toggle={function () {}}
      sidebarListTypes={[{
        selector: 'customProp',
        name: 'Search Indexes',
        icon: 'icon-here',
        urlNamespace: 'whatever'
      }]}
      isExpanded={true}
      selectedNavInfo={selectedNavInfo}
      toggledSections={{}}
      designDoc={{ customProp: { one: 'something' } }}
    />, container);

    var subOptions = $(ReactDOM.findDOMNode(el)).find('.accordion-body li');
    assert.equal(subOptions.length, 3); // 1 for "Metadata" row, 1 for Type List row ("search indexes") and one for the index itself
  });

  it('confirm design doc sidebar extensions do not appear when they have no content', function () {
    var el = TestUtils.renderIntoDocument(<DesignDoc
      database={database}
      toggle={function () {}}
      sidebarListTypes={[{
        selector: 'customProp',
        name: 'Search Indexes',
        icon: 'icon-here',
        urlNamespace: 'whatever'
      }]}
      isExpanded={true}
      selectedNavInfo={selectedNavInfo}
      designDoc={{}} // note that this is empty
    />, container);

    var subOptions = $(ReactDOM.findDOMNode(el)).find('.accordion-body li');
    assert.equal(subOptions.length, 1);
  });

  it('confirm doc metadata page is highlighted if selected', function () {
    var el = TestUtils.renderIntoDocument(<DesignDoc
      database={database}
      toggle={function () {}}
      sidebarListTypes={[]}
      isExpanded={true}
      selectedNavInfo={{
        navItem: 'designDoc',
        designDocName: 'id',
        designDocSection: 'metadata',
        indexName: ''
      }}
      designDoc={{}} />, container);

    assert.equal($(ReactDOM.findDOMNode(el)).find('.accordion-body li.active a').html(), 'Metadata');
  });

});
