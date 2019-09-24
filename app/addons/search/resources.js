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
import Constants from './constants';
import Documents from '../documents/resources';

var Search = {};

Search.Doc = Documents.Doc.extend({
  setIndex: function (name, index, analyzer) {
    if (!this.isDdoc()) {
      return false;
    }

    var indexes = this.get('indexes');
    if (!indexes) {
      indexes = {};
    }
    if (!indexes[name]) {
      indexes[name] = {};
    }

    if (analyzer) {
      indexes[name].analyzer = analyzer;
    }

    indexes[name].index = index;
    return this.set({indexes: indexes});
  },

  getIndex: function (indexName) {
    return this.get('indexes')[indexName].index;
  },

  getAnalyzer: function (indexName) {
    return this.get('indexes')[indexName].analyzer;
  },

  analyzerType: function (indexName) {
    if (typeof this.getAnalyzer(indexName) === 'object') {
      return Constants.ANALYZER_MULTIPLE;
    }
    return Constants.ANALYZER_SINGLE;
  },

  dDocModel: function () {
    if (!this.isDdoc()) {
      return false;
    }

    var doc = this.get('doc');
    if (doc) {
      return new Search.Doc(doc, { database: this.database });
    }
    return false;
  }
});

Search.AllDocs = Documents.AllDocs.extend({
  model: Search.Doc
});


export default Search;
