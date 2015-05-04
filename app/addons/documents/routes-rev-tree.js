define([
  "app",
  "api",
  "addons/documents/resources",
  "addons/documents/views-rev-tree"
],

function(app, FauxtonAPI, Resources, Views) {
  var  RevTreeRouteObject = FauxtonAPI.RouteObject.extend({
    layout: "one_pane",

    crumbs: [
      {"name": "Revision Tree","link": "_revtree"}
    ],

    routes: {
       "_revtree/:database/:doc/:winner": "revtreeRoute"
    },

    roles: ["_admin"],

    apiUrl:'revtree',

    initialize: function () {
        //put common views used on all your routes here (eg:  sidebars )
    },

    revtreeRoute: function (database,doc,winner) {
      var parameters = {
        db: database,
        docID: doc,
        winnerRev: winner
      };
      this.setView("#dashboard-content", new Resources.WRAP.Wrapper({params: parameters}));
    }
  });

  Resources.RouteObjects = [RevTreeRouteObject];

  // return Resources;
  return RevTreeRouteObject;

});