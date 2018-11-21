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

const noop = () => {};

describe('DeleteDatabaseModal', function () {

  it('submitting is disabled when initially rendered', function () {
    const modal = mount(
      <ReactComponents.DeleteDatabaseModal
        showHide={noop}
        modalProps={{isSystemDatabase: false, showDeleteModal: true, dbId: 'fooo'}} />
    );

    expect(modal.find('button.delete').first().prop('disabled')).toBe(true);
  });

  it('submitting is disabled when garbage entered', function () {
    const modal = mount(
      <ReactComponents.DeleteDatabaseModal
        showHide={noop}
        modalProps={{isSystemDatabase: false, showDeleteModal: true, dbId: 'fooo'}} />
    );

    const input = modal.find('input');

    input.simulate('change', {target: {value: 'Hello, world'}});
    expect(modal.find('button.delete').prop('disabled')).toBe(true);
  });

  it('submitting is enabled when same db name entered', function () {
    const modal = mount(
      <ReactComponents.DeleteDatabaseModal
        showHide={noop}
        modalProps={{isSystemDatabase: false, showDeleteModal: true, dbId: 'fooo'}} />
    );

    var input = modal.find('.modal').find('input');

    input.simulate('change', {target: {value: 'fooo'}});
    expect(modal.find('button.delete').prop('disabled')).toBeFalsy();
  });


});
