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
import React from "react";
import Helpers from "../helpers";
import FauxtonAPI from '../../../core/api';
import { Dropdown } from "react-bootstrap";

function getModififyDbLinks (dbName) {
  return Helpers.getModifyDatabaseLinks(dbName);
}

function getAllDatabaseModalLinks (dbName, partitionKey) {
  const dropdownMenuLinks = Helpers.getNewButtonLinks(dbName, partitionKey);
  return getModififyDbLinks(dbName).concat(dropdownMenuLinks);
}


function getDropdownItems (items) {
  return items.map((el, i) => {

    if (el.title && el.links) {
      const items = el.links.map((subel) => {
        return <Item key={subel.title} title={subel.title} url={subel.url} icon={subel.icon} onClick={subel.onClick}></Item>;
      });

      return ([
        <Dropdown.Header key={el.title}>{el.title}</Dropdown.Header>,
        items
      ]);
    }

    return <Item key={i} title={el.title} url={el.url} icon={el.icon} onClick={el.onClick}></Item>;
  });
}


const Item = ({title, url, icon, onClick}) => {
  let itemType = (url == null) ? 'button' : "a";
  return (
    <Dropdown.Item as={itemType} onClick={onClick} href={url}>
      <div className='py-1 ms-1'>
        <i className={"align-middle icon fonticon-fw " + icon}></i>
        <span className="ms-2 align-middle">
          {title}
        </span>
      </div>
    </Dropdown.Item>
  );
};

const HeaderDocsLeft = ({dbName, partitionKey}) => {
  const items = getAllDatabaseModalLinks(dbName, partitionKey);
  const dropdownItems = getDropdownItems(items);

  return (
    <div className="faux-header__doc-header-left">
      <button type="button" className="faux-header__doc-header-backlink" onClick={() => { FauxtonAPI.navigate('#/_all_dbs'); }}>
        <i className="faux-header__doc-header-backlink__icon fonticon fonticon-left-open" />
      </button>
      <div className="faux-header__doc-header-title flex-fill" title={dbName}>
        {dbName}
      </div>
      <Dropdown>
        <Dropdown.Toggle id="faux-header__doc-header-dropdown-toggle">
          <i className="fonticon-vertical-ellipsis"></i>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {dropdownItems}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

HeaderDocsLeft.propTypes = {
  dbName: PropTypes.string.isRequired,
  partitionKey: PropTypes.string
};

export default HeaderDocsLeft;
