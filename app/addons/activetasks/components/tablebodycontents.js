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
import app from '../../../app';

const activeTasksHelpers = {
  getTimeInfo (timeStamp) {
    var timeMessage = [
      app.helpers.formatDate(timeStamp),
      app.helpers.getDateFromNow(timeStamp)
    ];
    return timeMessage;
  },

  getDatabaseFieldMessage (item) {
    var type = item.type;
    var databaseFieldMessage = [];

    if (type === 'replication') {
      databaseFieldMessage.push('From: ' + item.source);
      databaseFieldMessage.push('To: ' + item.target);
    } else if (type === 'indexer') {
      databaseFieldMessage.push(item.database);
      databaseFieldMessage.push('(View: ' + item.design_document + ')');
    } else {
      databaseFieldMessage.push(item.database);
    }

    return databaseFieldMessage;
  },

  getProgressMessage (item) {
    var progressMessage = [];
    var type = item.type;

    if (_.has(item, 'progress')) {
      progressMessage.push('Progress: ' + item.progress + '%');
    }

    if (type === 'indexer') {
      progressMessage.push(
        'Processed ' + item.changes_done + ' of ' + item.total_changes + ' changes.'
      );
    } else if (type === 'replication') {
      progressMessage.push(item.docs_written + ' docs written.');

      if (_.has(item, 'changes_pending')) {
        progressMessage.push(item.changes_pending + ' pending changes.');
      }
    }

    if (_.has(item, 'changes_done')) {
      progressMessage.push(item.changes_done + ' Changes done.');
    }

    return progressMessage;
  },

  getSourceSequence (item) {
    return item.source_seq;
  }

};

export default class ActiveTaskTableBodyContents extends React.Component {
  getInfo = (item) => {
    return {
      type : item.type,
      objectField: activeTasksHelpers.getDatabaseFieldMessage(item),
      started_on: activeTasksHelpers.getTimeInfo(item.started_on),
      updated_on: activeTasksHelpers.getTimeInfo(item.updated_on),
      pid: item.pid.replace(/[<>]/g, ''),
      progress: activeTasksHelpers.getProgressMessage(item),
    };
  };

  multilineMessage = (messageArray, optionalClassName) => {

    if (!optionalClassName) {
      optionalClassName = '';
    }
    var cssClasses = 'multiline-active-tasks-message ' + optionalClassName;

    return messageArray.map(function (msgLine, iterator) {
      return <p key={iterator} className={cssClasses}>{msgLine}</p>;
    });
  };

  render() {
    var rowData =  this.getInfo(this.props.item);
    var objectFieldMsg = this.multilineMessage(rowData.objectField, 'to-from-database');
    var startedOnMsg = this.multilineMessage(rowData.started_on, 'time');
    var updatedOnMsg = this.multilineMessage(rowData.updated_on, 'time');
    var progressMsg = this.multilineMessage(rowData.progress);

    return (
      <tr>
        <td>{rowData.type}</td>
        <td>{objectFieldMsg}</td>
        <td>{startedOnMsg}</td>
        <td>{updatedOnMsg}</td>
        <td>{rowData.pid}</td>
        <td>{progressMsg}</td>
      </tr>
    );
  }
}
