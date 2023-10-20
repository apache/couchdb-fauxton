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

export const explainPlan = {
  "dbname": "/test",
  "index": {
    "ddoc": "_design/428a2f2506db4e77001bfe08fa0b79ea9eaf0279",
    "name": "foo-json-index",
    "type": "json",
    "partitioned": false,
    "def": {
      "fields": [
        {
          "foo": "asc"
        }
      ]
    }
  },
  "mrargs": {
    "include_docs": true,
    "view_type": "map",
    "reduce": false,
    "partition": null,
    "start_key": [
      0
    ],
    "end_key": [
      "<MAX>"
    ],
    "direction": "fwd",
    "stable": false,
    "update": true,
    "conflicts": "undefined"
  },
  "covering": false
};

export const explainPlanCandidates = {
  "dbname": "/testIndexes",
  "index": {
    "ddoc": "_design/428a2f2506db4e77001bfe08fa0b79ea9eaf0279",
    "name": "foo-json-index",
    "type": "json",
    "partitioned": false,
    "def": {
      "fields": [
        {
          "foo": "asc"
        }
      ]
    }
  },
  "index_candidates": [
    {
      "index": {
        "ddoc": "_design/bbed516c3e93d98a9a13e5d98d4acc71d820e5ff",
        "name": "bar-json-index",
        "type": "json",
        "partitioned": false,
        "def": {
          "fields": [
            {
              "bar": "asc"
            },
            {
              "foo": "asc"
            }
          ]
        }
      },
      "analysis": {
        "usable": false,
        "reasons": [
          {
            "name": "field_mismatch"
          }
        ],
        "ranking": 3,
        "covering": false
      }
    },
    {
      "index": {
        "ddoc": "_design/9389a767083b391afff6311ca0bc203b9becc80a",
        "name": "test-json-index",
        "type": "json",
        "partitioned": false,
        "def": {
          "fields": [
            {
              "test": "asc"
            }
          ]
        }
      },
      "analysis": {
        "usable": false,
        "reasons": [
          {
            "name": "field_mismatch"
          }
        ],
        "ranking": 3,
        "covering": false
      }
    },
    {
      "index": {
        "ddoc": "_design/43919ae9a7c472f6bdda0caa86ea8f139a3aaf14",
        "name": "foo-test-json-index",
        "type": "json",
        "partitioned": false,
        "def": {
          "fields": [
            {
              "foo": "asc"
            },
            {
              "test": "asc"
            }
          ]
        }
      },
      "analysis": {
        "usable": true,
        "reasons": [
          {
            "name": "less_overlap"
          }
        ],
        "ranking": 1,
        "covering": false
      }
    },
    {
      "index": {
        "ddoc": null,
        "name": "_all_docs",
        "type": "special",
        "def": {
          "fields": [
            {
              "_id": "asc"
            }
          ]
        }
      },
      "analysis": {
        "usable": true,
        "reasons": [
          {
            "name": "unfavored_type"
          }
        ],
        "ranking": 2,
        "covering": null
      }
    }
  ],
  "mrargs": {
    "include_docs": true,
    "view_type": "map",
    "reduce": false,
    "partition": null,
    "start_key": [
      0
    ],
    "end_key": [
      "<MAX>"
    ],
    "direction": "fwd",
    "stable": false,
    "update": true,
    "conflicts": "undefined"
  },
  "covering": false
};
