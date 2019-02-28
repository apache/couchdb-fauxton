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

import app from "../../app";
import FauxtonAPI from "../../core/api";

import ReactComponentsActions from "../components/actions";


// sequence info is an array in couchdb2 with two indexes. On couch 1.x, it's just a string / number
const getSeqNum = (val) => {
  return _.isArray(val) ? val[1] : val;
};

const getNewButtonLinks = (databaseName, partitionKey) => {
  const addLinks = FauxtonAPI.getExtensions('sidebar:links');
  const newUrlPrefix = '#' + FauxtonAPI.urls('databaseBaseURL', 'app', FauxtonAPI.url.encode(databaseName));
  let partitionKeyComponent = '';
  let partitionKeyQueryParam = '';
  if (partitionKey) {
    partitionKeyComponent = '/_partition/' + encodeURIComponent(partitionKey);
    partitionKeyQueryParam = '?partitionKey=' + encodeURIComponent(partitionKey);
  }

  const addNewLinks = addLinks.reduce((menuLinks, link) => {
    menuLinks.push({
      title: link.title,
      url: newUrlPrefix + partitionKeyComponent + '/' + link.url,
      icon: 'fonticon-plus-circled'
    });

    return menuLinks;
  }, [{
    title: 'New Doc',
    url: newUrlPrefix + '/_new' + partitionKeyQueryParam,
    icon: 'fonticon-plus-circled'
  }, {
    title: 'New View',
    url: newUrlPrefix + partitionKeyComponent + '/new_view',
    icon: 'fonticon-plus-circled'
  }, getMangoLink(databaseName, partitionKey)]);

  return [{
    title: 'Add New',
    links: addNewLinks
  }];
};

const getMangoLink = (databaseName, partitionKey) => {
  const newUrlPrefix = '#' + FauxtonAPI.urls('databaseBaseURL', 'app', FauxtonAPI.url.encode(databaseName)) +
    (partitionKey ? '/_partition/' + encodeURIComponent(partitionKey) : '');

  return {
    title: app.i18n.en_US['new-mango-index'],
    url: newUrlPrefix + '/_index',
    icon: 'fonticon-plus-circled'
  };
};

const parseJSON = (str) => {
  return JSON.parse('"' + str + '"');   // this ensures newlines are converted
};

const getModifyDatabaseLinks = (databaseName) => {
  return [{
    title: 'Replicate Database',
    icon: 'fonticon-replicate',
    url: FauxtonAPI.urls('replication', 'app', databaseName)
  }, {
    title: 'Delete',
    icon: 'fonticon-trash',
    onClick: ReactComponentsActions.showDeleteDatabaseModal.bind(this, {showDeleteModal: true, dbId: databaseName})
  }];
};

const truncateDoc = (docString, maxRows) => {
  let lines = docString.split('\n');
  let isTruncated = false;
  if (lines.length > maxRows) {
    isTruncated = true;
    lines = lines.slice(0, maxRows);
    docString = lines.join('\n');
  }
  return {
    isTruncated: isTruncated,
    content: docString
  };
};

const getNewDocUrl = (databaseName, partitionKey) => {
  const safeDatabaseName = encodeURIComponent(databaseName);
  let url = FauxtonAPI.urls('new', 'newDocument', safeDatabaseName);
  if (partitionKey) {
    url = url + '?partitionKey=' + encodeURIComponent(partitionKey);
  }
  return url;
};

const selectedViewContainsReduceFunction = (designDocs, selectedNavItem) => {
  if (!selectedNavItem) {
    return false;
  }

  let showReduce = false;
  // If a map/reduce view is selected, check if view contains reduce field
  if (designDocs && isViewSelected(selectedNavItem)) {
    const ddocID = '_design/' + selectedNavItem.designDocName;
    const ddoc = designDocs.find(ddoc => ddoc._id === ddocID);
    showReduce = ddoc !== undefined && ddoc.views
        && ddoc.views[selectedNavItem.indexName] !== undefined
        && ddoc.views[selectedNavItem.indexName].reduce !== undefined;
  }
  return showReduce;
};

const selectedItemIsPartitionedView = (designDocs, selectedNavItem, isDbPartitioned) => {
  if (!selectedNavItem) {
    return false;
  }

  let isPartitioned = false;
  if (designDocs && isViewSelected(selectedNavItem)) {
    const ddocID = '_design/' + selectedNavItem.designDocName;
    const ddoc = designDocs.find(ddoc => ddoc._id === ddocID);
    if (ddoc) {
      isPartitioned = isDDocPartitioned(ddoc, isDbPartitioned);
    }
  }
  return isPartitioned;
};

const isViewSelected = (selectedNavItem) => {
  return (selectedNavItem.navItem === 'designDoc'
    && selectedNavItem.designDocSection === 'Views'
    && selectedNavItem.indexName);
};

const isDDocPartitioned = (ddoc, isDbPartitioned) => {
  // By default a design doc is partitioned if the database is partitioned
  let isDDocPartitioned = isDbPartitioned;
  // Check if ddoc is explictly set to not partitioned
  if (isDbPartitioned && ddoc.options && ddoc.options.partitioned === false) {
    isDDocPartitioned = false;
  }
  return isDDocPartitioned;
};

export default {
  getSeqNum,
  getNewButtonLinks,
  getModifyDatabaseLinks,
  getNewDocUrl,
  isDDocPartitioned,
  parseJSON,
  truncateDoc,
  selectedViewContainsReduceFunction,
  selectedItemIsPartitionedView,
  isViewSelected
};
