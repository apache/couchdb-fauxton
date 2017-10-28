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
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import {mount} from 'enzyme';
import sinon from "sinon";
const assert = utils.assert;

describe('Pagination', () => {

  it('renders 20-wise pages per default', () => {
    const pageEl = mount(
      <Views.Pagination page={3} total={55} urlPrefix="?prefix=" urlSuffix="&suffix=88" />
    );

    const lis = pageEl.find('li');
    assert.equal(1 + 3 + 1, lis.length);
    assert.notOk(lis.first().hasClass("disabled"));
    assert.notOk(lis.at(1).hasClass("class"));
    assert.notOk(lis.at(2).hasClass("class"));
    assert.ok(lis.at(3).hasClass("active"));
    assert.ok(lis.at(4).hasClass("disabled"));
    assert.equal("2", lis.at(2).text());
    assert.equal("?prefix=2&suffix=88", lis.at(2).find("a").prop("href"));
  });

  it("can overwrite collection size", () => {
    const pageEl = mount(
      <Views.Pagination perPage={10} page={3} total={55} urlPrefix="?prefix=" urlSuffix="&suffix=88" />
    );

    const lis = pageEl.find('li');
    assert.equal(1 + 6 + 1, lis.length);
  });

  it("handles large collections properly - beginning", () => {
    const pageEl = mount(
      <Views.Pagination page={3} total={600} />,
    );
    const lis = pageEl.find('li');
    assert.equal(1 + 10 + 1, lis.length);
    assert.ok(lis.at(3).hasClass("active"));
    assert.equal("3", lis.at(3).text());
    assert.equal("7", lis.at(7).text());
    assert.equal("10", lis.at(10).text());
  });

  it("handles large collections properly - middle", () => {
    const pageEl = mount(
      <Views.Pagination page={10} total={600} />
    );

    const lis = pageEl.find('li');
    assert.equal(1 + 10 + 1, lis.length);
    assert.ok(lis.at(6).hasClass("active"));
    assert.equal("7", lis.at(3).text());
    assert.equal("11", lis.at(7).text());
    assert.equal("14", lis.at(10).text());
  });

  it("handles large collections properly - end", () => {
    const pageEl = mount(
      <Views.Pagination page={29} total={600} />
    );

    const lis = pageEl.find('li');
    assert.equal(1 + 10 + 1, lis.length);
    assert.ok(lis.at(9).hasClass("active"));
    assert.equal("23", lis.at(3).text());
    assert.equal("27", lis.at(7).text());
    assert.equal("30", lis.at(10).text());
  });

  it('limits the number of total pages when customized', () => {
    var maxNavPages = 15;
    const pageEl = mount(
      <Views.Pagination page={1} total={1000} maxNavPages={maxNavPages} />
    );
    const lis = pageEl.find('li');
    assert.equal(1 + maxNavPages + 1, lis.length);
  });

  it('calls callback method when supplied', () => {
    var spy = sinon.spy();
    const pageEl = mount(
      <Views.Pagination page={1} total={100} onClick={spy} />
    );
    var links = pageEl.find('a');

    links.at(3).simulate('click');

    // confirm it gets called
    assert.ok(spy.calledOnce);

    // confirm it's called with the pagination number (3)
    assert.ok(spy.calledWith(3));
  });

  it('calls callback method with correct values for prev and next', () => {
    var spy = sinon.spy();

    var currentPage = 5;
    const pageEl = mount(
      <Views.Pagination page={currentPage} total={200} onClick={spy} />
    );
    var links = pageEl.find("a");

    links.first().simulate('click');
    assert.ok(spy.calledWith(currentPage - 1));

    links.at(11).simulate('click');
    assert.ok(spy.calledWith(currentPage + 1));
  });

});
