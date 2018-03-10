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

import {connect} from 'react-redux';

import CompactionController from '../components/CompactionController';

import {isCleaningViews, isCompacting} from "../reducer";
import {cleanupViews, compactDatabase} from "../actions";

const mapStateToProps = ({compaction}, ownProps) => {
  return {
    isCompacting: isCompacting(compaction),
    isCleaningViews: isCleaningViews(compaction),
    database: ownProps.database
  };
};

const mapDispatchToProps = dispatch => {
  return {
    cleanupViews(databaseName) {
      dispatch(cleanupViews(databaseName));
    },
    compactDatabase(databaseName) {
      dispatch(compactDatabase(databaseName));
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompactionController);
