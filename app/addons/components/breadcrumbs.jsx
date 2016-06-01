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

import app from "../../app";
import FauxtonAPI from "../../core/api";
import React from "react";
import ReactDOM from "react-dom";

import Components from './react-components.react';
import ComponentStore from "./stores";


const {ToggleHeaderButton} = Components;

const store = ComponentStore.breadCrumbStore;

class BreadcrumbsController extends React.Component {

  constructor (props) {
    super(props);

    this.state = this.getStoreState();
  }

  getStoreState () {

    return {
      crumbs: store.getBreadCrumbs()
    };
  }

  componentDidMount () {
    store.on('change', this.onChange, this);
  }

  componentWillUnmount () {
    store.off('change', this.onChange);
  }

  onChange () {
    this.setState(this.getStoreState());
  }

  render () {
    if (!this.state.crumbs.length) {
      return null;
    }

    return (
      <Breadcrumbs crumbs={this.state.crumbs} />
    );
  }
};


const Breadcrumbs = ({crumbs}) => {

  const childs = getChildren(crumbs);

  return (
    <div className="component-breadcrumb">
      {childs}
    </div>
  );

};

const CrumbElement = ({children}) => {
  return <div className="component-breadcrumb-element">{children}</div>;
};

function getChildren (crumbs) {

  return crumbs.map((c, i) => {
    if (c.type === 'back') {
      return (
        <div key={i}>
          <ToggleHeaderButton
            containerClasses="header-control-box control-toggle-backlink"
            toggleCallback={() => { FauxtonAPI.navigate(c.link, {redirect: true}); }}
            fonticon="fonticon fonticon-left-open"
            innerClasses="" />
        </div>
      );
    }

    if (c.link) {
      return <CrumbElement key={i}><a href={c.link}>{c.name}</a></CrumbElement>;
    }

    return <CrumbElement key={i}>{c.name}</CrumbElement>;
  });
}


export default {
  BreadcrumbsController: BreadcrumbsController,
  Breadcrumbs: Breadcrumbs,
  render: function (el, opts) {
    ReactDOM.render(<BreadcrumbsController {...opts} />, el);
  },
  remove: function (el) {
    ReactDOM.unmountComponentAtNode(el);
  },

};
