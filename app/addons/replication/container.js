import { connect } from 'react-redux';
import ReplicationController from './controller';

import {
  checkForNewApi,
  updateFormField,
  clearReplicationForm,
  initReplicator,
  getReplicationStateFrom,
  getReplicateActivity,
  getReplicationActivity,
  getDatabasesList,
  showPasswordModal,
  hidePasswordModal,
  showConflictModal,
  hideConflictModal,
  replicate,
  filterReplicate,
  filterDocs,
  selectDoc,
  deleteDocs,
  selectAllDocs,
  changeActivitySort,
  deleteReplicates,
  selectAllReplicates,
  selectReplicate
} from './actions';

import {
  isLoading,
  isActivityLoading,
  getDatabases,
  isAuthenticated,
  getReplicationSource,
  getLocalSource,
  isLocalSourceKnown,
  getRemoteSource,
  getReplicationTarget,
  getLocalTarget,
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
  getSomeDocsSelected,
  getUsername,
  getPassword,
  getActivitySort,
  getCheckingApi,
  supportNewApi,
  isReplicateInfoLoading,
  getAllReplicateSelected,
  getReplicateInfo,
  someReplicateSelected
} from './reducers';

const mapStateToProps = ({replication}, ownProps) => {
  return {
    routeLocalSource: ownProps.routeLocalSource,
    replicationId: ownProps.replicationId,
    tabSection: ownProps.section,
    loading: isLoading(replication),
    activityLoading: isActivityLoading(replication),
    databases: getDatabases(replication),
    authenticated: isAuthenticated(replication),

    // source fields
    replicationSource: getReplicationSource(replication),
    localSource: getLocalSource(replication),
    localSourceKnown: isLocalSourceKnown(replication),
    remoteSource: getRemoteSource(replication),

    // target fields
    replicationTarget: getReplicationTarget(replication),
    localTarget: getLocalTarget(replication),
    localTargetKnown: isLocalTargetKnown(replication),
    remoteTarget: getRemoteTarget(replication),

    // other
    passwordModalVisible: isPasswordModalVisible(replication),
    isConflictModalVisible: isConflictModalVisible(replication),
    replicationType: getReplicationType(replication),
    replicationDocName: getReplicationDocName(replication),
    submittedNoChange: getSubmittedNoChange(replication),
    statusDocs: getFilteredReplicationStatus(replication),
    statusFilter: getStatusFilter(replication),
    replicateFilter: getReplicateFilter(replication),
    allDocsSelected: getAllDocsSelected(replication),
    someDocsSelected:  getSomeDocsSelected(replication),
    username: getUsername(replication),
    password: getPassword(replication),
    activitySort: getActivitySort(replication),
    checkingApi: getCheckingApi(replication),
    supportNewApi: supportNewApi(replication),
    replicateLoading: isReplicateInfoLoading(replication),
    replicateInfo: getReplicateInfo(replication),
    allReplicateSelected: getAllReplicateSelected(replication),
    someReplicateSelected: someReplicateSelected(replication)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    checkForNewApi: () => dispatch(checkForNewApi()),
    updateFormField: (fieldName) => (value) => {
      dispatch(updateFormField(fieldName, value));
    },
    clearReplicationForm: () => dispatch(clearReplicationForm()),
    initReplicator: (localSource) => dispatch(initReplicator(localSource)),
    getReplicationActivity: () => dispatch(getReplicationActivity()),
    getReplicateActivity: () => dispatch(getReplicateActivity()),
    getReplicationStateFrom: (id) => dispatch(getReplicationStateFrom(id)),
    getDatabasesList: () => dispatch(getDatabasesList()),
    showPasswordModal: () => dispatch(showPasswordModal()),
    hidePasswordModal: () => dispatch(hidePasswordModal()),
    replicate: (params) => dispatch(replicate(params)),
    showConflictModal: () => dispatch(showConflictModal()),
    hideConflictModal: () => dispatch(hideConflictModal()),
    filterReplicate: (filter) => dispatch(filterReplicate(filter)),
    filterDocs: (filter) => dispatch(filterDocs(filter)),
    selectDoc: (doc) => dispatch(selectDoc(doc)),
    deleteDocs: (docs) => dispatch(deleteDocs(docs)),
    selectAllDocs: () => dispatch(selectAllDocs()),
    changeActivitySort: (sort) => dispatch(changeActivitySort(sort)),
    selectAllReplicates: () => dispatch(selectAllReplicates()),
    deleteReplicates: (replicates) => dispatch(deleteReplicates(replicates)),
    selectReplicate: (replicate) => dispatch(selectReplicate(replicate))
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(ReplicationController);
