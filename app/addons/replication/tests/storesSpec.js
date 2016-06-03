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
import utils from '../../../../test/mocha/testUtils';
import Stores from '../stores';
import Constants from '../constants';

const assert = utils.assert;
const store = Stores.replicationStore;

describe('Databases Store', function () {

  afterEach(function () {
    store.reset();
  });

  it('confirm updateFormField updates all fields', function () {
    assert.equal(store.getRemoteSource(), '');
    store.updateFormField('remoteSource', 'SOURCE');
    assert.equal(store.getRemoteSource(), 'SOURCE');

    assert.equal(store.getRemoteTarget(), '');
    store.updateFormField('remoteTarget', 'TARGET');
    assert.equal(store.getRemoteTarget(), 'TARGET');

    assert.equal(store.getTargetDatabase(), '');
    store.updateFormField('targetDatabase', 'db');
    assert.equal(store.getTargetDatabase(), 'db');

    assert.equal(store.getReplicationType(), Constants.REPLICATION_TYPE.ONE_TIME);
    store.updateFormField('replicationType', Constants.REPLICATION_TYPE.CONTINUOUS);
    assert.equal(store.getReplicationType(), Constants.REPLICATION_TYPE.CONTINUOUS);

    assert.equal(store.getReplicationDocName(), '');
    store.updateFormField('replicationDocName', 'doc-name');
    assert.equal(store.getReplicationDocName(), 'doc-name');

    assert.equal(store.getReplicationSource(), '');
    store.updateFormField('replicationSource', 'rsource');
    assert.equal(store.getReplicationSource(), 'rsource');

    assert.equal(store.getReplicationTarget(), '');
    store.updateFormField('replicationTarget', 'rtarget');
    assert.equal(store.getReplicationTarget(), 'rtarget');

    assert.equal(store.getSourceDatabase(), '');
    store.updateFormField('sourceDatabase', 'source-db');
    assert.equal(store.getSourceDatabase(), 'source-db');
  });

});
