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

import React from 'react';
import PerPageSelector from '../../documents/index-results/components/pagination/PerPageSelector';

export class ReplicationFooter extends React.Component {

  getFooterText () {
    const { statusDocs, pageLimit } = this.props;

    if (statusDocs.length === 0) {
      return <span>Showing 0 replications.</span>;
    }

    //either page limit or total # of replications, whichever is smaller
    return <span>Showing replications 1 - {Math.min(pageLimit, statusDocs.length)}</span>;
  }

  perPageChange (limit) {
    this.props.setPageLimit(limit);
  }

  render() {
    const { pageLimit } = this.props;

    return (
      <footer className="pagination-footer">
        <PerPageSelector label="Max replications displayed:" options={[5, 10, 25, 50, 100, 200, 300, 400, 500]} perPageChange={this.perPageChange.bind(this)} perPage={pageLimit} />
        <div className="current-replications">
          {this.getFooterText()}
        </div>
      </footer>
    );
  }
}

ReplicationFooter.propTypes = {
  statusDocs: PropTypes.array.isRequired,
  pageLimit: PropTypes.number.isRequired,
  setPageLimit: PropTypes.func.isRequired
};
