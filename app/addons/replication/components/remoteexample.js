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
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

const tooltipExisting = (
  <Tooltip id="tooltip" className="replication__tooltip">
    <p>
      If you know the credentials for the remote account, you can use that remote username and password.
    </p>
    <p>
      If a remote database granted permissions to your local account, you can use the local-account username and password.
    </p>
    <p>
      If the remote database granted permissions to unauthenticated connections, you do not need to enter a username or password.
    </p>
  </Tooltip>
);

const tooltipNew = (
  <Tooltip id="tooltip" className="replication__tooltip">
    Enter the username and password of the remote account.
  </Tooltip>
);

const RemoteExample = ({newRemote}) => {
  const newRemoteText = newRemote ? 'If a "new" database already exists, data will replicate into that existing database.' : null;
  return (
    <div
      className="replication__remote-connection-url-text">
      https://$USERNAME:$PASSWORD@$REMOTE_SERVER/$DATABASE
      &nbsp;
      <OverlayTrigger placement="right" overlay={newRemote ? tooltipNew : tooltipExisting}>
        <i className="replication__remote_icon_help icon icon-question-sign"/>
      </OverlayTrigger>
      <p>{newRemoteText}</p>
    </div>
  );
};

export default RemoteExample;
