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

const RemoteExample = () => {
  const tooltip = (
    <Tooltip id="tooltip">
      <p>
        If you know the credentials for the remote account, you can use that remote username and password.
      </p>
      <p>
        If a remote database granted permissions to your local account, you can use the local-account username and password.
      </p>
      <p>
        If the remote database granted permissions to "everybody," you do not need to enter a username and password.
      </p>
    </Tooltip>
  );
  return (
    <div
      className="replication-remote-connection-url-text">
      Example:&nbsp;
      <OverlayTrigger placement="right" overlay={tooltip}>
        <i className="icon icon-question-sign"/>
      </OverlayTrigger>
      &nbsp;https://$REMOTE_USERNAME:$REMOTE_PASSWORD@$REMOTE_SERVER/$DATABASE
    </div>
  );
};

export default RemoteExample;
