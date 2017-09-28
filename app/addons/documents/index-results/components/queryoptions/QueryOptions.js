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
import FauxtonAPI from '../../../../../core/api';
import GeneralComponents from '../../../../components/react-components';
import Constants from '../../../constants';
import MainFieldsView from './MainFieldsView';
import KeySearchFields from './KeySearchFields';
import AdditionalParams from './AdditionalParams';
import QueryButtons from './QueryButtons';

const { ToggleHeaderButton, TrayContents } = GeneralComponents;

export default class QueryOptions extends React.Component {
  constructor(props) {
    super(props);
    const {
      ddocsOnly,
      queryOptionsFilterOnlyDdocs
    } = props;

    if (ddocsOnly) {
      queryOptionsFilterOnlyDdocs();
    }
  }

  componentWillReceiveProps (nextProps) {
    const {
      ddocsOnly,
      queryOptionsFilterOnlyDdocs,
      resetState
    } = this.props;

    if (!ddocsOnly && nextProps.ddocsOnly) {
      resetState();
      queryOptionsFilterOnlyDdocs();
    } else if (ddocsOnly && !nextProps.ddocsOnly) {
      resetState();
    }
  }

  executeQuery (e) {
    if (e) { e.preventDefault(); }
    this.closeTray();

    const {
      queryOptionsExecute,
      queryOptionsParams,
      perPage,
      resetPagination,
      selectedLayout,
      changeLayout
    } = this.props;

    // reset pagination back to the beginning but hold on to the current perPage
    resetPagination(perPage);

    // We may have to change the layout based on include_docs.
    const isMetadata = selectedLayout === Constants.LAYOUT_ORIENTATION.METADATA;
    if (isMetadata && queryOptionsParams.include_docs) {
      changeLayout(Constants.LAYOUT_ORIENTATION.TABLE);
    } else if (!isMetadata && !queryOptionsParams.include_docs) {
      changeLayout(Constants.LAYOUT_ORIENTATION.METADATA);
    }

    // finally, run the query
    queryOptionsExecute(queryOptionsParams, perPage);
  }

  toggleTrayVisibility () {
    this.props.queryOptionsToggleVisibility(!this.props.contentVisible);
  }

  closeTray () {
    this.props.queryOptionsToggleVisibility(false);
  }

  getTray () {
    return (
      <TrayContents closeTray={this.closeTray.bind(this)} contentVisible={this.props.contentVisible}
        className="query-options"
        id="query-options-tray">

        <form onSubmit={this.executeQuery.bind(this)} className="js-view-query-update custom-inputs">
          <MainFieldsView
            includeDocs={this.props.includeDocs}
            toggleIncludeDocs={this.props.queryOptionsToggleIncludeDocs}
            showReduce={this.props.showReduce}
            reduce={this.props.reduce}
            toggleReduce={this.props.queryOptionsToggleReduce}
            groupLevel={this.props.groupLevel}
            updateGroupLevel={this.props.queryOptionsUpdateGroupLevel}
            docURL={FauxtonAPI.constants.DOC_URLS.GENERAL} />
          <KeySearchFields
            key={1}
            showByKeys={this.props.showByKeys}
            showBetweenKeys={this.props.showBetweenKeys}
            toggleByKeys={this.props.queryOptionsToggleByKeys}
            toggleBetweenKeys={this.props.queryOptionsToggleBetweenKeys}
            betweenKeys={this.props.betweenKeys}
            updateBetweenKeys={this.props.queryOptionsUpdateBetweenKeys}
            byKeys={this.props.byKeys}
            updateByKeys={this.props.queryOptionsUpdateByKeys} />
          <AdditionalParams
            descending={this.props.descending}
            toggleDescending={this.props.queryOptionsToggleDescending}
            skip={this.props.skip}
            updateSkip={this.props.queryOptionsUpdateSkip}
            updateLimit={this.props.queryOptionsUpdateLimit}
            limit={this.props.limit} />
          <QueryButtons onCancel={this.closeTray.bind(this)} />
        </form>
      </TrayContents>
    );
  }

  render () {
    return (
      <div id="header-query-options">
        <div id="query-options">
          <div>
            <ToggleHeaderButton
              toggleCallback={this.toggleTrayVisibility.bind(this)}
              containerClasses="header-control-box control-toggle-queryoptions"
              title="Query Options"
              fonticon="fonticon-gears"
              text="Options" />
              {this.getTray()}
          </div>
        </div>
      </div>
    );
  }
};

QueryOptions.propTypes = {
  contentVisible: React.PropTypes.bool.isRequired,
  queryOptionsFilterOnlyDdocs: React.PropTypes.func.isRequired,
  resetState: React.PropTypes.func.isRequired,
  queryOptionsExecute: React.PropTypes.func.isRequired,
  queryOptionsParams: React.PropTypes.object.isRequired,
  perPage: React.PropTypes.number.isRequired,
  resetPagination: React.PropTypes.func.isRequired,
  selectedLayout: React.PropTypes.string.isRequired,
  changeLayout: React.PropTypes.func.isRequired,
  queryOptionsToggleVisibility: React.PropTypes.func.isRequired
};
