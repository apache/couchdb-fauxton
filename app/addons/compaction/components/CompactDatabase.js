
import React from 'react';


export class CompactDatabase extends React.Component {

  constructor() {
    super();
    this.run = this.run.bind(this);
  }

  run() {
    this.props.compactDatabase(this.props.database);
  }

  render() {
    const {isCompacting} = this.props;
    let btnText = 'Run';

    if (isCompacting) {
      btnText = 'Compacting...';
    }

    return (
      <div className="row-fluid">
        <div className="span12 compaction-option">
          <h3>Compact Database</h3>
          <p>Compacting a database removes deleted documents and previous revisions. It is an irreversible
                        operation and may take a while to complete for large databases.</p>
          <button id="compact-db" disabled={isCompacting} onClick={this.run}
            className="btn btn-large btn-primary">{btnText}</button>
        </div>
      </div>
    );
  }
}
