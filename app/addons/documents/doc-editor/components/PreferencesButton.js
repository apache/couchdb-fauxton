
import React from 'react';
import PropTypes from 'prop-types';
import Components from '../../../components/react-components';
// import Constants from '../constants';

const { MenuDropDown } = Components;

export default class PreferencesButton extends React.Component {
  static defaultProps = {
    wordWrapEnabled: false,
  };
  static propTypes = {
    wordWrapEnabled: PropTypes.bool,
    toggleWordWrap: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.toggleWordWrap = this.toggleWordWrap.bind(this);
  }

  toggleWordWrap() {
    this.props.toggleWordWrap();
  }

  render() {
    const links = [
      {
        title: 'Word Wrap',
        onClick: () => { this.toggleWordWrap(); },
        icon: this.props.wordWrapEnabled ? 'fonticon-ok' : '',
      }
    ];

    return (
      <div className='panel-section'>
        <MenuDropDown id="doc-editor-preferences-menu" links={links} icon='fonticon-mixer' hideArrow={true} toggleType='button'/>
      </div>
    );
  }
}
