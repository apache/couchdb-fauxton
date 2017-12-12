import FauxtonAPI from '../../../core/api';
import PropTypes from 'prop-types';
import React from 'react';
import {TabElement, TabElementWrapper} from './tabelement';


export class TabWindowWrapper extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    const {selectedTab, tabs} = this.props;

    const elements = tabs.map((tab, i) => {

      return (
        <TabElement
          key={i}
          selected={tab.name === selectedTab}
          text={tab.name}
          badgeText={tab.badgeText}
          onChange={() => { FauxtonAPI.navigate(tab.route, {redirect: true}); }}
          iconClass="" />
      );
    });

    const selectedPage = tabs.reduce((acc, el) => {
      if (el.name === selectedTab) {
        return el;
      }
      return acc;
    }, {});

    if (!selectedPage.component) {
      return null;
    }

    return (
      <div className="tab__wrapper">
        <TabElementWrapper>
          {elements}
        </TabElementWrapper>

        <div className="tab__container">
          <selectedPage.component />
        </div>
      </div>
    );
  }

}

TabWindowWrapper.propTypes = {
  tabs: PropTypes.array.isRequired,
  selectedTab: PropTypes.string.isRequired
};
