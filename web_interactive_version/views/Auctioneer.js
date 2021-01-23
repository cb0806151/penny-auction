import React from 'react';

const exports = {};

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

exports.Wrapper = class extends React.Component {
    render() {
        const {content} = this.props;
        return (
            <div className="Deployer">
                <h2>Deployer (Auctioneer)</h2>
                {content}
            </div>
        );
    }
}

exports.SetWager = class extends React.Component {
    render() {
      const {parent, defaultWager, standardUnit} = this.props;
      const wager = (this.state || {}).wager || defaultWager;
      return (
        <div>
          <input
            type='number'
            placeholder={defaultWager}
            onChange={(e) => this.setState({wager: e.currentTarget.value})}
          /> {standardUnit}
          <br />
          <button
            onClick={() => parent.setWager(wager)}
          >Set wager</button>
        </div>
      );
    }
  }

export default exports;