import React from 'react';
import {CompactDatabase} from "./CompactDatabase";
import {CleanView} from "./CleanView";
export default class CompactionController extends React.Component {
  render () {
    const {isCompacting, isCleaningViews, cleanupViews, compactDatabase, database} = this.props;
    return (
      <div className="compaction-page flex-body">
        <CompactDatabase isCompacting={isCompacting} database={database} compactDatabase={compactDatabase}/>
        <CleanView isCleaningViews={isCleaningViews} database={database} cleanupViews={cleanupViews}/>
      </div>
    );
  }
}
