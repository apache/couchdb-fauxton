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

define([
  'app',
  'api',
  'addons/documents/resources',
  'addons/documents/index-editor/actiontypes',
  'addons/documents/index-results/actions'
],
function (app, FauxtonAPI, Documents, ActionTypes, IndexResultsActions) {
  var ActionHelpers = {
    createNewDesignDoc: function (id, database) {
      var designDoc = {
        _id: id,
        views: {
        }
      };

      return new Documents.Doc(designDoc, {database: database});
    },

    findDesignDoc: function (designDocs, designDocId) {
      return _.find(designDocs, function (doc) {
        return doc.id === designDocId;
      }).dDocModel();

    }
  };

  return {
    //helpers are added here for use in testing actions
    helpers: ActionHelpers,

    selectReduceChanged: function (reduceOption) {
      FauxtonAPI.dispatch({
        type: ActionTypes.SELECT_REDUCE_CHANGE,
        reduceSelectedOption: reduceOption
      });
    },

    newDesignDoc: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.NEW_DESIGN_DOC
      });
    },

    designDocChange: function (id, newDesignDoc) {
      FauxtonAPI.dispatch({
        type: ActionTypes.DESIGN_DOC_CHANGE,
        newDesignDoc: newDesignDoc,
        designDocId: id
      });
    },

    changeViewName: function (name) {
      FauxtonAPI.dispatch({
        type: ActionTypes.VIEW_NAME_CHANGE,
        name: name
      });
    },

    editIndex: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.EDIT_INDEX,
        options: options
      });
    },

    fetchDesignDocsBeforeEdit: function (options) {
      options.designDocs.fetch({reset: true}).then(function () {
        this.editIndex(options);
      }.bind(this));
    },

    saveView: function (viewInfo) {
      var designDoc;
      var designDocs = viewInfo.designDocs;

      if (_.isUndefined(viewInfo.designDocId)) {
        FauxtonAPI.addNotification({
          msg:  "Please enter a design doc name.",
          type: "error",
          clear: true
        });

        return;
      }

      if (viewInfo.newDesignDoc) {
        designDoc = ActionHelpers.createNewDesignDoc(viewInfo.designDocId, viewInfo.database);
      } else {
        designDoc = ActionHelpers.findDesignDoc(designDocs, viewInfo.designDocId);
      }

      var result = designDoc.setDdocView(viewInfo.viewName,
                            viewInfo.map,
                            viewInfo.reduce);

      if (result) {
        FauxtonAPI.dispatch({
         type: ActionTypes.SAVE_VIEW
        });

        FauxtonAPI.addNotification({
          msg:  "Saving View...",
          type: "info",
          clear: true
        });

        designDoc.save().then(function () {
          FauxtonAPI.addNotification({
            msg:  "View Saved.",
            type: "success",
            clear: true
          });


          if (_.any([viewInfo.designDocChanged, viewInfo.hasViewNameChanged, viewInfo.newDesignDoc, viewInfo.newView])) {
            FauxtonAPI.dispatch({
              type: ActionTypes.VIEW_SAVED
            });
            var fragment = FauxtonAPI.urls('view', 'showNewlySavedView', viewInfo.database.safeID(), designDoc.safeID(), app.utils.safeURLName(viewInfo.viewName));
            FauxtonAPI.navigate(fragment, {trigger: true});
          } else {
            this.updateDesignDoc(designDoc);
          }

          IndexResultsActions.reloadResultsList();
        }.bind(this));
      }
    },

    updateDesignDoc: function (designDoc) {
      FauxtonAPI.dispatch({
        type: ActionTypes.VIEW_UPDATE_DESIGN_DOC,
        designDoc: designDoc.toJSON()
      });
    },

    deleteView: function (options) {
      var viewName = options.viewName;
      var database = options.database;
      var designDoc = ActionHelpers.findDesignDoc(options.designDocs, options.designDocId);
      var promise;

      designDoc.removeDdocView(viewName);

      if (designDoc.hasViews()) {
        promise = designDoc.save();
      } else {
        promise = designDoc.destroy();
      }

      promise.then(function () {
        var url = FauxtonAPI.urls('allDocs', 'app', database.safeID(), '?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
        FauxtonAPI.navigate(url);
        FauxtonAPI.triggerRouteEvent('reloadDesignDocs');
      });

    }
  };
});
