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
import {mount} from "enzyme";
import sinon from "sinon";
import React from "react";

describe("Polling", () => {
  describe('Counters', () => {

    it('resetPollCounter calls cb after set time', done => {
      let called = false;
      resetPollCounter(100, () => {
        called = true;
        expect(called).toBeTruthy();
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
        expect(called).toBeFalsy();
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
      const wrapper = mount(<Polling
        startValue={10}
        min={1}
        max={20}
        stepSize={1}
        onPoll={() => {}}
      />);

      const props = wrapper.find('.faux__polling-info-slider').at(0).props();
      expect(props.defaultValue).toEqual(10);
      expect(props.step).toEqual(1);
      expect(props.min).toEqual(1);
      expect(props.max).toEqual(21);
    });

    it('turns polling off if value is max', () => {
      const wrapper = mount(<Polling
        startValue={10}
        min={1}
        max={20}
        stepSize={1}
        onPoll={() => {}}
      />);

      const handler = wrapper.find('.rc-slider-handle').at(0);
      wrapper.simulate('focus');
      // Simulate key END to move handle to the max value
      handler.simulate('keyDown', { keyCode: 35 });
      const isOff = wrapper.find('.faux__polling-info-value--off').text();
      expect(isOff.toLowerCase()).toEqual("off");
    });

    it('turns polling off if value is max', (done) => {
      let pollCalled = false;
      const onPoll = () => {
        pollCalled = true;
        expect(pollCalled).toBeTruthy();
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
