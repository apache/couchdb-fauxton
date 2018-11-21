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
import Views from "../components";
import React from "react";
import {mount} from 'enzyme';
import sinon from "sinon";

describe('Pagination', () => {

  it('renders 20-wise pages per default', () => {
    const pageEl = mount(
      <Views.Pagination page={3} total={55} urlPrefix="?prefix=" urlSuffix="&suffix=88" />
    );

    const lis = pageEl.find('li');
    expect(1 + 3 + 1).toBe(lis.length);
    expect(lis.first().hasClass("disabled")).toBeFalsy();
    expect(lis.at(1).hasClass("class")).toBeFalsy();
    expect(lis.at(2).hasClass("class")).toBeFalsy();
    expect(lis.at(3).hasClass("active")).toBeTruthy();
    expect(lis.at(4).hasClass("disabled")).toBeTruthy();
    expect("2").toBe(lis.at(2).text());
    expect("?prefix=2&suffix=88").toBe(lis.at(2).find("a").prop("href"));
  });

  it("can overwrite collection size", () => {
    const pageEl = mount(
      <Views.Pagination perPage={10} page={3} total={55} urlPrefix="?prefix=" urlSuffix="&suffix=88" />
    );

    const lis = pageEl.find('li');
    expect(1 + 6 + 1).toBe(lis.length);
  });

  it("handles large collections properly - beginning", () => {
    const pageEl = mount(
      <Views.Pagination page={3} total={600} />,
    );
    const lis = pageEl.find('li');
    expect(1 + 10 + 1).toBe(lis.length);
    expect(lis.at(3).hasClass("active")).toBeTruthy();
    expect("3").toBe(lis.at(3).text());
    expect("7").toBe(lis.at(7).text());
    expect("10").toBe(lis.at(10).text());
  });

  it("handles large collections properly - middle", () => {
    const pageEl = mount(
      <Views.Pagination page={10} total={600} />
    );

    const lis = pageEl.find('li');
    expect(1 + 10 + 1).toBe(lis.length);
    expect(lis.at(6).hasClass("active")).toBeTruthy();
    expect("7").toBe(lis.at(3).text());
    expect("11").toBe(lis.at(7).text());
    expect("14").toBe(lis.at(10).text());
  });

  it("handles large collections properly - end", () => {
    const pageEl = mount(
      <Views.Pagination page={29} total={600} />
    );

    const lis = pageEl.find('li');
    expect(1 + 10 + 1).toBe(lis.length);
    expect(lis.at(9).hasClass("active")).toBeTruthy();
    expect("23").toBe(lis.at(3).text());
    expect("27").toBe(lis.at(7).text());
    expect("30").toBe(lis.at(10).text());
  });

  it('limits the number of total pages when customized', () => {
    var maxNavPages = 15;
    const pageEl = mount(
      <Views.Pagination page={1} total={1000} maxNavPages={maxNavPages} />
    );
    const lis = pageEl.find('li');
    expect(1 + maxNavPages + 1).toBe(lis.length);
  });

  it('calls callback method when supplied', () => {
    var spy = sinon.spy();
    const pageEl = mount(
      <Views.Pagination page={1} total={100} onClick={spy} />
    );
    var links = pageEl.find('a');

    links.at(3).simulate('click');

    // confirm it gets called
    expect(spy.calledOnce).toBeTruthy();

    // confirm it's called with the pagination number (3)
    expect(spy.calledWith(3)).toBeTruthy();
  });

  it('calls callback method with correct values for prev and next', () => {
    var spy = sinon.spy();

    var currentPage = 5;
    const pageEl = mount(
      <Views.Pagination page={currentPage} total={200} onClick={spy} />
    );
    var links = pageEl.find("a");

    links.first().simulate('click');
    expect(spy.calledWith(currentPage - 1)).toBeTruthy();

    links.at(11).simulate('click');
    expect(spy.calledWith(currentPage + 1)).toBeTruthy();
  });

});
