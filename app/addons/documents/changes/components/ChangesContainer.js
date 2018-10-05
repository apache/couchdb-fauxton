import { connect } from 'react-redux';
import ChangesScreen from './ChangesScreen';

const mapStateToProps = ({ changes }) => {
  return {
    changes: changes.changes,
    loaded: changes.isLoaded,
    databaseName: changes.databaseName,
    isShowingSubset: changes.showingSubset
  };
};

const ChangesContainer = connect(
  mapStateToProps
)(ChangesScreen);

export default ChangesContainer;
