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

import base64 from 'base-64';
import React from 'react';
import Helpers from '../../../helpers';
import {json} from '../../../core/ajax';
import FauxtonAPI from '../../../core/api';
import {ReplicationSource} from './source';
import {ReplicationTarget} from './target';
import {ReplicationOptions} from './options';
import {ReplicationSubmit} from './submit';
import {ReplicationAuth} from './auth-options';
import Constants from '../constants';
import {ConflictModal} from './modals';
import {isEmpty} from 'lodash';

export default class NewReplicationController extends React.Component {
  constructor (props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
    this.runReplicationChecks = this.runReplicationChecks.bind(this);
  }

  checkAuth () {
    this.props.hideConflictModal();
    const { replicationSource, replicationTarget,
      sourceAuthType, targetAuthType, sourceAuth, targetAuth } = this.props;

    const isLocalSource = replicationSource === Constants.REPLICATION_SOURCE.LOCAL;
    const isLocalTarget = replicationTarget === Constants.REPLICATION_TARGET.EXISTING_LOCAL_DATABASE ||
      replicationTarget === Constants.REPLICATION_TARGET.NEW_LOCAL_DATABASE;

    // Ask user to select an auth method for local source/target when one is not selected
    // and not on admin party
    if (!FauxtonAPI.session.isAdminParty()) {
      if (isLocalSource && sourceAuthType === Constants.REPLICATION_AUTH_METHOD.NO_AUTH) {
        FauxtonAPI.addNotification({
          msg: 'Missing credentials for local source database.',
          type: 'error',
          clear: true
        });
        return;
      }
      if (isLocalTarget && targetAuthType === Constants.REPLICATION_AUTH_METHOD.NO_AUTH) {
        FauxtonAPI.addNotification({
          msg: 'Missing credentials for local target database.',
          type: 'error',
          clear: true
        });
        return;
      }
    }

    this.checkLocalAccountCredentials(sourceAuthType, sourceAuth, 'source', isLocalSource).then(() => {
      this.checkLocalAccountCredentials(targetAuthType, targetAuth, 'target', isLocalTarget).then(() => {
        this.submit();
      }, () => {});
    }, () => {});
  }

  checkLocalAccountCredentials(authType, auth, label, isLocal) {
    // Skip check if it's a remote tb or not using BASIC auth
    if (authType !== Constants.REPLICATION_AUTH_METHOD.BASIC || !isLocal) {
      return FauxtonAPI.Promise.resolve(true);
    }

    if (!auth.username || !auth.password) {
      const err = `Missing ${label} credentials.`;
      FauxtonAPI.addNotification({
        msg: err,
        type: 'error',
        clear: true
      });
      return FauxtonAPI.Promise.reject(new Error(err));
    }

    return this.checkCredentials(auth.username, auth.password).then((resp) => {
      if (resp.error) {
        throw (resp);
      }
      return true;
    }).catch(err => {
      FauxtonAPI.addNotification({
        msg: `Your username or password for ${label} database is incorrect.`,
        type: 'error',
        clear: true
      });
      throw err;
    });
  }

  checkCredentials(username, password) {
    return json(Helpers.getServerUrl('/'), 'GET', {
      credentials: 'omit',
      headers: {
        'Authorization':'Basic ' + base64.encode(username + ':' + password)
      }
    });
  }

  checkReplicationDocID () {
    const {showConflictModal, replicationDocName, checkReplicationDocID} = this.props;
    checkReplicationDocID(replicationDocName).then(existingDoc => {
      if (existingDoc) {
        showConflictModal();
        return;
      }

      this.checkAuth();
    });
  }

  runReplicationChecks () {
    const {replicationDocName} = this.props;
    if (!this.checkSourceTargetDatabases()) {
      return;
    }
    if (replicationDocName) {
      this.checkReplicationDocID();
      return;
    }

    this.checkAuth();
  }

