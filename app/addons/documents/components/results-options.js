
import React from 'react';
import PropTypes from 'prop-types';
import Components from '../../components/react-components';
import Constants from '../constants';

const { MenuDropDown } = Components;

export default class ResultsOptions extends React.Component {
  static defaultProps = {
    showDensity: true,
    showFontSize: true
  };
  static propTypes = {
    resultsStyle: PropTypes.object.isRequired,
    updateStyle: PropTypes.func.isRequired,
    showDensity: PropTypes.bool,
    showFontSize: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.toggleTextOverflow = this.toggleTextOverflow.bind(this);
    this.setFontSize = this.setFontSize.bind(this);
  }

  toggleTextOverflow() {
    if (this.props.resultsStyle.textOverflow === Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL) {
      this.props.updateStyle({
        textOverflow: Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_TRUNCATED
      });
    } else {
      this.props.updateStyle({
        textOverflow: Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL
      });
    }
  }

  setFontSize(size) {
    this.props.updateStyle({
      fontSize: size
    });
  }

  getDensitySection() {
    let menuOptionTitle = 'Show full values';
    if (this.props.resultsStyle.textOverflow === Constants.INDEX_RESULTS_STYLE.TEXT_OVERFLOW_FULL) {
      menuOptionTitle = 'Truncate values';
    }

    const densityItems = [{
      title: menuOptionTitle,
      onClick: this.toggleTextOverflow
    }];

    return {
      title: 'Display density',
      links: densityItems
    };
  }

  getFontSizeSection() {
    const fontSizeItems = [{
      title: 'Small',
      onClick: () => { this.setFontSize(Constants.INDEX_RESULTS_STYLE.FONT_SIZE_SMALL); },
      icon: this.props.resultsStyle.fontSize === Constants.INDEX_RESULTS_STYLE.FONT_SIZE_SMALL ? 'fonticon-ok' : ''
    },
    {
      title: 'Medium',
      onClick: () => { this.setFontSize(Constants.INDEX_RESULTS_STYLE.FONT_SIZE_MEDIUM); },
      icon: this.props.resultsStyle.fontSize === Constants.INDEX_RESULTS_STYLE.FONT_SIZE_MEDIUM ? 'fonticon-ok' : ''
    },
    {
      title: 'Large',
      onClick: () => { this.setFontSize(Constants.INDEX_RESULTS_STYLE.FONT_SIZE_LARGE); },
      icon: this.props.resultsStyle.fontSize === Constants.INDEX_RESULTS_STYLE.FONT_SIZE_LARGE ? 'fonticon-ok' : ''
    }];
    return {
      title: 'Font size',
      links: fontSizeItems
    };
  }

  render() {
    const links = [];
    if (this.props.showDensity) {
      links.push(this.getDensitySection());
    }
    if (this.props.showFontSize) {
      links.push(this.getFontSizeSection());
    }

    return (
      <div className='toolbar-dropdown'>
        <MenuDropDown id="result-style-menu" links={links} icon='fonticon-mixer' hideArrow={true} toggleType='button'/>
      </div>
    );
  }
}
