import { connect } from 'react-redux';
import SearchForm from './SearchForm';
import Actions from '../actions';

const mapStateToProps = ({ search }) => {
  return {
    databaseName: search.databaseName,
    partitionKey: search.partitionKey,
    ddocName: search.ddocName,
    indexName: search.indexName,
    hasActiveQuery: search.hasActiveQuery,
    searchQuery: search.searchQuery,
    searchPerformed: search.searchPerformed,
    searchResults: search.searchResults,
    noResultsWarning: search.noResultsWarning
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    querySearch: (databaseName, partitionKey, ddocName, indexName, searchQuery) => {
      Actions.querySearch(databaseName, partitionKey, ddocName, indexName, searchQuery);
    },

    setSearchQuery: (query) => {
      dispatch(Actions.setSearchQuery(query));
    }
  };
};

const SearchFormContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchForm);

export default SearchFormContainer;
