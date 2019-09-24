import { connect } from 'react-redux';
import SearchIndexEditor from './SearchIndexEditor';
import Actions from '../actions';
import { getSaveDesignDoc, getSelectedDesignDocPartitioned } from '../reducers';

const mapStateToProps = ({ search, databases }, ownProps) => {
  const isSelectedDDocPartitioned = getSelectedDesignDocPartitioned(search, databases.isDbPartitioned);
  return {
    isCreatingIndex: ownProps.isCreatingIndex,
    isLoading: search.loading,
    database: search.database,
    designDocs: search.designDocs,
    searchIndexFunction: search.searchIndexFunction,
    ddocName: search.ddocName,
    ddocPartitioned: isSelectedDDocPartitioned,
    lastSavedDesignDocName: search.lastSavedDesignDocName,
    lastSavedSearchIndexName: search.lastSavedSearchIndexName,
    searchIndexName: search.searchIndexName,
    analyzerType: search.analyzerType,
    analyzerFields: search.analyzerFields,
    analyzerFieldsObj: search.analyzerFieldsObj,
    defaultMultipleAnalyzer: search.defaultMultipleAnalyzer,
    singleAnalyzer: search.singleAnalyzer,
    saveDoc: getSaveDesignDoc(search, databases.isDbPartitioned),
    newDesignDocName: search.newDesignDocName,
    newDesignDocPartitioned: search.newDesignDocPartitioned,
    isDbPartitioned: databases.isDbPartitioned,
    partitionKey: ownProps.partitionKey
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSearchIndexName: (name) => {
      dispatch(Actions.setSearchIndexName(name));
    },

    saveSearchIndex: (doc, info, navigateToUrl) => {
      Actions.saveSearchIndex(doc, info, navigateToUrl);
    },

    selectDesignDoc: (designDoc) => {
      dispatch(Actions.selectDesignDoc(designDoc));
    },

    updateNewDesignDocName: (designDocName) => {
      dispatch(Actions.updateNewDesignDocName(designDocName));
    },
    updateNewDesignDocPartitioned: (isPartitioned) => {
      dispatch(Actions.updateNewDesignDocPartitioned(isPartitioned));
    },
    setAnalyzerType: (type) => {
      dispatch(Actions.setAnalyzerType(type));
    },
    setSingleAnalyzer: (analyzer) => {
      dispatch(Actions.setSingleAnalyzer(analyzer));
    },
    setDefaultMultipleAnalyzer: (analyzer) => {
      dispatch(Actions.setDefaultMultipleAnalyzer(analyzer));
    },
    addAnalyzerRow: (analyzer) => {
      dispatch(Actions.addAnalyzerRow(analyzer));
    },
    removeAnalyzerRow: (rowIndex) => {
      dispatch(Actions.removeAnalyzerRow(rowIndex));
    },
    setAnalyzerRowFieldName: (params) => {
      dispatch(Actions.setAnalyzerRowFieldName(params));
    },
    setAnalyzer: (params) => {
      dispatch(Actions.setAnalyzer(params));
    }

  };
};

const SearchIndexEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchIndexEditor);

export default SearchIndexEditorContainer;
