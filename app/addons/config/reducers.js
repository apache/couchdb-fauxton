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

import ActionTypes from './actiontypes';

const initialState = {
  sections: {},
  loading: true,
  editSectionName: null,
  editOptionName: null,
  saving: false
};

function saveOption(state, { sectionName, optionName, value }) {
  const newSections = {
    ...state.sections
  };

  if (!newSections[sectionName]) {
    newSections[sectionName] = {};
  }

  newSections[sectionName][optionName] = value || true;
  return newSections;
}

function deleteOption(state, { sectionName, optionName }) {
  const newSections = {
    ...state.sections
  };

  if (newSections[sectionName]) {
    // copy object
    newSections[sectionName] = {...newSections[sectionName]};
    delete newSections[sectionName][optionName];

    if (Object.keys(newSections[sectionName]).length == 0) {
      delete newSections[sectionName];
    }
  }
  return newSections;
}

export function options(state) {
  const sections = Object.keys(state.sections).map(sectionName => {
    return {
      sectionName,
      options: mapSection(state, sectionName)
    };
  });
  const sortedSections = sections.sort((a, b) => {
    if (a.sectionName < b.sectionName) return -1;
    else if (a.sectionName > b.sectionName) return 1;
    return 0;
  });
  // flatten the list of options
  return sortedSections.map(s => s.options).reduce((acc, options) => {
    return acc.concat(options);
  }, []);
}

function mapSection(state, sectionName) {
  const section = state.sections[sectionName];
  const options = Object.keys(section).map(optionName => {
    return {
      editing: isEditing(state, sectionName, optionName),
      sectionName,
      optionName,
      value: section[optionName]
    };
  });
  const sortedOptions = options.sort((a, b) => {
    if (a.optionName < b.optionName) return -1;
    else if (a.optionName > b.optionName) return 1;
    return 0;
  });
  if (sortedOptions.length > 0) {
    sortedOptions[0].header = true;
  }
  return sortedOptions;
}

function isEditing(state, sn, on) {
  return sn === state.editSectionName && on === state.editOptionName;
}

export default function config(state = initialState, action) {
  const { options } = action;

  switch (action.type) {
    case ActionTypes.EDIT_CONFIG:
      return {
        ...state,
        sections: options.sections,
        loading: false,
        editOptionName: null,
        editSectionName: null
      };

    case ActionTypes.EDIT_OPTION:
      return {
        ...state,
        editSectionName: options.sectionName,
        editOptionName: options.optionName
      };

    case ActionTypes.LOADING_CONFIG:
      return {
        ...state,
        loading: true
      };

    case ActionTypes.CANCEL_EDIT:
      return {
        ...state,
        editOptionName: null,
        editSectionName: null
      };

    case ActionTypes.SAVING_OPTION:
      return {
        ...state,
        saving: true
      };

    case ActionTypes.OPTION_SAVE_SUCCESS:
      return {
        ...state,
        editOptionName: null,
        editSectionName: null,
        sections: saveOption(state, options),
        saving: false
      };

    case ActionTypes.OPTION_SAVE_FAILURE:
      return {
        ...state,
        saving: false
      };

    case ActionTypes.OPTION_ADD_SUCCESS:
      return {
        ...state,
        sections: saveOption(state, options),
        saving: false
      };

    case ActionTypes.OPTION_ADD_FAILURE:
      return {
        ...state,
        saving: false
      };

    case ActionTypes.OPTION_DELETE_SUCCESS:
      return {
        ...state,
        sections: deleteOption(state, options)
      };

    default:
      return state;
  }
}
