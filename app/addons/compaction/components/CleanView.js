import React from 'react';

export class CleanView extends React.Component {
  constructor() {
    super();
    this.run = this.run.bind(this);
  }
  run() {
    this.props.cleanupViews(this.props.database);
  }

  render() {
    const {isCleaningViews} = this.props;
    let btnText = 'Run';

    if (isCleaningViews) {
      btnText = 'Cleaning Views...';
    }
    return (
      <div className="row-fluid">
        <div className="span12 compaction-option">
          <h3>Cleanup Views</h3>
          <p>Cleaning up views in a database removes old view files still stored on the filesystem. It is an
                        irreversible operation.</p>
          <button id="cleanup-views" disabled={isCleaningViews} onClick={this.run}
            className="btn btn-large btn-primary">{btnText}</button>
        </div>
      </div>
    );
  }
}
