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
export default [
  {
    "user": "okra",
    "updated_on": 10,
    "type": "replication",
    "target": "https://okra.fake.com/okra_rep/",
    "doc_write_failures": 0,
    "doc_id": "rep_1",
    "continuous": true,
    "checkpointed_source_seq": "3-g1AAAAEkeJyFzkEOgjAQBdAJkHgOPUBDQS1dyVVmaE0l0CaIa72Z3qyOwahscPMn-Zm8_A4AMpca2BhqwmBrQzIXfQj-7E7eiqYLF4N-FN6OHf8mCHSIMbYuwbTnYiUllUbJl7H-GNUSQTUnXd8KTEqR467Qc0UtKT7jhBsfhu5fCa3SFR3nUvlfekzS76a9Vmi37RPEPVpb",
    "checkpoint_interval": 5000,
    "changes_pending": null,
    "pid": "<0.10487.5819>",
    "node": "fake1@fake.net",
    "docs_read": 0,
    "docs_written": 0,
    "missing_revisions_found": 0,
    "replication_id": "07d9a41f181ce11b93ba1855ca7+continuous+create_target",
    "revisions_checked": 0,
    "source": "https://okra.fake.com/okra/",
    "source_seq": 0,
    "started_on": 9
  },
  {
    "user": "ooo",
    "updated_on": 8,
    "type": "indexer",
    "node": "fake2@fake2.net",
    "pid": "<0.10541.4469>",
    "changes_done": 145,
    "database": "shards/00000000-3fffffff/ooo/fakedatabase.1234567890abc",
    "design_document": "_design/superpurple",
    "progress": 0,
    "started_on": 7,
    "total_changes": 22942
  },
  {
    "updated_on": 6,
    "node": "fake3@fake3.net",
    "pid": "<0.1152.4474>",
    "changes_done": 144001,
    "database": "shards/00000000-3fffffff/global_changes.1398718618",
    "progress": 66,
    "started_on": 5,
    "total_changes": 218052,
    "type": "database_compaction"
  },
  {
    "user": "information",
    "updated_on": 4,
    "type": "replication",
    "target": "https://information.com/somedatabase/",
    "doc_write_failures": 0,
    "doc_id": "c0ffb663f75cd940aadb4a4eaa",
    "continuous": true,
    "checkpointed_source_seq": 58717,
    "checkpoint_interval": 3600000,
    "changes_pending": 0,
    "pid": "<0.11612.3684>",
    "node": "fake.fake.com",
    "docs_read": 108,
    "docs_written": 108,
    "missing_revisions_found": 108,
    "replication_id": "a546c13951c6bd4f2d187d388+continuous",
    "revisions_checked": 1024,
    "source": "http://software:*****@123.123.123:5984/somedatabase/",
    "source_seq": 58717,
    "started_on": 3
  },
  {
    "user": "abc",
    "updated_on": 2,
    "type": "replication",
    "target": "https://fake.com/db_abc/",
    "doc_write_failures": 0,
    "doc_id": "replication_2014",
    "continuous": true,
    "checkpointed_source_seq": "2-g1AAAAEXeJzLYWBgYMlgTyrNSS3QS87JL01JzCvRy0styQGqY0pkSLL___9_VgZTImMuUIA9JSUx1cTIAE2_IS79SQ5AMqkexQiLNAPzNAsjYp2QxwIkGRqAFNCU_SBjGMDGGFokp6WZJ6IZY4TfmAMQY_4jjDE2SDE3TzHJAgBp5FSv",
    "checkpoint_interval": 5000,
    "changes_pending": 0,
    "pid": "<0.14029.1733>",
    "node": "node.node.node..net",
    "docs_read": 0,
    "docs_written": 0,
    "missing_revisions_found": 0,
    "replication_id": "33af566bab6a58aee04e+continuous",
    "revisions_checked": 7,
    "source": "https://fake.fake123.com/db_abc/",
    "source_seq": "2-g1AAAAEXeJzLYWBgYMlgS3QS87JL01JzCvRy0styQGqY0pkSLL___9_VgZTImMuUIA9JSUx1cTIAE2_IS79SQ5AMqkexQiLNAPzNAsjYp2QxwIkGRqAFNCU_SBjGMDGGFokp6WZJ6IZY4TfmAMQY_4jjDE2SDE3TzHJAgBp5FSv",
    "started_on": 1
  },
  {
    "view": 5,
    "user": "treeman",
    "updated_on": 1426614009,
    "type": "view_compaction",
    "total_changes": 1108953,
    "node": "treeman.net",
    "pid": "<0.19668.4045>",
    "changes_done": 430000,
    "database": "shards/c0000000-ffffffff/treecompany/fake.1234567890",
    "design_document": "_design/trunk",
    "phase": "view",
    "progress": 38,
    "started_on": 1426602505
  },
];
