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
import React from "react";
import IndexFields from "./IndexFields";
import ReactComponents from '../../../components/react-components';

function ReasonValue({reason, onClick}) {
  const _onClick = (ev) => {
		  ev.preventDefault();
		  onClick();
  };
  return <a className='explainReason' href="#" data-bypass="true" onClick={_onClick}>{formatReason(reason)}</a>;
}

export default function IndexPanel ({index, isWinner, reason,  covering, onReasonClick, extraInfo}) {
  const columnClass = 'col-md-12 col-lg-3 mb-4 mb-lg-0';
  const tags = [
    index.partitioned ? 'partitioned' : 'global',
  ];
  if (covering) {
    tags.push('covering');
  }
  const tagExplanations = {
    'partitioned': 'Index queries over a single data partition',
    'global': 'Index queries over all data within database',
    'covering': 'Query is covered by this index'
  };

  return (
    <div className='row explain-index-panel'>
      <div className={columnClass}>
        <strong>{index.type}</strong>: {index.name}
        <br/>
        {index.ddoc ? (<><span className="index-ddoc-name">{index.ddoc}</span><br/></>) : null}
      </div>
      <div className={columnClass}>
        <ReactComponents.BadgeList elements={tags} tagExplanations={tagExplanations} removeBadge={() => {}} />
      </div>
      <div className={columnClass}>
        <IndexFields fields={index.def.fields} isTextIndex={index.type === 'text'}/>
      </div>
      {isWinner ? <div className={columnClass}>{extraInfo ? extraInfo : ' '}</div> :
        <div className={columnClass}>
          {reason ? <ReasonValue reason={reason} onClick={onReasonClick} /> : <span>reason not available</span>}
        </div>}
    </div>
  );
}

function formatReason(reason) {
  if (typeof reason === 'string') {
    return reason;
  } else if (reason && reason.length > 0) {
    return reason.join(', ');
  }
  return 'n/a';
}

IndexPanel.propTypes = {
  index: PropTypes.object.isRequired,
  onReasonClick: PropTypes.func.isRequired,
  reason: PropTypes.string,
  covering: PropTypes.bool,
  isWinner: PropTypes.bool, // 'true' if this is the winning index from the explain response
  extraInfo: PropTypes.element, // extra info to display in the last column
};
