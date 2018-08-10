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
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import * as jdp from "jsondiffpatch";
import "jsondiffpatch/dist/formatters-styles/html.css";

const RevisionDiffArea = ({ours, theirs}) => {
  if (!ours || !theirs) {
    return <div></div>;
  }

  const delta = jdp.diff(ours, theirs);
  const html = jdp.formatters.html.format(delta, ours);

  return (
    <div className="revision-diff-area">
      <div
        style={{marginTop: '30px'}}
        dangerouslySetInnerHTML={{__html: html}}
      >
      </div>
    </div>
  );
};
RevisionDiffArea.propTypes = {
  ours: PropTypes.object,
  theirs: PropTypes.object,
  currentRev: PropTypes.string
};

export default RevisionDiffArea;
