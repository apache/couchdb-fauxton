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

import React from 'react';
import app from '../../../app';
import Helpers from '../helpers';
import ActionTypes from './actiontypes';

const initialState = {
  designDocs: new Backbone.Collection(),
  designDocList: [],
  selected: {
    navItem: 'all-docs',
    designDocName: '',
    designDocSection: '', // 'metadata' / name of index group ("Views", etc.)
    indexName: ''
  },
  loading: true,
  toggledSections: {},

  deleteIndexModalVisible: false,
  deleteIndexModalDesignDocName: '',
  deleteIndexModalText: '',
  deleteIndexModalIndexName: '',
  deleteIndexModalOnSubmit: () => {},

  cloneIndexModalVisible: false,
  cloneIndexDesignDocProp: '',
  cloneIndexModalTitle: '',
  cloneIndexModalSelectedDesignDoc: '',
  cloneIndexModalNewDesignDocName: '',
  cloneIndexModalNewDesignDocPartitioned: true,
  cloneIndexModalNewIndexName: '',
  cloneIndexModalSourceIndexName: '',
  cloneIndexModalSourceDesignDocName: '',
  cloneIndexModalIndexLabel: '',
  cloneIndexModalOnSubmit: () => {}
};

function setNewOptions(state, options) {
  const newState = {
    ...state,
    database: options.database,
    designDocs: options.designDocs,
    designDocList: getDesignDocList(options.designDocs),
    loading: false,
  };
  // this can be expanded in future as we need. Right now it can only set a top-level nav item ('all docs',
  // 'permissions' etc.) and not a nested page
  if (options.selectedNavItem) {
    newState.selected = {
      navItem: options.selectedNavItem,
      designDocName: '',
      designDocSection: '',
      indexName: ''
    };
  }

  return newState;
}

function toggleContent(state, designDoc, indexGroup) {
  // used to toggle both design docs, and any index groups within them
  const newState = {
    ...state
  };

  if (!state.toggledSections[designDoc]) {
    newState.toggledSections[designDoc] = {
      visible: true,
      indexGroups: {}
    };
    return newState;
  }

  if (indexGroup) {
    const expanded = state.toggledSections[designDoc].indexGroups[indexGroup];

    if (_.isUndefined(expanded)) {
      newState.toggledSections[designDoc].indexGroups[indexGroup] = true;
    } else {
      newState.toggledSections[designDoc].indexGroups[indexGroup] = !expanded;
    }
    return newState;
  }

  newState.toggledSections[designDoc].visible = !state.toggledSections[designDoc].visible;

  return newState;
}

function expandSelectedItem(state, {selectedNavItem}) {
  const newState = {
    ...state
  };

  if (selectedNavItem.designDocName) {
    if (!_.has(state.toggledSections, selectedNavItem.designDocName)) {
      newState.toggledSections[selectedNavItem.designDocName] = {
        visible: true,
        indexGroups: {}
      };
    }
    newState.toggledSections[selectedNavItem.designDocName].visible = true;

    if (selectedNavItem.designDocSection) {
      newState.toggledSections[selectedNavItem.designDocName].indexGroups[selectedNavItem.designDocSection] = true;
    }
  }
  return newState;
}

function getDesignDocList (designDocs) {
  if (!designDocs) {
    return [];
  }
  let docs = designDocs.toJSON();
  docs = _.filter(docs, (doc) => {
    if (_.has(doc.doc, 'language')) {
      return doc.doc.language !== 'query';
    }
    return true;
  });

  const ddocsList = docs.map((doc) => {
    doc.safeId = app.utils.safeURLName(doc._id.replace(/^_design\//, ''));
    return _.extend(doc, doc.doc);
  });
  return ddocsList;
}

export function getDesignDocPartitioned(state, isDbPartitioned) {
  const designDoc = state.designDocs.find(ddoc => {
    return state.cloneIndexModalSelectedDesignDoc == ddoc.id;
  });
  if (designDoc) {
    return Helpers.isDDocPartitioned(designDoc.get('doc'), isDbPartitioned);
  }
  return false;
}

export const getDatabase = (state) => {
  if (state.loading) {
    return {};
  }
  return state.database;
};

export default function sidebar(state = initialState, action) {
  const { options } = action;
  switch (action.type) {

    case ActionTypes.SIDEBAR_EXPAND_SELECTED_ITEM:
      return expandSelectedItem(state, options);

    case ActionTypes.SIDEBAR_NEW_OPTIONS:
      return setNewOptions(state, options);

    case ActionTypes.SIDEBAR_TOGGLE_CONTENT:
      return toggleContent(state, action.designDoc, action.indexGroup);

    case ActionTypes.SIDEBAR_FETCHING:
      return {
        ...state,
        loading: true
      };

    case ActionTypes.SIDEBAR_SHOW_DELETE_INDEX_MODAL:
      return {
        ...state,
        deleteIndexModalIndexName: options.indexName,
        deleteIndexModalDesignDocName: options.designDocName,
        deleteIndexModalVisible: true,
        deleteIndexModalText: (
          <div>
            Are you sure you want to delete the <code>{options.indexName}</code> {options.indexLabel}?
          </div>
        ),
        deleteIndexModalOnSubmit: options.onDelete
      };


    case ActionTypes.SIDEBAR_HIDE_DELETE_INDEX_MODAL:
      return {
        ...state,
        deleteIndexModalVisible: false
      };

    case ActionTypes.SIDEBAR_SHOW_CLONE_INDEX_MODAL:
      return {
        ...state,
        cloneIndexModalIndexLabel: options.indexLabel,
        cloneIndexModalTitle: options.cloneIndexModalTitle,
        cloneIndexModalSourceIndexName: options.sourceIndexName,
        cloneIndexModalSourceDesignDocName: options.sourceDesignDocName,
        cloneIndexModalSelectedDesignDoc: '_design/' + options.sourceDesignDocName,
        cloneIndexDesignDocProp: '',
        cloneIndexModalVisible: true,
        cloneIndexModalOnSubmit: options.onSubmit
      };

    case ActionTypes.SIDEBAR_HIDE_CLONE_INDEX_MODAL:
      return {
        ...state,
        cloneIndexModalVisible: false
      };

    case ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_CHANGE:
      return {
        ...state,
        cloneIndexModalSelectedDesignDoc: options.value
      };

    case ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_NEW_NAME_UPDATED:
      return {
        ...state,
        cloneIndexModalNewDesignDocName: options.value
      };

    case ActionTypes.SIDEBAR_CLONE_MODAL_DESIGN_DOC_NEW_PARTITIONED_UPDATED:
      return {
        ...state,
        cloneIndexModalNewDesignDocPartitioned: options.value
      };

    case ActionTypes.SIDEBAR_CLONE_MODAL_UPDATE_INDEX_NAME:
      return {
        ...state,
        cloneIndexModalNewIndexName: options.value
      };

    case ActionTypes.SIDEBAR_UPDATED_DESIGN_DOCS:
      return {
        ...state,
        designDocs: options.designDocs,
        designDocList: getDesignDocList(options.designDocs),
        loading: false
      };

    default:
      return state;
  }
}
