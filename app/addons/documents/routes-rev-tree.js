define([
  "app",
  "api",
  "addons/documents/resources",
  "addons/documents/revision-tree/actions",
  "addons/documents/revision-tree/component.react"

],

function (app, FauxtonAPI, Resources, RevisionTreeActions, AppComponent) {
  var  RevTreeRouteObject = FauxtonAPI.RouteObject.extend({
    layout: "one_pane",

    crumbs: [
      {"name": "Revision Tree" , "link": "_revtree"}
    ],

    routes: {
       "database/:db/:doc/_revtree/:winner": "revtreeRoute"
    },

    roles: ["_admin"],

    apiUrl:'revtree',

    initialize: function () {
        //put common views used on all your routes here (eg:  sidebars )
    },

    revtreeRoute: function (database, docId, winner) {
      var treeDataUrl = app.host + '/' + database + '/' + docId + '?open_revs=all&revs=true';

      var revTreeData = new Resources.RevTreeDataModel(treeDataUrl);

      RevisionTreeActions.newRevisionTree(revTreeData, winner);
      this.setComponent("#dashboard-content", AppComponent.App);
    }
  });

  Resources.RouteObjects = [RevTreeRouteObject];

  // return Resources;
  return RevTreeRouteObject;

});
