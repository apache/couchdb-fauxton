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

import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import { ReplicationFooter } from '../components/replication-footer';

describe('Replication Footer', () =>{
  it('no replications to display', () => {
    const footer = mount(<ReplicationFooter
      statusDocs={[]}
      pageLimit={5}
      setPageLimit={() => {}}
    />);

    expect(footer.find('.current-replications').text()).toBe('Showing 0 replications.');
  });

  it('display max # of replications', () => {
    const footer = mount(<ReplicationFooter
      statusDocs={[1, 2, 3, 4, 5]}
      pageLimit={5}
      setPageLimit={() => {}}
    />);

    expect(footer.find('.current-replications').text()).toBe('Showing replications 1 - 5');
  });

  it('display replications with less than max #', () => {
    const footer = mount(<ReplicationFooter
      statusDocs={[1, 2, 3, 4, 5, 6, 7, 8]}
      pageLimit={10}
      setPageLimit={() => {}}
    />);

    expect(footer.find('.current-replications').text()).toBe('Showing replications 1 - 8');
  });

  it('change max value with dropdown', () => {
    const spy = sinon.spy();
    const footer = mount(<ReplicationFooter
      statusDocs={[1, 2, 3, 4, 5, 6, 7, 8]}
      pageLimit={5}
      setPageLimit={spy}
    />);

    expect(footer.find('.current-replications').text()).toBe('Showing replications 1 - 5');
    footer.find('#select-per-page').simulate('change', {
      target: {value: 10}
    });
    sinon.assert.calledOnce(spy);
  });
});
