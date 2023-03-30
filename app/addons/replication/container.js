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
  selectReplicate,
  setPageLimit
} from './actions';

import {
  isLoading,
  isActivityLoading,
  getDatabases,
  getReplicationSource,
  getLocalSource,
  isLocalSourceKnown,
  getRemoteSource,
  getReplicationTarget,
  getLocalTarget,
  isLocalTargetKnown,
  getRemoteTarget,
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
  someReplicateSelected,
  getPageLimit
} from './reducers';

const mapStateToProps = ({replication, databases}, ownProps) => {
  return {
    allowNewPartitionedLocalDbs: databases.partitionedDatabasesAvailable,

    routeLocalSource: ownProps.routeLocalSource,
    replicationId: ownProps.replicationId,
    tabSection: ownProps.section,
    loading: isLoading(replication),
    activityLoading: isActivityLoading(replication),
    databases: getDatabases(replication),

    // source fields
    replicationSource: getReplicationSource(replication),
    localSource: getLocalSource(replication),
    localSourceKnown: isLocalSourceKnown(replication),
    remoteSource: getRemoteSource(replication),
    sourceAuthType: replication.sourceAuthType,
    sourceAuth: replication.sourceAuth,

    // target fields
    replicationTarget: getReplicationTarget(replication),
    localTarget: getLocalTarget(replication),
    localTargetKnown: isLocalTargetKnown(replication),
    remoteTarget: getRemoteTarget(replication),
    targetAuthType: replication.targetAuthType,
    targetAuth: replication.targetAuth,
    targetDatabasePartitioned: replication.targetDatabasePartitioned,

    // other
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
    someReplicateSelected: someReplicateSelected(replication),
    pageLimit: getPageLimit(replication)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    checkForNewApi: () => dispatch(checkForNewApi()),
    updateFormField: (fieldName) => (value) => {
      dispatch(updateFormField(fieldName, value));
    },
    clearReplicationForm: () => dispatch(clearReplicationForm()),
    initReplicator: (localSource) => dispatch(initReplicator(localSource)),
    getReplicationActivity: (pageLimit) => dispatch(getReplicationActivity(pageLimit)),
    getReplicateActivity: () => dispatch(getReplicateActivity()),
    getReplicationStateFrom: (id) => dispatch(getReplicationStateFrom(id)),
    getDatabasesList: () => dispatch(getDatabasesList()),
    replicate: (params, pageLimit) => dispatch(replicate(params, pageLimit)),
    showConflictModal: () => dispatch(showConflictModal()),
    hideConflictModal: () => dispatch(hideConflictModal()),
    filterReplicate: (filter) => dispatch(filterReplicate(filter)),
    filterDocs: (filter) => dispatch(filterDocs(filter)),
    selectDoc: (doc) => dispatch(selectDoc(doc)),
    deleteDocs: (docs) => dispatch(deleteDocs(docs, ownProps.pageLimit)),
    selectAllDocs: () => dispatch(selectAllDocs()),
    changeActivitySort: (sort) => dispatch(changeActivitySort(sort)),
    selectAllReplicates: () => dispatch(selectAllReplicates()),
    deleteReplicates: (replicates) => dispatch(deleteReplicates(replicates)),
    selectReplicate: (replicate) => dispatch(selectReplicate(replicate)),
    setPageLimit: (limit) => dispatch(setPageLimit(limit))
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(ReplicationController);
