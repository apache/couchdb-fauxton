import { connect } from 'react-redux';
import ChangesTabContent from './ChangesTabContent';
import Actions from '../actions';

const mapStateToProps = ({ changes }) => {
  return {
    filters: changes.filters
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addFilter: (filter) => {
      dispatch(Actions.addFilter(filter));
    },

    removeFilter: (filter) => {
      dispatch(Actions.removeFilter(filter));
    }
  };
};

const ChangesTabContentContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangesTabContent);

export default ChangesTabContentContainer;
