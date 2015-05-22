define([
  'app',
  'api',
  'addons/documents/revision-tree/actiontypes',
  'addons/documents/revision-tree/stores'
],

function (app, FauxtonAPI, ActionTypes, Stores) {

  var revTreeStore = Stores.revTreeStore;

  return {
    newRevisionTree: function (revTreeDataModel, winner) {
      FauxtonAPI.when(revTreeDataModel.fetch()).done(function () {
        FauxtonAPI.dispatch({
          type: ActionTypes.REV_TREE_NEW_REV_TREE,
          options: {
            winner: winner,
            data:revTreeDataModel.attributes.content
          }
        });
      }.bind(this));
    }
  };
});