  checkSourceTargetDatabases () {
    const {
      remoteTarget,
      remoteSource,
      replicationSource,
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

    //check if remote source/target URL is valid
    const isRemoteSource = replicationSource === Constants.REPLICATION_SOURCE.REMOTE;
    if (isRemoteSource && !isEmpty(remoteSource)) {
      let errorMessage = '';
      try {
        const url = new URL(remoteSource);
        if (url.pathname.slice(1) === '') {
          errorMessage = 'Invalid source database URL. Database name is missing.';
        }
      } catch (err) {
        errorMessage = 'Invalid source database URL.';
      }
      if (errorMessage) {
        FauxtonAPI.addNotification({
          msg: errorMessage,
          type: 'error',
          escape: false,
          clear: true
        });
        return false;
      }
    }
    const isRemoteTarget = replicationTarget === Constants.REPLICATION_TARGET.NEW_REMOTE_DATABASE ||
      replicationTarget === Constants.REPLICATION_TARGET.EXISTING_REMOTE_DATABASE;
    if (isRemoteTarget && !isEmpty(remoteTarget)) {
      let errorMessage = '';
      try {
        const url = new URL(remoteTarget);
        if (url.pathname.slice(1) === '') {
          errorMessage = 'Invalid target database URL. Database name is missing.';
        }
      } catch (err) {
        errorMessage = 'Invalid target database URL.';
      }
      if (errorMessage) {
        FauxtonAPI.addNotification({
          msg: errorMessage,
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

  submit () {
    const {
      replicationTarget,
      replicationSource,
      replicationType,
      replicationDocName,
      remoteTarget,
      remoteSource,
      localTarget,
      localSource,
      sourceAuthType,
      sourceAuth,
      targetAuthType,
      targetAuth,
      targetDatabasePartitioned
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
      localTarget,
      localSource,
      remoteTarget,
      remoteSource,
      _rev,
      sourceAuthType,
      sourceAuth,
      targetAuthType,
      targetAuth,
      targetDatabasePartitioned
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
      conflictModalVisible,
      databases,
      localSource,
      remoteSource,
      remoteTarget,
      localTarget,
      targetDatabasePartitioned,
      allowNewPartitionedLocalDbs,
      updateFormField,
      clearReplicationForm,
      sourceAuthType,
      sourceAuth,
      targetAuthType,
      targetAuth
    } = this.props;

    return (
      <div style={ {paddingBottom: 20} }>
        <ReplicationSource
          replicationSource={replicationSource}
          localSource={localSource}
          databases={databases}
          remoteSource={remoteSource}
          onSourceSelect={updateFormField('replicationSource')}
          onRemoteSourceChange={updateFormField('remoteSource')}
          onLocalSourceChange={updateFormField('localSource')}
        />
        <ReplicationAuth
          credentials={sourceAuth}
          authType={sourceAuthType}
          onChangeAuthType={updateFormField('sourceAuthType')}
          onChangeAuth={updateFormField('sourceAuth')}
          authId={'replication-source-auth'}
        />
        <hr className="replication__seperator" size="1"/>
        <ReplicationTarget
          replicationTarget={replicationTarget}
          onTargetChange={updateFormField('replicationTarget')}
          databases={databases}
          localTarget={localTarget}
          remoteTarget={remoteTarget}
          allowNewPartitionedLocalDbs={allowNewPartitionedLocalDbs}
          targetDatabasePartitioned={targetDatabasePartitioned}
          onRemoteTargetChange={updateFormField('remoteTarget')}
          onLocalTargetChange={updateFormField('localTarget')}
          onTargetDatabasePartitionedChange={updateFormField('targetDatabasePartitioned')}
        />
        <ReplicationAuth
          credentials={targetAuth}
          authType={targetAuthType}
          onChangeAuthType={updateFormField('targetAuthType')}
          onChangeAuth={updateFormField('targetAuth')}
          authId={'replication-target-auth'}
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
        <ConflictModal
          visible={conflictModalVisible}
          onClick={this.checkAuth}
          onClose={this.props.hideConflictModal}
          docId={replicationDocName}
        />
      </div>
    );
  }
}
