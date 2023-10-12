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

import PropTypes from 'prop-types';
import React, { Component } from "react";
import { Button, ButtonGroup, Tooltip, OverlayTrigger } from 'react-bootstrap';
import IndexPanel from "./IndexPanel";
import ExplainReasonsLegendModal from './ExplainReasonsLegendModal';


export default class ExplainPage extends Component {
  componentDidMount () {
    prettyPrint();
  }

  componentDidUpdate () {
    prettyPrint();
  }

  state = {
    viewFormat: 'parsed',
    isReasonsModalVisible: false,
  };

  onViewFormatChange = (viewFormat) => {
    this.setState({ viewFormat });
  };

  hideReasonsModal = () => {
    this.setState({isReasonsModalVisible: false});
  };

  showReasonsModal = () => {
    this.setState({isReasonsModalVisible: true});
  };

  // Sort candidates indexes to show list JSON indexes not chosen first, then unusable
  // JSON indexes, then all others (text, partial, etc)
  sortCandidateIndexes_OldFormat (candidates) {
    const notChosenJsonIndexes = [];
    const notUsableJsonIndexes = [];
    const otherIndexes = [];
    candidates.forEach((c) => {
      if (c.index.type === 'json') {
        if (c.reason && c.reason.includes('not_chosen')) {
          notChosenJsonIndexes.push(c);
        } else {
          notUsableJsonIndexes.push(c);
        }
      } else {
        otherIndexes.push(c);
      }
    });
    notChosenJsonIndexes.sort((a, b) => {
      if (a.ranking === undefined) {
        return 1;
      }
      if (b.score === undefined) {
        return -1;
      }
      return a.score - b.score;
    });
    return notChosenJsonIndexes.concat(notUsableJsonIndexes).concat(otherIndexes);
  }

  sortCandidatesByRanking(a, b) {
    if (a.ranking === undefined) {
      return 1;
    }
    if (b.ranking === undefined) {
      return -1;
    }
    const diff = a.ranking - b.ranking;
    if (diff === 0) {
      return a.index.name.localeCompare(b.index.name);
    }
    return diff;
  }

  pickUsableIndexes(candidates) {
    return candidates.filter(c => {
      return c.index.type === 'json' && c.usable;
    }).sort(this.sortCandidatesByRanking);
  }

  pickNotUsableIndexes(candidates) {
    return candidates.filter(c => {
      return c.index.type !== 'json' || !c.usable;
    }).sort(this.sortCandidatesByRanking);
  }

  toggleButtons() {
    return (
      <div className="row mb-4">
        <div className="col">
          <ButtonGroup aria-label='Explain format selector' >
            <Button type="button"
              id="explain-parsed-view"
              active={this.state.viewFormat === 'parsed'}
              onClick={() => {this.onViewFormatChange('parsed');}}
              variant="cf-secondary">Parsed</Button>
            <Button type="button"
              id="explain-json-view"
              active={this.state.viewFormat === 'json'}
              onClick={() => {this.onViewFormatChange('json');}}
              variant="cf-secondary">JSON</Button>
          </ButtonGroup>
        </div>
      </div>);
  }

  rawJsonResponse () {
    return (
      <div className="explain-json-response">
        <span className="explain-plan-section-title">JSON Response</span>
        <pre className="prettyprint">{JSON.stringify(this.props.explainPlan, null, ' ')}</pre>
      </div>
    );
  }

  isKeyRangeUnbounded(mrargs) {
    if (mrargs) {
      const { start_key, end_key } = mrargs;

      // When an index is sorted descending,
      // start_key and end_key are reversed.
      // This detects a maximum index scan range (between null/[] and "<MAX>")
      // by concatenatings the start/end keys,
      // removing any null/empty elements,
      // and testing that we have a single element "<MAX>" left.
      const max_range = [start_key, end_key].flat().filter(n => n);
      return max_range.length === 1 && max_range[0] === "<MAX>";
    }
    return false;
  }

