define([
  'app',
  'api',
  'addons/documents/revisionTree/actiontypes',
  'addons/documents/revisionTree/stores'
],

function (app, FauxtonAPI, ActionTypes, Stores) {

  var revTreeStore = Stores.revTreeStore;

  return {
    newRevisionTree: function (revTreeDataModel, winner) {
      revTreeDataModel.toJSON();
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
