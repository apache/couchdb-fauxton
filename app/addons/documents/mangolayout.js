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

import React, { Component } from 'react';
import app from "../../app";
import ReactPagination from "./pagination/pagination";
import {Breadcrumbs} from '../components/header-breadcrumbs';
import {NotificationCenterButton} from '../fauxton/notifications/notifications';
import {ApiBarWrapper} from '../components/layouts';
import MangoComponents from "./mango/mango.components";
import IndexResultsComponents from "./index-results/index-results.components";
import Stores from "./mango/mango.stores";
import FauxtonAPI from "../../core/api";

const mangoStore = Stores.mangoStore;

export const RightHeader = ({docURL, endpoint}) => {
  return (
    <div className="right-header-wrapper flex-layout flex-row flex-body">
      <div id="right-header" className="flex-body">
      </div>
      <ApiBarWrapper docURL={docURL} endpoint={endpoint} />
      <div id='notification-center-btn'>
        <NotificationCenterButton />
      </div>
    </div>
  );
};

export const MangoFooter = () => {
  return (
    <div id="footer">
        <ReactPagination.Footer />
    </div>
  );
};

export const MangoHeader = ({crumbs, docURL, endpoint}) => {
  return (
    <div className="header-wrapper flex-layout flex-row">
      <div className='flex-body faux__breadcrumbs-mango-header'>
        <Breadcrumbs crumbs={crumbs}/>
      </div>
      <RightHeader
        docURL={docURL}
        endpoint={endpoint}
      />
    </div>
  );
};

MangoHeader.defaultProps = {
  crumbs: []
};

export const MangoContent = ({edit, designDocs, explainPlan}) => {
  const leftContent = edit ? <MangoComponents.MangoIndexEditorController
      description={app.i18n.en_US['mango-descripton-index-editor']}
    /> : <MangoComponents.MangoQueryEditorController
      description={app.i18n.en_US['mango-descripton']}
      editorTitle={app.i18n.en_US['mango-title-editor']}
      additionalIndexesText={app.i18n.en_US['mango-additional-indexes-heading']}
    />;

  let resultsPage = <IndexResultsComponents.List designDocs={designDocs} />;
  let mangoFooter = <MangoFooter />;

  if (explainPlan) {
    resultsPage = <MangoComponents.ExplainPage explainPlan={explainPlan} />;
    mangoFooter = null;
  }

  return (
    <div id="two-pane-content" className="flex-layout flex-row flex-body">
      <div id="left-content" className="flex-body">
          {leftContent}
      </div>
      <div id="right-content" className="flex-body flex-layout flex-col">
        <div id="dashboard-lower-content" className="flex-body">
          {resultsPage}
        </div>
        {mangoFooter}
      </div>
    </div>
  );
};

export class MangoLayout extends Component {
  constructor (props) {
    super(props);
    this.state = this.getStoreState();
  };

  getStoreState () {
    return {
      explainPlan: mangoStore.getExplainPlan()
    };
  };

  componentDidMount () {
    mangoStore.on('change', this.onChange, this);
  };

  componentWillUnmount () {
    mangoStore.off('change', this.onChange, this);
  };

  onChange () {
    this.setState(this.getStoreState());
  };

  render () {
    const {database, edit, docURL, crumbs, designDocs} = this.props;
    let endpoint = this.props.endpoint;

    if (this.state.explainPlan) {
      endpoint = FauxtonAPI.urls('mango', 'explain-apiurl', database);
    }

    return (
      <div id="dashboard" className="two-pane flex-layout flex-col">
        <MangoHeader
          docURL={docURL}
          endpoint={endpoint}
          crumbs={crumbs}
        />
      <MangoContent
        edit={edit}
        designDocs={designDocs}
        explainPlan={this.state.explainPlan} />
      </div>
    );
  }
};
