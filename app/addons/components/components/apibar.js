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

import React from "react";
import ReactDOM from "react-dom";

export const JSONLink = ({endpoint}) => {
  if (!endpoint) {
    return null;
  }

  return (
    <div className="faux__jsonlink">
      <a data-bypass={true} className="faux__jsonlink-link" href={endpoint} target="_blank" rel="noopener noreferrer">
        <span className="faux__jsonlink-link-brackets">{'{\u00a0}'}</span>
        <span className="faux__jsonlink-link-label">JSON</span>
      </a>
    </div>
  );
};

export const DocLink = ({docURL}) => {
  if (!docURL) {
    return null;
  }

  return (
    <div className="faux__doclink">
      <a data-bypass="true" href={docURL} target="_blank" rel="noopener noreferrer" className="faux__doclink-link">
        <i className="icon fonticon-bookmark"></i>
      </a>
    </div>
  );
};
