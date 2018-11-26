// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import { connect } from 'react-redux';
import IndexEditor from './IndexEditor';
import Actions from '../actions';
import { getSaveDesignDoc, getDesignDocList, reduceSelectedOption, hasCustomReduce,
  getSelectedDesignDocPartitioned } from '../reducers';

const mapStateToProps = ({ indexEditor, databases }, ownProps) => {
  const isSelectedDDocPartitioned = getSelectedDesignDocPartitioned(indexEditor, databases.isDbPartitioned);
  return {
    database: indexEditor.database,
    isNewView: indexEditor.isNewView,
    viewName: indexEditor.viewName,
    designDocs: indexEditor.designDocs,
    designDocList: getDesignDocList(indexEditor),
    originalViewName: indexEditor.originalViewName,
    originalDesignDocName: indexEditor.originalDesignDocName,
    isNewDesignDoc: indexEditor.isNewDesignDoc,
    designDocId: indexEditor.designDocId,
    designDocPartitioned: isSelectedDDocPartitioned,
    newDesignDocName: indexEditor.newDesignDocName,
    newDesignDocPartitioned: indexEditor.newDesignDocPartitioned,
    saveDesignDoc: getSaveDesignDoc(indexEditor, databases.isDbPartitioned),
    map: indexEditor.view.map,
    isLoading: indexEditor.isLoading,
    reduce: indexEditor.view.reduce,
    reduceOptions: indexEditor.reduceOptions,
    reduceSelectedOption: reduceSelectedOption(indexEditor),
    hasCustomReduce: hasCustomReduce(indexEditor),
    hasReduce: !!indexEditor.view.reduce,
    isDbPartitioned: databases.isDbPartitioned,
    partitionKey: ownProps.partitionKey
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    saveView: (viewInfo, navigateToURL) => {
      dispatch(Actions.saveView(viewInfo, navigateToURL));
    },

    changeViewName: (name) => {
      dispatch(Actions.changeViewName(name));
    },

    updateMapCode: (code) => {
      dispatch(Actions.updateMapCode(code));
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

    updateReduceCode: (code) => {
      dispatch(Actions.updateReduceCode(code));
    },

    selectReduceChanged: (reduceOption) => {
      dispatch(Actions.selectReduceChanged(reduceOption));
    }
  };
};

const IndexEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(IndexEditor);

export default IndexEditorContainer;
