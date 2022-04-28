// Licensed under the Apache License, Version 2.0 (the 'License'); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import PropTypes from 'prop-types';
import React from 'react';
import Slider from 'rc-slider';

let pollIntervalId;

export const clearPollCounter = () => {
  if (pollIntervalId) {
    window.clearInterval(pollIntervalId);
  }
};

export const resetPollCounter = (time, cb) => {
  clearPollCounter();
  pollIntervalId = window.setInterval(cb, time);
};

const getCountdown = (secsString, units, max, min) => {
  const secs = parseInt(secsString, 10);
  if (secs === 0 || secs > max || secs < min) {
    return 'off';
  }

  if (secs < 60 && units === 'minute') {
    return `${secs} seconds`;
  }

  let displayValue = secs;
  if (units === 'minute') {
    displayValue = Math.floor(secs / 60);
  }
  return `${displayValue} ${displayValue === 1 ? units : `${units}s`}`;
};

export class Polling extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      value: this.props.startValue
    };
    this.updatePollingFreq = this.updatePollingFreq.bind(this);
  }

  componentDidMount () {
    this.setPollingCounter(this.state.value);
  }

  componentWillUnmount () {
    clearPollCounter();
  }

  setPollingCounter (value) {
    const {min, max, onPoll} = this.props;
    this.setState({value: value});

    if (value === 0 || value < min || value > max) {
      clearPollCounter();
      return;
    }

    resetPollCounter(value * 1000, () => onPoll());
  }

  updatePollingFreq (newValue) {
    this.setPollingCounter(parseInt(newValue, 10));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.startValue !== nextProps.startValue) {
      this.setPollingCounter(nextProps.startValue);
    }
  }

  render () {
    const {
      stepSize,
      min,
      max,
      valueUnits
    } = this.props;

    const {value} = this.state;

    const pollValue = getCountdown(value, valueUnits, max, min);
    const pollStyle = pollValue === 'off' ? 'faux__polling-info-value--off' : 'faux__polling-info-value--active';
    return (
      <div className='faux__polling'>
        <div className='faux__polling-info'>
          <span className='faux__polling-info-text'>Polling Interval</span>
          <span className={`faux__polling-info-value faux__polling-info-value ${pollStyle}`}>{pollValue}</span>
        </div>
        <Slider
          className="faux__polling-info-slider"
          min={min}
          max={max + stepSize}
          step={stepSize}
          defaultValue={value}
          onChange={this.updatePollingFreq}
        />
      </div>
    );
  }
}

Polling.defaultProps = {
  startValue: 0,
  min: 0,
  valueUnits: 'minute'
};

Polling.propTypes = {
  startValue: PropTypes.number,
  valueUnits: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number.isRequired,
  stepSize: PropTypes.number.isRequired,
  onPoll: PropTypes.func.isRequired,
};

export const RefreshBtn = ({refresh}) =>
  <div className="faux__refresh-btn">
    <a
      className="faux__refresh-link"
      href="#"
      data-bypass="true"
      onClick={e => {
        e.preventDefault();
        refresh();
      }}
    >
      <i className="faux__refresh-icon fonticon-arrows-cw"></i>
      Refresh
    </a>
  </div>;

RefreshBtn.propTypes = {
  refresh: PropTypes.func.isRequired
};
