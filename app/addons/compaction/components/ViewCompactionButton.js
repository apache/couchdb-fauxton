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

export class ViewCompactionButton extends React.Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }
  onClick(e) {
    e.preventDefault();
    this.props.compactView(this.props.database, this.props.designDoc);
  }

  render() {
    const {isCompactingView} = this.props;
    let btnMsg = 'Compact View';

    if (isCompactingView) {
      btnMsg = 'Compacting View';
    }

    return (
      <button disabled={isCompactingView}
        className="btn btn-info pull-right"
        onClick={this.onClick}>{btnMsg}</button>
    );
  }

}
