define([
  'api',
  'addons/documents/revision-tree/actiontypes'
],

function (FauxtonAPI, ActionTypes) {

  var Stores = {};

  Stores.RevTreeStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this._treeOptions;
    },

    newRevTree: function (options) {
      console.log("At Stores option data");
      console.log(options);
      this._treeOptions = options;
    },

    getTreeOptions: function () {
      return this._treeOptions;
    },

    getTreeData: function () {
      return this._treeData;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.REV_TREE_NEW_REV_TREE:
          this.newRevTree(action.options);
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

});
