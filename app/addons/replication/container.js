import { connect } from 'react-redux';
import ReplicationController from './controller';

import {
  isLoading,
  isActivityLoading,
  getDatabases,
  isAuthenticated,
  getReplicationSource,
  getlocalSource,
  isLocalSourceKnown,
  getRemoteSource,
  getReplicationTarget,
  getlocalTarget,
  isLocalTargetKnown,
  getRemoteTarget,
  isPasswordModalVisible,
  isConflictModalVisible,
  getReplicationType,
  getReplicationDocName,
  getSubmittedNoChange,
  getFilteredReplicationStatus,
  getStatusFilter,
  getReplicateFilter,
  getAllDocsSelected,
  someDocsSelected,
  getUsername,
  getPassword,
  getActivitySort,
  getTabSection,
  getCheckingAPI,
  supportNewApi,
  isReplicateInfoLoading,
  getAllReplicateSelected,
  getReplicateInfo,
  someReplicateSelected
} from './reducers';

const mapStateToProps = ({replication}, ownProps) => {
  return {
    loading: isLoading(replication),
    activityLoading: isActivityLoading(replication),
    databases: getDatabases(replication),
    authenticated: isAuthenticated(replication),

    // source fields
    replicationSource: getReplicationSource(replication),
    localSource: getlocalSource(replication),
    localSourceKnown: isLocalSourceKnown(replication),
    remoteSource: getRemoteSource(replication),

    // target fields
    replicationTarget: getReplicationTarget(replication),
    localTarget: getlocalTarget(replication),
    localTargetKnown: isLocalTargetKnown(replication),
    remoteTarget: getRemoteTarget(replication),

    // other
    passwordModalVisible: isPasswordModalVisible(replication),
    showConflictModal: isConflictModalVisible(replication),
    replicationType: getReplicationType(replication),
    replicationDocName: getReplicationDocName(replication),
    submittedNoChange: getSubmittedNoChange(replication),
    statusDocs: getFilteredReplicationStatus(replication),
    statusFilter: getStatusFilter(replication),
    replicateFilter: getReplicateFilter(replication),
    allDocsSelected: getAllDocsSelected(replication),
    someDocsSelected:  someDocsSelected(replication),
    username: getUsername(replication),
    password: getPassword(replication),
    activitySort: getActivitySort(replication),
    tabSection: getTabSection(replication),
    checkingApi: getCheckingAPI(replication),
    supportNewApi: supportNewApi(replication),
    replicateLoading: isReplicateInfoLoading(replication),
    replicateInfo: getReplicateInfo(replication),
    allReplicateSelected: getAllReplicateSelected(replication),
    someReplicateSelected: someReplicateSelected(replication)
  };
};


export default connect(mapStateToProps, null)(ReplicationController);
