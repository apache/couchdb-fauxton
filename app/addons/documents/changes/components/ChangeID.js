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
import FauxtonAPI from '../../../../core/api';

export default class ChangeID extends React.Component {
  render () {
    const { deleted, id, databaseName } = this.props;
    if (deleted) {
      return (
        <span className="js-doc-id">{id}</span>
      );
    }
    const link = '#' + FauxtonAPI.urls('document', 'app', encodeURIComponent(databaseName), encodeURIComponent(id));
    return (
      <a href={link} className="js-doc-link">{id}</a>
    );
  }
}
