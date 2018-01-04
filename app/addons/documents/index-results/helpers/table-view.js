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

import Constants from "../../constants";
import {
  isJSONDocBulkDeletable,
  isJSONDocEditable,
  hasBulkDeletableDoc,
  getDocUrl,
  getDocId,
  getDocRev
} from "./shared-helpers";

export const getPseudoSchema = (docs) => {
  let cache = [];

  docs.forEach((doc) => {
    Object.keys(doc).forEach(function (k) {
      cache.push(k);
    });
  });

  cache = _.uniq(cache);

  // always begin with _id
  let i = cache.indexOf('_id');
  if (i !== -1) {
    cache.splice(i, 1);
    cache.unshift('_id');
  }

  return cache;
};

export const getPrioritizedFields = (docs, max) => {
  let res = docs.reduce((acc, el) => {
    acc = acc.concat(Object.keys(el));
    return acc;
  }, []);

  res = _.countBy(res, (el) => {
    return el;
  });

  delete res.id;
  delete res._rev;

  res = Object.keys(res).reduce((acc, el) => {
    acc.push([res[el], el]);
    return acc;
  }, []);

  res = sortByTwoFields(res);
  res = res.slice(0, max);

  return res.reduce((acc, el) => {
    acc.push(el[1]);
    return acc;
  }, []);
};

export const sortByTwoFields = (elements) => {
  // given:
  // var a = [[2, "b"], [3, "z"], [1, "a"], [3, "a"]]
  // it sorts to:
  // [[3, "a"], [3, "z"], [2, "b"], [1, "a"]]
  // note that the arrays with 3 got the first two arrays
  // _and_ that the second values in the array with 3 are also sorted

  const _recursiveSort = (a, b, index) => {
    if (a[index] === b[index]) {
      return index < 2 ? _recursiveSort(a, b, index + 1) : 0;
    }

    // second elements asc
    if (index === 1) {
      return (a[index] < b[index]) ? -1 : 1;
    }

    // first elements desc
    return (a[index] < b[index]) ? 1 : -1;
  };

  return elements.sort((a, b) => {
    return _recursiveSort(a, b, 0);
  });
};

export const getNotSelectedFields = (selectedFields, allFields) => {
  const without = _.without.bind(this, allFields);
  return without.apply(this, selectedFields);
};

export const getFullTableViewData = (docs, options) => {
  let notSelectedFieldsTableView = null,
      selectedFieldsTableView = options.selectedFieldsTableView,
      showAllFieldsTableView = options.showAllFieldsTableView,
      schema;  // array containing the unique attr keys in the results.  always begins with _id.

  // only use the "doc" attribute as this resulted from an include_docs fetch
  const normalizedDocs = docs.map((doc) => { return doc.doc || doc; });
  // build the schema container based on the normalized data
  schema = getPseudoSchema(normalizedDocs);

  // if we don't know what attr/columns to display, build the list
  if (selectedFieldsTableView && selectedFieldsTableView.length === 0) {
    selectedFieldsTableView = getPrioritizedFields(normalizedDocs, 5);
  }

  // set the notSelectedFields to the subset excluding meta and selected attributes
  const schemaWithoutMetaDataFields = _.without(schema, '_attachments');
  notSelectedFieldsTableView = getNotSelectedFields(selectedFieldsTableView, schemaWithoutMetaDataFields);

  // if we're showing all attr/columns, we revert the notSelectedFields to null and set
  // the selected fields to everything excluding meta.
  if (showAllFieldsTableView) {
    notSelectedFieldsTableView = null;
    selectedFieldsTableView = schemaWithoutMetaDataFields;
  }

  return {
    schema,
    normalizedDocs,
    selectedFieldsTableView,
    notSelectedFieldsTableView
  };
};

export const getMetaDataTableView = (docs) => {
  const schema = getPseudoSchema(docs);
  return {
    schema,
    normalizedDocs: docs,  // no need to massage the docs for metadata
    selectedFieldsTableView: schema,
    notSelectedFieldsTableView: null
  };
};

export const getTableViewData = (docs, options) => {
  const isMetaData = Constants.LAYOUT_ORIENTATION.METADATA === options.selectedLayout;
  const {
    schema,
    normalizedDocs,
    selectedFieldsTableView,
    notSelectedFieldsTableView
  } = isMetaData ? getMetaDataTableView(docs) : getFullTableViewData(docs, options);

  const res = normalizedDocs.map(function (doc) {
    return {
      content: doc,
      id: getDocId(doc, options.docType),
      _rev: getDocRev(doc, options.docType),
      header: '',
      keylabel: '',
      url: doc._id || doc.id ? getDocUrl('app', doc._id || doc.id, options.databaseName) : null,
      isDeletable: options.deleteEnabled ? isJSONDocBulkDeletable(doc, options.docType) : false,
      isEditable: isJSONDocEditable(doc, options.docType)
    };
  });

  return {
    notSelectedFields: notSelectedFieldsTableView,
    selectedFields: selectedFieldsTableView,
    hasBulkDeletableDoc: options.deleteEnabled ? hasBulkDeletableDoc(normalizedDocs, options.docType) : false,
    schema: schema,
    results: res,
    displayedFields: isMetaData ? null : {
      shown: _.uniq(selectedFieldsTableView).length,
      allFieldCount: _.without(schema, '_attachments').length
    }
  };
};
