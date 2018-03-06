import React, { Component } from 'react';
import Popover from 'react-popover';
import HelpIcon from '../svg/help.svg';

const TipCopy = (
  <div className="tip-copy">
    <div className="tip-line"><b>Select:</b> Click a cell</div>
    <div className="tip-line"><b>Assign Number:</b> Single click on desired number control</div>
    <div><b>Tag Number as Note:</b> Double click on the desired number control</div>
    { /* language=CSS */ }
    <style jsx>{`
        .tip-copy {
            font-size: 1.2em;
        }
        .tip-line {
            margin-bottom: .4em;
        }
    `}
    </style>
  </div>
)


export default class Tip extends Component {
    state = {}
    toggleOpen = (event) => {
      // This prevents ghost click.
      event.preventDefault();
      this.setState({ open: !this.state.open });
    }

    close = () => {
      this.setState({ open: false });
    }

    open = () => {
      this.setState({ open: true });
    }
    render() {
      return (
        <Popover
          isOpen={this.state.open}
          preferPlace="below"
          body={TipCopy}
          style={{ width: '90vw', maxWidth: '40em' }}
        >
          <div
            onClick={this.toggleOpen}
            onMouseEnter={this.open}
            onMouseLeave={this.close}
          >
            <HelpIcon className="icon" />
            { /* language=CSS */ }
            <style jsx>{`
                :global(.icon) {
                    height: 1.25em;
                    cursor: pointer;
                }
            `}
            </style>
          </div>
        </Popover>
      );
    }
}
