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

import PropTypes from 'prop-types';

import React from 'react';
import ReactDOM from 'react-dom';

export const Breadcrumbs = ({crumbs}) => {

  return (
    <div className="faux-header__breadcrumbs">
      {getChildren(crumbs)}
    </div>
  );

};

Breadcrumbs.propTypes = {
  crumbs: PropTypes.array.isRequired
};


const CrumbElement = ({children}) => {
  return <div className="faux-header__breadcrumbs-element">{children}</div>;
};

const Divider = () => {
  return (
    <div className="fonticon-right-open faux-header__breadcrumbs-divider"></div>
  );
};

function getChildren (crumbs) {
  const amountDividers = crumbs.length - 1;

  return crumbs.map((c, i) => {

    let res = [<CrumbElement key={i}>{c.name}</CrumbElement>];

    if (c.link) {
      res = [
        <CrumbElement key={i}>
          <a className="faux-header__breadcrumbs-link" href={'#/' + c.link}>{c.name}</a>
        </CrumbElement>
      ];
    }

    if (!c.name) {
      return res;
    }

    if (i < amountDividers) {
      res.push(<Divider key={'divider_' + i}/>);
    }

    return res;
  });
}
