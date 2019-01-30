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
import React from "react";
import {mount} from 'enzyme';
import sinon from "sinon";

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
    expect(el.find('.foo-children').length).toBeGreaterThan(0);
  });

  it('does not require child elements', () => {
    el = mount(
      <ReactComponents.Document docIdentifier="foo" docChecked={noop} />
    );
    expect(el.find('.doc-edit-symbol').length).toBe(0);
  });

  it('you can check it', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} checked={true} docIdentifier="foo" />
    );
    expect(el.find('input').prop('data-checked')).toBe(true);
  });

  it('you can uncheck it', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} docIdentifier="foo" />
    );
    expect(el.find('[data-checked="true"]').length).toBe(0);
  });

  it('it calls an onchange callback', () => {
    var spy = sinon.spy();

    el = mount(
      <ReactComponents.Document doc={{id: "foo"}} isDeletable={true} docChecked={spy} docIdentifier="foo" />
    );
    el.find('input[type="checkbox"]').first().simulate('change', {target: {value: 'Hello, world'}});
    expect(spy.calledOnce).toBeTruthy();
  });

  it('it calls an onclick callback', () => {
    var spy = sinon.spy();

    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} onClick={spy} docIdentifier="foo" />
    );
    el.find('.doc-item header').first().simulate('click');
    expect(spy.calledOnce).toBeTruthy();
  });

  it('can render without checkbox', () => {
    var spy = sinon.spy();

    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={false} onDoubleClick={spy} docIdentifier="foo" />
    );
    expect(el.find('input[type="checkbox"]').length).toBe(0);
    expect(el.find('.checkbox-dummy').length).toBeGreaterThan(0);
  });

  it('contains a doc-data element when there\'s doc content', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} checked={true} docIdentifier="foo" docContent='{ "content": true }' />
    );
    expect(el.find('.doc-data').length).toBe(1);
  });

  it('doesn\'t contain a doc-data element when there\'s no doc content', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} isDeletable={true} checked={true} docIdentifier="foo" docContent='' />
    );
    expect(el.find('.doc-data').length).toBe(0);
  });

  it('allows empty headers', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header={null} isDeletable={true} checked={true} docIdentifier="foo" docContent='' />,
    );
    expect(el.find('.header-doc-id').text()).toBe('');
  });

  it('allows supports headers with "', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent='' />
    );
    expect(el.find('.header-doc-id').text()).toBe('"foo"');
  });

  it('small docs should not be truncated', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent='{ "content": true }' />
    );
    expect(el.find('.doc-content-truncated').length).toBe(0);
  });

  it('large docs should get truncated', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent={docContent} />
    );
    expect(el.find('.doc-content-truncated').length).toBe(1);
  });

  it('custom truncate value', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent={docContent} maxRows={2000} />
    );
    expect(el.find('.doc-content-truncated').length).toBe(0);
  });

  it('disabling truncation', () => {
    el = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true} checked={true} docIdentifier="foo" docContent={docContent} truncate={false} />
    );
    expect(el.find('.doc-content-truncated').length).toBe(0);
  });

  it('shows icon only for docs with type MangoIndex', () => {
    const index = {
      type: "json",
      def: { fields: [{ foo: "asc" }] }
    };
    const content = JSON.stringify(index, null, '  ');
    const elMangoIndex = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true}
        checked={false} docIdentifier="foo" docContent={content}
        truncate={false} docType="MangoIndex"/>
    );
    expect(elMangoIndex.find('i.fonticon-document').exists()).toBe(true);

    const elRegularDoc = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true}
        checked={false} docIdentifier="foo" docContent={content}
        truncate={false} docType="view"/>
    );
    expect(elRegularDoc.find('i.fonticon-documents').exists()).toBe(false);
  });

  it('shows icon for partitioned mango index', () => {
    const index = {
      type: "json",
      partitioned: true,
      def: { fields: [{ foo: "asc" }] }
    };
    const content = JSON.stringify(index, null, '  ');
    const elMangoIndex = mount(
      <ReactComponents.Document docChecked={noop} header="foo" isDeletable={true}
        checked={false} docIdentifier="foo" docContent={content}
        truncate={false} docType="MangoIndex"/>
    );
    expect(elMangoIndex.find('i.fonticon-documents').exists()).toBe(true);
  });

});
