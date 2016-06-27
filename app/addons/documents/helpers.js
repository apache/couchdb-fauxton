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


// sequence info is an array in couchdb2 with two indexes. On couch 1.x, it's just a string / number
function getSeqNum (val) {
  return _.isArray(val) ? val[1] : val;
}

function getNewButtonLinks (databaseName) {
  var addLinks = FauxtonAPI.getExtensions('sidebar:links');
  var newUrlPrefix = '#' + FauxtonAPI.urls('databaseBaseURL', 'app', databaseName);

  var addNewLinks = _.reduce(addLinks, function (menuLinks, link) {
    menuLinks.push({
      title: link.title,
      url: newUrlPrefix + '/' + link.url,
      icon: 'fonticon-plus-circled'
    });

    return menuLinks;
  }, [{
    title: 'New Doc',
    url: newUrlPrefix + '/new',
    icon: 'fonticon-plus-circled'
  }, {
    title: 'New View',
    url: newUrlPrefix + '/new_view',
    icon: 'fonticon-plus-circled'
  }, getMangoLink(databaseName)]);

  return [{
    title: 'Add New',
    links: addNewLinks
  }];
}

function getMangoLink (databaseName) {
  var newUrlPrefix = '#' + FauxtonAPI.urls('databaseBaseURL', 'app', databaseName);

  return {
    title: app.i18n.en_US['new-mango-index'],
    url: newUrlPrefix + '/_index',
    icon: 'fonticon-plus-circled'
  };
}

function parseJSON (str) {
  return JSON.parse('"' + str + '"');   // this ensures newlines are converted
}

function getModifyDatabaseLinks (databaseName, deleteCallback) {
  return [{
    title: 'Replicate Database',
    icon: 'fonticon-replicate',
    url: FauxtonAPI.urls('replication', 'app', databaseName)
  }, {
    title: 'Delete',
    icon: 'fonticon-trash',
    onClick: function () {
      deleteCallback({showDeleteModal: true, dbId: databaseName});
    }
  }];
}

function truncateDoc (docString, maxRows) {
  var lines = docString.split('\n');
  var isTruncated = false;
  if (lines.length > maxRows) {
    isTruncated = true;
    lines = lines.slice(0, maxRows);
    docString = lines.join('\n');
  }
  return {
    isTruncated: isTruncated,
    content: docString
  };
}


export default {
  getSeqNum: getSeqNum,
  getNewButtonLinks: getNewButtonLinks,
  getModifyDatabaseLinks: getModifyDatabaseLinks,
  parseJSON: parseJSON,
  truncateDoc: truncateDoc
};
