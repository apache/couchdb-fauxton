define([
  'api',
  'addons/documents/revision-tree/actiontypes'
],

function (FauxtonAPI, ActionTypes) {

  var Stores = {};

  Stores.RevTreeStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this._treeOptions;
      this._treeData;
    },

    newRevTree: function (options) {
      console.log("At Stores option data");
      console.log(options);
      this._treeOptions = options;
    },

    setRevDocData: function (options) {
      // console.log(options);
      this._treeData = options.data;
    },

    getTreeOptions: function () {
      return this._treeOptions;
    },

    getRevDocData: function () {
      return this._treeData;
    },

    dispatch: function (action) {
      switch (action.type) {
        case ActionTypes.REV_TREE_NEW_REV_TREE:
          this.newRevTree(action.options);
          this.triggerChange();
        break;

        case ActionTypes.REV_TREE_DOC_REV_DATA:
          // console.log(this._treeOptions);
          this.setRevDocData(action.options);
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