  parsedContent () {
    const {index, covered, mrargs} = this.props.explainPlan;
    if (!index) {
      return "Invalid explain plan";
    }

    let extraInfo = this.isKeyRangeUnbounded(mrargs) ?
      <span className='index-extra-info'><span className='fonticon-attention-circled'></span>Full index scan detected. Query time will degrade as documents are added to the index.</span> : null;


    // Matching index
    let matchingIndex = <IndexPanel index={index} isWinner={true} covering={covered} onReasonClick={this.showReasonsModal} extraInfo={extraInfo}/>;

    // Candidates
    const {index_candidates} = this.props.explainPlan;

    //only show suitable/unsuitable indexes if index_candidates is defined
    let usableIndexPanelHeader = null;
    let notUsableIndexPanelHeader = null;
    if (index_candidates) {
      usableIndexPanelHeader = <span className="explain-plan-section-title">
        Suitable Indexes<InfoIcon tooltip_content={"Other suitable indexes that were not chosen"}/>
      </span>;
      notUsableIndexPanelHeader = <span className="explain-plan-section-title">
        Unsuitable Indexes<InfoIcon tooltip_content={"Indexes that do not match the given query"}/>
      </span>;
    }

    let usableIndexPanelList = null;
    let notUsableIndexPanelList = null;
    if (index_candidates && index_candidates.length > 0) {
      const sortedCandidates = this.pickUsableIndexes(index_candidates);
      usableIndexPanelList = sortedCandidates.map((candidate) => {
        const { index, reason, covering } = candidate;
        return <IndexPanel key={`${index.ddoc}"-"${index.name}`} isWinner={false} onReasonClick={this.showReasonsModal}
          index={index} reason={reason} covering={covering}/>;
      });

      const sortedNotUsable = this.pickNotUsableIndexes(index_candidates);
      notUsableIndexPanelList = sortedNotUsable.map((candidate) => {
        const { index, reason, covering } = candidate;
        return <IndexPanel key={`${index.ddoc}"-"${index.name}`} isWinner={false} onReasonClick={this.showReasonsModal}
          index={index} reason={reason} covering={covering}/>;
      });
    }

    if ((usableIndexPanelList && usableIndexPanelList.length === 0) || (index_candidates && !usableIndexPanelList)) {
      usableIndexPanelList = <div className='explain-index-panel'>
        No other suitable indexes found.
      </div>;
    }
    if ((notUsableIndexPanelList && notUsableIndexPanelList.length === 0) || (index_candidates && !notUsableIndexPanelList)) {
      notUsableIndexPanelList = <div className='explain-index-panel'>
        No other indexes found.
      </div>;
    }

    return (
      <>
        <span className="explain-plan-section-title">
          Selected Index<InfoIcon tooltip_content={"The index used when running the query"}/>
        </span>
        {matchingIndex}
        <br/>
        {usableIndexPanelHeader}
        {usableIndexPanelList}
        <br/>
        {notUsableIndexPanelHeader}
        {notUsableIndexPanelList}
      </>
    );
  }

  render () {
    return (
      <div id="explain-plan-wrapper">
        <ExplainReasonsLegendModal isVisible={this.state.isReasonsModalVisible} onHide={this.hideReasonsModal}/>
        {this.toggleButtons()}
        {this.state.viewFormat === 'parsed' ? this.parsedContent() : null}
        {this.state.viewFormat === 'json' ? this.rawJsonResponse() : null}
      </div>
    );
  }
}

ExplainPage.propTypes = {
  explainPlan: PropTypes.object.isRequired
};

const InfoIcon = ({tooltip_content}) => {
  const tooltip = <Tooltip id="graveyard-tooltip">{tooltip_content}</Tooltip>;
  return (
    <OverlayTrigger placement="top" overlay={tooltip}>
      <i className="fonticon fonticon-info-circled"></i>
    </OverlayTrigger>
  );
};
