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
import { Popover, OverlayTrigger } from 'react-bootstrap';

const TOO_MANY_DOCS_SCANNED_WARNING = "The number of documents examined is high in proportion to the number of results returned. Consider adding an index to improve this.";

export default class ExecutionStats extends React.Component {
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
    seconds = seconds - (minutes * 60);

    return minutes + 'minute, ' + seconds + 'seconds';
  }

  getWarning(executionStats, warning) {
    if (!executionStats) { return warning; }

    // warn if many documents scanned in relation to results returned
    if (!warning && executionStats.results_returned) {
      const docsExamined = executionStats.total_docs_examined || executionStats.total_quorum_docs_examined;
      if (docsExamined / executionStats.results_returned > 10) {
        return TOO_MANY_DOCS_SCANNED_WARNING;
      }
    }

    return warning;
  }

  warningPopupComponent(warningText) {
    if (!!warningText) {
      return (<div className="warning">
        <i className="fonticon-attention-circled"></i> {warningText}
      </div>);
    }
  }

  executionStatsLine(title, value, alwaysShow = false, units = "") {
    const hasValue = value === 0 && !alwaysShow ? "false" : "true";
    return <div data-status={hasValue}>{title + ": "}<span className="value">{value.toLocaleString()} {units}</span></div>;
  }

  executionStatsPopupComponent(executionStats) {
    if (!executionStats) return null;
    return (
      <div className="execution-stats-popup-component">
        {/* keys examined always 0 so hide it for now */}
        {/* {this.executionStatsLine("keys examined", executionStats.total_keys_examined)} */}
        {this.executionStatsLine("documents examined", executionStats.total_docs_examined)}
        {this.executionStatsLine("documents examined (quorum)", executionStats.total_quorum_docs_examined)}
        {this.executionStatsLine("results returned", executionStats.results_returned, true)}
        {this.executionStatsLine("execution time", executionStats.execution_time_ms, false, "ms")}
      </div>
    );
  }

  popup(executionStats, warningText) {
    return (
      <Popover id="popover-execution-stats" title="Execution Statistics">
        <div className="execution-stats-popup">
          {this.executionStatsPopupComponent(executionStats)}
          {this.warningPopupComponent(warningText)}
        </div>
      </Popover>
    );
  }

  render() {
    const {
      executionStats,
      warning
    } = this.props;

    const warningText = this.getWarning(executionStats, warning);

    let warningComponent = null;
    if (!!warningText) {
      warningComponent = <i className="fonticon-attention-circled"></i>;
    }

    let executionStatsComponent = null;
    if (executionStats) {
      executionStatsComponent = (
        <span className="execution-stats-component">Executed in {this.humanizeDuration(executionStats.execution_time_ms)}</span>
      );
    } else if (!!warningText) {
      executionStatsComponent = (
        <span className="execution-stats-component">Warning</span>
      );
    }

    const popup = this.popup(executionStats, warningText);
    return (
        <OverlayTrigger trigger={['hover', 'focus', 'click']} placement="right" overlay={popup}>
          <span className="execution-stats">
            {warningComponent}
            {executionStatsComponent}
          </span>
        </OverlayTrigger>
    );
  }
};

ExecutionStats.propTypes = {
  executionStats: PropTypes.object,
  warning: PropTypes.string
};
