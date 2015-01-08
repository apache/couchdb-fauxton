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
  'addons/documents/actiontypes'
],
function (app, FauxtonAPI, Documents, ActionTypes) {
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
      return designDocs.find(function (doc) {
        return doc.id === designDocId;
      }).dDocModel();

    }
  };

  return {
    //helpers are added here for use in testing actions
    helpers: ActionHelpers,
    toggleEditor: function () {
      FauxtonAPI.dispatch({
        type: ActionTypes.TOGGLE_EDITOR
      });
    },

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

    editIndex: function (options) {
      FauxtonAPI.dispatch({
        type: ActionTypes.EDIT_INDEX,
        options: options
      });
    },

    saveView: function (viewInfo, designDocs) {
      var designDoc;

      if (_.isUndefined(viewInfo.designDocId)) {
        FauxtonAPI.addNotification({
          msg:  "Please enter a design doc name.",
          type: "error",
          selector: "#define-view .errors-container",
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
          selector: "#define-view .errors-container",
          clear: true
        });

        designDoc.save().then(function () {
          FauxtonAPI.addNotification({
            msg:  "View Saved.",
            type: "success",
            selector: "#define-view .errors-container",
            clear: true
          });

          if (_.any([viewInfo.designDocChanged, viewInfo.newDesignDoc, viewInfo.newView])) {
            var fragment = '/database/' + 
              viewInfo.database.safeID() +
              '/' + designDoc.safeID() + 
              '/_view/' +
              app.utils.safeURLName(viewInfo.viewName);

            FauxtonAPI.navigate(fragment);

            //This should be changed to a dispatch once implemented
            FauxtonAPI.triggerRouteEvent('reloadDesignDocs', {
              selectedTab: app.utils.removeSpecialCharacters(designDoc.id.replace(/_design\//,'')) + '_' + app.utils.removeSpecialCharacters(viewInfo.viewName)
            });
          } else {
            //This will should be changed to a dispatch once implemented
            FauxtonAPI.triggerRouteEvent('updateAllDocs', {ddoc: designDoc.id, view: viewInfo.viewName});
          }
        });
      }
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
        FauxtonAPI.navigate('/database/' + database.safeID() + '/_all_docs?limit=' + FauxtonAPI.constants.DATABASES.DOCUMENT_LIMIT);
        FauxtonAPI.triggerRouteEvent('reloadDesignDocs');
      });

    }
  };
});

