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
  "app",
  "api",
  "addons/databases/base",
  "addons/indexes/views",
  "addons/documents/views",
  "addons/indexes/resources"
],

function (app, FauxtonAPI, Databases, Views, Documents, Resources) {

  var CoreIndexRouteObj =  FauxtonAPI.RouteObject.extend({
    layout: "two_pane",

    initialize: function (route, masterLayout, options) {
      _.bindAll(this);
      var params = this.createParams(),
      urlParams = params.urlParams,
      docParams = params.docParams;

      this.databaseName = options[0];

      this.data = {
        database: new Databases.Model({id:this.databaseName})
      };

      this.data.designDocs = new Documents.AllDocs(null, {
        database: this.data.database,
        paging: {
          pageSize: 500
        },
        params: {
          startkey: '_design',
          endkey: '_design1',
          include_docs: true,
          limit: 500
        }
      });


      /* --------------------------------------------------
        Set up right header
      ----------------------------------------------------*/

      this.rightHeader = this.setView("#api-navbar", new Views.RightHeader({
        database: this.data.database,
        model: this.data.database,
        endpoint: this.data.designDocs.urlRef("apiurl", urlParams),
        documentation: "docs"
      }));

    },

    events: {
      "route:perPageChange": "perPageChange",
      "route:paginate": "paginate",
      "route:updateAllDocs": "updateAllDocsFromView"
    },

    /* --------------------------------------------------
      Called when you change the # of items to show in the pagination footer
    ----------------------------------------------------*/
    perPageChange: function (perPage) {
      // We need to restore the collection parameters to the defaults (1st page)
      // and update the page size
      this.perPage = perPage;
      this.documentsView.forceRender();
      this.documentsView.collection.pageSizeReset(perPage, {fetch: false});
      this.setDocPerPageLimit(perPage);
    },

    /* --------------------------------------------------
      Store the docs to show per page in local storage
    ----------------------------------------------------*/
    setDocPerPageLimit: function (perPage) {
      window.localStorage.setItem('fauxton:perpage', perPage);
    },

    /* --------------------------------------------------
      Triggers when you hit the paginate forward and backwards buttons
    ----------------------------------------------------*/

    paginate: function (options) {
      var collection = this.documentsView.collection;

      this.documentsView.forceRender();
      collection.paging.pageSize = options.perPage;
      var promise = collection[options.direction]({fetch: false});
    },

    /* --------------------------------------------------
     Get Design doc info
    ----------------------------------------------------*/
    ddocInfo: function (designDoc, designDocs, view) {
      return {
        id: "_design/" + designDoc,
        currView: view,
        designDocs: designDocs
      };
    },

    /* --------------------------------------------------
      URL params from Advanced/ Query options
    ----------------------------------------------------*/
    createParams: function (options) {
      var urlParams = app.getParams(options);
      var params = Documents.QueryParams.parse(urlParams);

      return {
        urlParams: urlParams,
        docParams: _.extend(params, {limit: this.getDocPerPageLimit(params, 20)})
      };
    },

    /* --------------------------------------------------
      determines how many docs to display for the request
    ----------------------------------------------------*/
    getDocPerPageLimit: function (urlParams, perPage) {
      var storedPerPage = perPage;

      if (window.localStorage) {
        storedPerPage = window.localStorage.getItem('fauxton:perpage');

        if (!storedPerPage) {
          this.setDocPerPageLimit(perPage);
          storedPerPage = perPage;
        } else {
          storedPerPage = parseInt(storedPerPage, 10);
        }
      }

      if (!urlParams.limit || urlParams.limit > storedPerPage) {
        return parseInt(storedPerPage, 10);
      } else {
        return parseInt(urlParams.limit, 10);
      }
    },

    establish: function () {
      return this.data.designDocs.fetch({reset: true});
    },


    /* --------------------------------------------------
        Reload preview docs
    -----------------------------------------------------*/
    updateAllDocsFromView: function (event) {
      var view = event.view,
          params = this.createParams(),
          urlParams = params.urlParams,
          docParams = params.docParams,
          ddoc = event.ddoc,
          pageSize,
          collection;

      var defaultPageSize = _.isUndefined(this.documentsView) ? 20 : this.documentsView.perPage();
      docParams.limit = pageSize = this.getDocPerPageLimit(urlParams, defaultPageSize);

      if (event.allDocs) {
        this.eventAllDocs = true; // this is horrible. But I cannot get the trigger not to fire the route!
        this.data.database.buildAllDocs(docParams);
        collection = this.data.database.allDocs;
        collection.paging.pageSize = pageSize;

      } else {
        collection = this.data.indexedDocs = new Resources.IndexCollection(null, {
          database: this.data.database,
          design: ddoc,
          view: view,
          params: docParams,
          paging: {
            pageSize: pageSize
          }
        });

        if (!this.documentsView) {
          this.documentsView = this.createViewDocumentsView({
            designDoc: ddoc,
            docParams: docParams,
            urlParams: urlParams,
            database: this.data.database,
            indexedDocs: this.indexedDocs,
            designDocs: this.data.designDocs,
            view: view
          });
        }
      }

      this.documentsView.setCollection(collection);
      this.documentsView.setParams(docParams, urlParams);

      this.documentsView.forceRender();
    },

    /* --------------------------------------------------
      Docs that are returned from a view
    ----------------------------------------------------*/
    createViewDocumentsView: function (options) {
      return this.setView("#right-content", new Documents.Views.AllDocsList({
        database: options.database,
        collection: options.indexedDocs,
        nestedView: Views.Row,
        viewList: true,
        ddocInfo: this.ddocInfo(options.designDoc, options.designDocs, options.view),
        docParams: options.docParams,
        params: options.urlParams
      }));
    }
  });

  return CoreIndexRouteObj;

});
