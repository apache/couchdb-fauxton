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
import Actions from "../actions";
import Stores from "../stores";
import utils from "../../../../test/mocha/testUtils";
import React from "react";
import ReactDOM from "react-dom";
import {ApiBarController} from '../components/apibar';
import {mount} from 'enzyme';

const assert = utils.assert;
const componentStore = Stores.componentStore;


describe('ApiBarController', () => {
  afterEach(() => {
    componentStore.reset();
  });

  it('Doesn\'t show up when explicitly set to visible false', () => {
    const el = mount(<ApiBarController />);
    Actions.updateAPIBar({
      buttonVisible: false,
      endpoint: 'http://link.example.com',
      docURL: 'http://link.example.com',
      contentVisible: false
    });
    assert.equal(el.find('.control-toggle-api-url').length, 0);
  });

  it('Shows up when set to visible', () => {
    const el = mount(<ApiBarController />);
    Actions.updateAPIBar({
      buttonVisible: true,
      endpoint: 'http://link.example.com',
      docURL: 'http://link.example.com',
      contentVisible: false
    });
    assert.equal(el.find('.control-toggle-api-url').length, 1);
  });

  it('Doesn\'t show up when set to visible BUT there\'s no endpoint defined', () => {
    const el = mount(<ApiBarController />);
    Actions.updateAPIBar({
      buttonVisible: true,
      endpoint: '',
      docURL: 'http://link.example.com',
      contentVisible: false
    });
    assert.equal(el.find('.control-toggle-api-url').length, 0);
  });

  it('Confirm hide/show actions update component', () => {
    const el = mount(<ApiBarController />);

    Actions.updateAPIBar({
      buttonVisible: true,
      endpoint: 'http://rocko.example.com',
      docURL: 'http://link.example.com',
      contentVisible: false
    });

    Actions.showAPIBarButton();
    assert.equal(el.find('.control-toggle-api-url').length, 1, 'showAPIBarButton');

    Actions.hideAPIBarButton();
    assert.equal(el.find('.control-toggle-api-url').length, 0, 'hideAPIBarButton');
  });

});
