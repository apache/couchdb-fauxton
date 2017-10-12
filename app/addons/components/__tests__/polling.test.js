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
import {Polling, clearPollCounter, resetPollCounter} from "../components/polling";
import utils from "../../../../test/mocha/testUtils";
import {shallow, mount} from "enzyme";
import sinon from "sinon";
import React from "react";
import ReactDOM from "react-dom";

const assert = utils.assert;

describe("Polling", () => {
  describe('Counters', () => {

    it('resetPollCounter calls cb after set time', done => {
      let called = false;
      resetPollCounter(100, () => {
        called = true;
        assert.ok(called);
        done();
      });
    });

    it('clearRefreshCounter stops counter', done => {
      let called = false;
      resetPollCounter(100, () => {
        called = true;
      });

      clearPollCounter();
      setTimeout(() => {
        assert.notOk(called);
        done();
      }, 200);
    });
  });

  describe('Component', () => {
    var clock;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      clock.restore();
    });

    it('renders slider with correct info', () => {
      const wrapper = shallow(<Polling
        startValue={10}
        min={1}
        max={20}
        stepSize={1}
        onPoll={() => {}}
                            />);

      const props = wrapper.find('input').props();

      assert.deepEqual(props.value, 10);
      assert.deepEqual(props.step, 1);
      assert.deepEqual(props.min, 1);
      assert.deepEqual(props.max, 21);
    });

    it('turns polling off if value is max', () => {
      const wrapper = mount(<Polling
        startValue={10}
        min={1}
        max={20}
        stepSize={1}
        onPoll={() => {}}
                            />);

      wrapper.find('input').simulate('change', {target: {value: 21}});
      const isOff = wrapper.find('.faux__polling-info-value--off').text();
      assert.deepEqual(isOff.toLowerCase(), "off");
    });

    it('turns polling off if value is max', (done) => {
      let pollCalled = false;
      const onPoll = () => {
        pollCalled = true;
        assert.ok(pollCalled);
        done();
      };
      mount(<Polling
        startValue={1}
        min={1}
        max={20}
        stepSize={1}
        onPoll={onPoll}
      />);

      clock.tick(1010);

    });
  });
});
