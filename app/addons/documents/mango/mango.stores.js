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
  '../../../core/api',
  './mango.actiontypes'
],

function (FauxtonAPI, ActionTypes) {

  const operators = [
    {operator: '$eq', text: 'Equals / is'},
    {operator: '$gt', text: 'Greater than'},

    {operator: '$lt', text: 'Less than'},
    {operator: '$gte', text: 'Greater than or equal'},
    {operator: '$lte', text: 'Less than or equal'},
    {operator: '$ne', text: 'Not equal'},

    {operator: '$exists', text: 'Exists'},
    {operator: '$type', text: 'Type of'},

    {operator: '$in', text: 'In Array'},
    {operator: '$nin', text: 'Not in Array'},

    {operator: '$mod', text: 'Devisor / Remainder'},
    {operator: '$regex', text: 'Regular expression'},

  ];

  const emptyQuery = {selector: {}};

  const defaultQueryIndexCode = {
    "index": {
      "fields": ["_id"]
    },
    "type" : "json"
  };

  const defaultQueryFindCode = {
    "selector": {
      "_id": {"$gt": null}
    }
  };

  const Stores = {};

  Stores.MangoStore = FauxtonAPI.Store.extend({

    initialize: function () {
      this._queryFindCode = defaultQueryFindCode;
      this._queryIndexCode = defaultQueryIndexCode;
      this._queryFindCodeChanged = false;
      this._availableIndexes = [];
      this._getLoadingIndexes = true;

      this._queryParts = [];
      this._logicOperator = '$and';
    },

    getPossibleOperators: function () {
      return operators;
    },

    getSelectors: function () {
      return this._queryParts;
    },

    isSelectorValid: function (selector) {
      if (!selector.fieldValue) {
        return false;
      }

      if (!selector.field) {
        return false;
      }

      return true;
    },

    addSelector: function (selector) {
      if (!this.isSelectorValid(selector)) {
        return;
      }

      this.removeSelector(selector);

      this._queryParts = this._queryParts.concat([selector]);

      return this._queryParts;
    },

    removeSelector: function (selector) {

      this._queryParts = this._queryParts.reduce((acc, el) => {
        if (el.field === selector.field
          && el.operator === selector.operator
          && el.fieldValue === selector.fieldValue) {

          return acc;
        }

        acc.push(el);

        return acc;
      }, []);

      return this._queryParts;
    },

    getEmptyQuery: function () {
      return JSON.parse(JSON.stringify(emptyQuery));
    },

    getStringifiedQuery: function () {
      return this.formatCode(this.getQuery());
    },

    getQuery: function () {
      if (!this._queryParts.length) {
        return this.getEmptyQuery();
      }

      return this.buildQuery(this._queryParts);
    },

    setLogicOperator: function (options) {
      this._logicOperator = options.logicOperator;
    },

    getLogicOperator: function () {
      return this._logicOperator;
    },




    buildQuery: function (parts) {
      const wrapper = this.getEmptyQuery();

/*
    {
  "selector": {
    "year": {
      "$eq": 2001
    }
  },
  "sort": [
    "year"
  ],
  "fields": [
    "year"
  ]
}
*/
      let res;
      if (parts.length <= 1) {
        res = this.getQueryForSingleSelector(parts);
      } else {
        res = this.getQueryWithLogicalOperator(parts);
      }

      wrapper.selector = res;

      return wrapper;
    },

    getQueryWithLogicalOperator: function (parts) {
      // XXX $text handling
      // test on JSON parsing
      // 1. tests, $text handling
      const res = parts.reduce((acc, el) => {

        let tmp;
        try {
          tmp = {[el.field]: {[el.operator]: JSON.parse(el.fieldValue)}};
        } catch (e) {
          tmp = {[el.field]: {[el.operator]: el.fieldValue}};
        }

        acc.push(tmp);

        return acc;
      }, []);

      return {[this._logicOperator]: res};
    },

    getQueryForSingleSelector: function (parts) {
      // XXX $text handling
      // 1. tests, $text handling
      return parts.reduce((acc, el) => {

        try {
          acc[el.field] = {[el.operator]: JSON.parse(el.fieldValue)};
        } catch (e) {
          acc[el.field] = {[el.operator]: el.fieldValue};
        }

        return acc;
      }, {});
    },

    getQueryIndexCode: function () {
      return this.formatCode(this._queryIndexCode);
    },

    setQueryIndexCode: function (options) {
      this._queryIndexCode = options.code;
    },

    getBuiltQuery: function () {
      return {
        "selector": {
          "_id": {"$gt": null}
        }
      };
    },

    getQueryFindCode: function () {
      return this.formatCode(this._queryFindCode);
    },

    setQueryFindCode: function (options) {
      this._queryFindCode = options.code;
    },

    getLoadingIndexes: function () {
      return this._getLoadingIndexes;
    },

    setLoadingIndexes: function (options) {
      this._getLoadingIndexes = options.isLoading;
    },

    formatCode: function (code) {
      return JSON.stringify(code, null, '  ');
    },

    newQueryFindCodeFromFields: function (options) {
      const fields = options.fields;
      const queryCode = JSON.parse(JSON.stringify(this._queryFindCode));

      if (!fields) {
        return;
      }

      const selectorContent = fields.reduce(function (acc, field) {
        acc[field] = {"$gt": null};
        return acc;
      }, {});

      queryCode.selector = selectorContent;
      this._queryFindCode = queryCode;
      this._queryFindCodeChanged = true;
    },

    getQueryFindCodeChanged: function () {
      return this._queryFindCodeChanged;
    },

    setDatabase: function (options) {
      this._database = options.database;
    },

    getDatabase: function () {
      return this._database;
    },

    setAvailableIndexes: function (options) {
      this._availableIndexes = options.indexList;
    },

    getAvailableQueryIndexes: function () {
      return this._availableIndexes.filter(function (el) {
        return ['json', 'special'].indexOf(el.get('type')) !== -1;
      });
    },

    getAvailableAdditionalIndexes: function () {
      var indexes = FauxtonAPI.getExtensions('mango:additionalIndexes')[0];

      if (!indexes) {
        return;
      }

      return this._availableIndexes.filter(function (el) {
        return el.get('type').indexOf(indexes.type) !== -1;
      });
    },

    dispatch: function (action) {
      switch (action.type) {

        case ActionTypes.MANGO_SET_DB:
          this.setDatabase(action.options);
        break;

        case ActionTypes.MANGO_NEW_QUERY_CREATE_INDEX_CODE:
          this.setQueryIndexCode(action.options);
        break;

        case ActionTypes.MANGO_NEW_QUERY_FIND_CODE_FROM_FIELDS:
          this.newQueryFindCodeFromFields(action.options);
        break;

        case ActionTypes.MANGO_NEW_QUERY_FIND_CODE:
          this.setQueryFindCode(action.options);
        break;

        case ActionTypes.MANGO_NEW_AVAILABLE_INDEXES:
          this.setAvailableIndexes(action.options);
        break;

        case ActionTypes.MANGO_RESET:
          this.setLoadingIndexes(action.options);
        break;

        case ActionTypes.MANGO_BUILDER_ADD_SELECTOR:
          this.addSelector(action.options);
        break;

        case ActionTypes.MANGO_BUILDER_REMOVE_SELECTOR:
          this.removeSelector(action.options);
        break;

        case ActionTypes.MANGO_BUILDER_SET_LOGICAL_OPERATOR:
          this.setLogicOperator(action.options);
        break;
      }

      this.triggerChange();
    }

  });

  Stores.mangoStore = new Stores.MangoStore();

  Stores.mangoStore.dispatchToken = FauxtonAPI.dispatcher.register(Stores.mangoStore.dispatch);

  return Stores;

});
