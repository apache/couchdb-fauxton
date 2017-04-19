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

import React from 'react';
import app from '../../../app';
import FauxtonAPI from '../../../core/api';
import {ReplicationSource} from './source';
import {ReplicationTarget} from './target';
import {ReplicationOptions} from './options';
import {ReplicationSubmit} from './submit';
import AuthComponents from '../../auth/components';
import Constants from '../constants';
import {ConflictModal} from './modals';
import {isEmpty} from 'lodash';

const {PasswordModal} = AuthComponents;

export default class NewReplicationController extends React.Component {
  constructor (props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.clear = this.clear.bind(this);
    this.showPasswordModal = this.showPasswordModal.bind(this);
    this.runReplicationChecks = this.runReplicationChecks.bind(this);
  }

  clear (e) {
    e.preventDefault();
    this.props.clearReplicationForm();
  }

  showPasswordModal () {
    this.props.hideConflictModal();
    const { replicationSource, replicationTarget } = this.props;

    const hasLocalSourceOrTarget = (replicationSource === Constants.REPLICATION_SOURCE.LOCAL ||
      replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE ||
      replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE);

    // if the user is authenticated, or if NEITHER the source nor target are local, just submit. The password
    // modal isn't necessary or if couchdb is in admin party mode
    if (!hasLocalSourceOrTarget || this.props.authenticated || FauxtonAPI.session.isAdminParty()) {
      this.submit(this.props.username, this.props.password);
      return;
    }

    this.props.showPasswordModal();
  }

  checkReplicationDocID () {
    const {showConflictModal, replicationDocName, checkReplicationDocID} = this.props;
    checkReplicationDocID(replicationDocName).then(existingDoc => {
      if (existingDoc) {
        showConflictModal();
        return;
      }

      this.showPasswordModal();
    });
  }

  runReplicationChecks () {
    const {replicationDocName} = this.props;
    if (!this.validate()) {
      return;
    }
    if (replicationDocName) {
      this.checkReplicationDocID();
      return;
    }

    this.showPasswordModal();
  }

  validate () {
    const {
      remoteTarget,
      remoteSource,
      replicationTarget,
      localTarget,
      localSource,
      databases
    } = this.props;

    if (replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE && _.includes(databases, localTarget)) {
      FauxtonAPI.addNotification({
        msg: 'The <code>' + localTarget + '</code> database already exists locally. Please enter another database name.',
        type: 'error',
        escape: false,
        clear: true
      });
      return false;
    }
    if (replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE ||
        replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE) {
      let error = '';
      if (/\s/.test(localTarget)) {
        error = 'The target database may not contain any spaces.';
      } else if (/^_/.test(localTarget)) {
        error = 'The target database may not start with an underscore.';
      }

      if (error) {
        FauxtonAPI.addNotification({
          msg: error,
          type: 'error',
          escape: false,
          clear: true
        });
        return false;
      }
    }

    //check that source and target are not the same. They can trigger a false positive if they are ""
    if ((remoteTarget === remoteSource && !isEmpty(remoteTarget))
      || (localSource === localTarget && !isEmpty(localSource))) {
        FauxtonAPI.addNotification({
          msg: 'Cannot replicate a database to itself',
          type: 'error',
          escape: false,
          clear: true
        });

        return false;
    }

    return true;
  }

  submit (username, password) {
    const {
      replicationTarget,
      replicationSource,
      replicationType,
      replicationDocName,
      remoteTarget,
      remoteSource,
      localTarget,
      localSource
    } = this.props;

    let _rev;
    if (replicationDocName) {
      const doc = this.props.docs.find(doc => doc._id === replicationDocName);
      if (doc) {
        _rev = doc._rev;
      }
    }

    this.props.replicate({
      replicationTarget,
      replicationSource,
      replicationType,
      replicationDocName,
      username,
      password,
      localTarget,
      localSource,
      remoteTarget,
      remoteSource,
      _rev
    });
  }

  confirmButtonEnabled () {
    const {
      remoteSource,
      localSourceKnown,
      replicationSource,
      replicationTarget,
      localTargetKnown,
      localTarget,
      submittedNoChange,
    } = this.props;

    if (submittedNoChange) {
      return false;
    }

    if (!replicationSource || !replicationTarget) {
      return false;
    }

    if (replicationSource === Constants.REPLICATION_SOURCE.LOCAL && !localSourceKnown) {
      return false;
    }
    if (replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE && !localTargetKnown) {
      return false;
    }

    if (replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE && !localTarget) {
      return false;
    }

    if (replicationSource === Constants.REPLICATION_SOURCE.REMOTE && remoteSource === "") {
      return false;
    }

    return true;
  }

  render () {
   const {
     replicationSource,
      replicationTarget,
      replicationType,
      replicationDocName,
      passwordModalVisible,
      conflictModalVisible,
      databases,
      localSource,
      remoteSource,
      remoteTarget,
      localTarget,
      updateFormField,
      clearReplicationForm
    } = this.props;

    return (
      <div>
        <ReplicationSource
          replicationSource={replicationSource}
          localSource={localSource}
          databases={databases}
          remoteSource={remoteSource}
          onSourceSelect={updateFormField('replicationSource')}
          onRemoteSourceChange={updateFormField('remoteSource')}
          onLocalSourceChange={updateFormField('localSource')}
        />
        <hr className="replication__seperator" size="1"/>
        <ReplicationTarget
          replicationTarget={replicationTarget}
          onTargetChange={updateFormField('replicationTarget')}
          databases={databases}
          localTarget={localTarget}
          remoteTarget={remoteTarget}
          onRemoteTargetChange={updateFormField('remoteTarget')}
          onLocalTargetChange={updateFormField('localTarget')}
        />
        <hr className="replication__seperator" size="1"/>
        <ReplicationOptions
          replicationType={replicationType}
          replicationDocName={replicationDocName}
          onDocChange={updateFormField('replicationDocName')}
          onTypeChange={updateFormField('replicationType')}
        />
        <ReplicationSubmit
          disabled={!this.confirmButtonEnabled()}
          onClick={this.runReplicationChecks}
          onClear={clearReplicationForm}
        />
        <PasswordModal
          visible={passwordModalVisible}
          modalMessage={<p>{app.i18n.en_US['replication-password-modal-text']}</p>}
          submitBtnLabel="Start Replication"
          headerTitle={app.i18n.en_US['replication-password-modal-header']}
          onSuccess={this.submit} />
        <ConflictModal
          visible={conflictModalVisible}
          onClick={this.showPasswordModal}
          onClose={this.props.hideConflictModal}
          docId={replicationDocName}
          />
      </div>
    );
  }
}
