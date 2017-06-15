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
import { JSONLink, DocLink } from "../components/apibar";
import { mount } from "enzyme";
import React from "react";
import ReactDOM from "react-dom";

describe('JSONLink', () => {

  it('Should render with url', () => {
    const url = "http://couchdb.com/_all_dbs";
    const el = mount(<JSONLink endpoint={url}/>);

    expect(el.find('a').prop('href')).toEqual(url);
  });

});

describe('DocLink', () => {

  it('Should render with url', () => {
    const url = "http://couchdb.com/help/_all_dbs";
    const el = mount(<DocLink docURL={url}/>);

    expect(el.find('a').prop('href')).toEqual(url);
  });

});
