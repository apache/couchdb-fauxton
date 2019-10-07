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
export default {
  ANALYZER_SINGLE: 'single',
  ANALYZER_MULTIPLE: 'multiple',
  DEFAULT_SEARCH_INDEX_NAME: 'newSearch',
  DEFAULT_ANALYZER_TYPE: 'single',
  DEFAULT_ANALYZER: 'standard',
  DEFAULT_SEARCH_INDEX_FUNCTION: 'function (doc) {\n  index("name", doc.name);\n}',
  SEARCH_MANGO_INDEX_TEMPLATES: [{
    label: 'Single field (json)',
    code: {
      "index": {
        "fields": ["foo"]
      },
      "name": "foo-json-index",
      "type": "json"
    }
  }, {
    label: 'Multiple fields (json)',
    code: {
      "index": {
        "fields": ["foo", "bar"]
      },
      "name": "foo-bar-json-index",
      "type": "json"
    }
  },
  {
    label: 'Single field (text)',
    code: {
      "index": {
        "fields": [
          {
            "name": "foo",
            "type": "string"
          }
        ]
      },
      "name": "foo-text",
      "type": "text"
    }
  },
  {
    label: 'All fields (text)',
    code: {
      "index": {
        "default_field": {
          "enabled": false
        },
        "index_array_lengths": false
      },
      "name": "all-text",
      "type": "text"
    }
  },
  {
    label: 'All fields with default field (text)',
    code: {
      "index": {
        "index_array_lengths": false
      },
      "name": "all-text",
      "type": "text"
    }
  }]
};
