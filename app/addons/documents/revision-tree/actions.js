define([
  'app',
  'api',
  'addons/documents/revision-tree/actiontypes',
  'addons/documents/revision-tree/stores',
  "addons/documents/resources"
],

function (app, FauxtonAPI, ActionTypes, Stores, Resources) {

  var revTreeStore = Stores.revTreeStore;

  return {
    newRevisionTree: function (revTreeDataModel, winner, db, docId) {
      FauxtonAPI.when(revTreeDataModel.fetch()).done(function () {
        var options = {
          winner: winner,
          db: db,
          docId: docId,
          data:revTreeDataModel.attributes.content
        };
        this.newRevisionTreeInit(options);
      }.bind(this));
    },

    newRevisionTreeInit: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.REV_TREE_NEW_REV_TREE,
        options: options
      });
    },

    newRevisionDocData: function (url) {
      var revDocDataModel = new Resources.RevDocDataModel(url);
      FauxtonAPI.when(revDocDataModel.fetch()).done(function () {
        FauxtonAPI.dispatch({
          type: ActionTypes.REV_TREE_DOC_REV_DATA,
          options: {
            data: revDocDataModel.get('content')
          }
        });
      }.bind(this));
    }
  };
});
