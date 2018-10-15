import { connect } from 'react-redux';
import ChangesScreen from './ChangesScreen';
import Actions from '../actions';

const mapStateToProps = ({ changes }, ownProps) => {
  return {
    changes: changes.filteredChanges,
    loaded: changes.isLoaded,
    databaseName: ownProps.databaseName,
    isShowingSubset: changes.showingSubset
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadChanges: (databaseName) => {
      dispatch(Actions.loadChanges(databaseName));
    }
  };
};

const ChangesContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangesScreen);

export default ChangesContainer;
