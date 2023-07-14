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
import PropTypes from 'prop-types';

export default class ExecutionStatsPanel extends React.Component {
  constructor (props) {
    super(props);
  }

  humanizeDuration(milliseconds) {
    if (milliseconds < 1000) {
      return Math.round(milliseconds) + ' ms';
    }
    let seconds = milliseconds / 1000;
    if (seconds < 60) {
      return Math.floor(seconds) + ' seconds';
    }
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds - (minutes * 60));

    const minuteText = minutes > 1 ? 'minutes' : 'minute';
    const secondsText = seconds > 1 ? 'seconds' : 'second';

    return [minutes, ' ', minuteText, ', ', seconds, ' ', secondsText].join('');
  }

  getWarning(warnings) {
    if (warnings) {
      const lines = warnings.split('\n').map((warnText, i) => {
        return <React.Fragment key={i}>{warnText}<br/></React.Fragment>;
      });
      return <span>{lines}</span>;
    }
  }

  warningPopupComponent(warningText) {
    if (warningText) {
      return (<div className="warning">
        <i className="fonticon-attention-circled"></i> {warningText}
      </div>);
    }
  }

  executionStatsLine(title, value, alwaysShow = false, units = "") {
    const hasValue = value === 0 && !alwaysShow ? "false" : "true";
    return <div data-status={hasValue}>{title + ": "}<span className="value">{value.toLocaleString()} {units}</span></div>;
  }

  executionStatsBody(executionStats) {

    let content = null;
    if (!executionStats) {
      content = (
        <div className='execution-stats-empty-body'>
          Run query to display execution statistics.
        </div>);
    } else {
      content = (
        <div className="execution-stats-body">
          {this.executionStatsLine("Executed at", new Date(executionStats.ts).toLocaleTimeString(), true)}
          {this.executionStatsLine("Execution time", this.humanizeDuration(executionStats.execution_time_ms), true)}
          {this.executionStatsLine("Results returned", executionStats.results_returned, true)}
          {this.executionStatsLine("Keys examined", executionStats.total_keys_examined)}
          {this.executionStatsLine("Documents examined", executionStats.total_docs_examined)}
          {this.executionStatsLine("Documents examined (quorum)", executionStats.total_quorum_docs_examined)}
        </div>);
    }
    return (<>
      <div className="execution-stats-header">Execution Statistics</div>
      {content}
    </>);
  }

  render() {
    const {
      executionStatsSupported,
      executionStats,
      warning
    } = this.props;

    const warningText = this.getWarning(warning);
    return (
      <>
        <div className="execution-stats">
          {this.warningPopupComponent(warningText)}
          {executionStatsSupported ? this.executionStatsBody(executionStats) : null}
        </div>
      </>
    );
  }
}

ExecutionStatsPanel.propTypes = {
  executionStats: PropTypes.object,
  warning: PropTypes.string,
  executionStatsSupported: PropTypes.bool
};
