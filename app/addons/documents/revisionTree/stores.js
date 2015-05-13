define([
  'api',
  'addons/documents/revisionTree/actiontypes'
],

function (FauxtonAPI, ActionTypes) {

  var Stores = {};

  Stores.RevTreeStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this._treeOptions;
      this._revDocData;
    },

    newRevTree: function (options) {
      this._treeOptions = options;
    },

    newDocData: function (docData) {
      this._revDocData = docData;
    },

    getTreeOptions: function () {
      return this._treeOptions;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.REV_TREE_NEW_REV_TREE:
          this.newRevTree(action.options);
          this.triggerChange();
        break;

        case ActionTypes.REV_TREE_DOC_REV_DATA:
          this.newDocData(action.options);
          this.triggerChange();
        break;
        
        default:
        return;
      }
    }

  });

  Stores.revTreeStore = new Stores.RevTreeStore();
  Stores.revTreeStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.revTreeStore.dispatch);

  return Stores;

}
);