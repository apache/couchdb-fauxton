define([
  'api'
], function(FauxtonAPI) {

  var Helpers = {};

  Helpers.getPreviousPage = function (database, wasCloned) {
    var previousPage = database.url('index'), // default to the current database's all_docs page
        lastPages = FauxtonAPI.router.lastPages;

    if (!wasCloned && lastPages.length >= 2) {

      // if we came from "/new", we don't want to link the user there
      if (/new$/.test(lastPages[1])) {
        previousPage = lastPages[0];
      } else {
        previousPage = lastPages[1];
      }
    }

    return previousPage;
  };

  return Helpers;
});
