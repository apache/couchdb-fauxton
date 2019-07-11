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

import { connect } from 'react-redux';
import Controller from './layout';
import {
  init,
  setSearchTerm,
  sortByColumnHeader,
  switchTab,
  runPollingUpdate
} from './actions';
import {
  getTasks,
  getHeaderIsAscending,
  getSelectedRadio,
  getSortByHeader,
  getSearchTerm,
  getIsLoading
} from './reducers';

const mapStateToProps = ({activetasks}) => {
  return {
    tasks: getTasks(activetasks),
    headerIsAscending: getHeaderIsAscending(activetasks),
    selectedRadio: getSelectedRadio(activetasks),
    sortByHeader: getSortByHeader(activetasks),
    searchTerm: getSearchTerm(activetasks),
    isLoading: getIsLoading(activetasks)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    init: () => dispatch(init()),
    setSearchTerm: (term) => dispatch(setSearchTerm(term)),
    sortByColumnHeader: (column) => dispatch(sortByColumnHeader(column)),
    switchTab: (tab) => dispatch(switchTab(tab)),
    runPollingUpdate: () => dispatch(runPollingUpdate())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Controller);
