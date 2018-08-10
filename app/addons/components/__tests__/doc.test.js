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
import ReactComponents from "../react-components";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import {mount} from 'enzyme';
import sinon from "sinon";

const assert = utils.assert;

const noop = () => {};

describe('Document', () => {
  let el;

  const doc = {};
  _.times(1000, (n) => {
    doc['prop' + n] = n;
  });

  const docContent = JSON.stringify(doc, null, '  ');

  it('hosts child elements', () => {
    el = mount(
      <ReactComponents.Document docIdentifier="foo" docChecked={noop}>
        <div className="foo-children"></div>
      </ReactComponents.Document>
    );
    assert.ok(el.find('.foo-children').length);
  });

  it('does not require child elements', () => {
    el = mount(
      <ReactComponents.Document docIdentifier="foo" docChecked={noop} />
    );
    assert.notOk(el.find('.doc-edit-symbol').length);
  });

  it('you can check it', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} checked={true} docIdentifier="foo" />
    );
    assert.ok(el.find('input').prop('data-checked'));
  });

  it('you can uncheck it', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} docIdentifier="foo" />
    );
    assert.equal(el.find('[data-checked="true"]').length, 0);
  });

  it('it calls an onchange callback', () => {
    var spy = sinon.spy();

    el = mount(
      <ReactComponents.Document doc={{id: "foo"}} isDeletable={true} docChecked={spy} docIdentifier="foo" />
    );
    el.find('input[type="checkbox"]').first().simulate('change', {target: {value: 'Hello, world'}});
    assert.ok(spy.calledOnce);
  });

  it('it calls an onclick callback', () => {
    var spy = sinon.spy();

    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} onClick={spy} docIdentifier="foo" />
    );
    el.find('.doc-item').first().simulate('click');
    assert.ok(spy.calledOnce);
  });

  it('can render without checkbox', () => {
    var spy = sinon.spy();

    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={false} onDoubleClick={spy} docIdentifier="foo" />
    );
    assert.notOk(el.find('input[type="checkbox"]').length);
    assert.ok(el.find('.checkbox-dummy').length);
  });

  it('contains a doc-data element when there\'s doc content', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} checked={true} docIdentifier="foo" docContent='{ "content": true }' />
    );
    assert.equal(1, el.find('.doc-data').length);
  });

  it('doesn\'t contain a doc-data element when there\'s no doc content', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} checked={true} docIdentifier="foo" docContent='' />
    );
    assert.equal(0, el.find('.doc-data').length);
  });

  it('allows empty headers', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header={null} isDeletable={true} checked={true} docIdentifier="foo" docContent='' />,
    );
    assert.equal('', el.find('.header-doc-id').text());
  });

  it('allows supports headers with "', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent='' />
    );
    assert.equal('"foo"', el.find('.header-doc-id').text());
  });

  it('small docs should not be truncated', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent='{ "content": true }' />
    );
    assert.equal(el.find('.doc-content-truncated').length, 0);
  });

  it('large docs should get truncated', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent={docContent} />
    );
    assert.equal(el.find('.doc-content-truncated').length, 1);
  });

  it('custom truncate value', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent={docContent} maxRows={2000} />
    );
    assert.equal(el.find('.doc-content-truncated').length, 0);
  });

  it('disabling truncation', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent={docContent} truncate={false} />
    );
    assert.equal(el.find('.doc-content-truncated').length, 0);
  });

});
