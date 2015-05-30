define([
  'api',
  'react',
  'addons/documents/resources',
  'addons/documents/revision-tree/component.react',
  'addons/documents/revision-tree/stores',
  'addons/documents/revision-tree/actions',
  'testUtils',
  'addons/documents/revision-tree/tests/dummyTreeData'
], function (FauxtonAPI, React, Resources, Components, Stores, Actions, testUtils, dummyTreeData) {
  var assert = testUtils.assert;
  var TestUtils = React.addons.TestUtils;
  var revisionTreeActions = Stores.RevTreeStore;

  describe("Revision Tree ---- Components", function () {

    describe("Rendering Revision", function () {

      var revTreeDiv, revComponent, dummyData;

      beforeEach(function () {
        revTreeDiv = document.createElement('div');
      });

      afterEach(function () {
        React.unmountComponentAtNode(revTreeDiv);
      });

      it("Revision Test Running", function () {
        Actions.newRevisionTreeInit(dummyTreeData);
        revComponent = TestUtils.renderIntoDocument(React.createElement(Components.App, null), revTreeDiv);
        var $el = $(revComponent.getDOMNode());

        assert.ok($el.find('.visualizeRevTree').children().length === 9);

      });

    });
  });

});
