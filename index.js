import React from 'react';
import AppViews from './web_interactive_version/views/App';
import AuctioneerViews from './web_interactive_version/views/Auctioneer';
import AttendeeViews from './web_interactive_version/views/Attendee';
import {renderDOM, renderView} from './web_interactive_version/views/render';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

const {standardUnit} = reach;
const defaults = {defaultFundAmt: '10', defaultWager: '3', standardUnit};
let acc = undefined
const fmt = (x) => reach.formatCurrency(x, 4);
const getBalance = async (who) => fmt(await reach.balanceOf(who));

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {view: 'ConnectAccount', ...defaults};
    }
    async componentDidMount() {
        try {
          acc = await reach.getDefaultAccount();
        } catch (e) {
          this.setState({view: 'AccountUnavailable'});
          return;
        }
        const balAtomic = await reach.balanceOf(acc);
        const bal = fmt(balAtomic);
        this.setState({acc, bal});
        try {
            const faucet = await reach.getFaucet();
            this.setState({view: 'FundAccount', faucet});
        } catch (e) {
            this.setState({view: 'AuctioneerOrAttendee'});
        }
    }
    async fundAccount(fundAmount) {
        await reach.transfer(this.state.faucet, this.state.acc, reach.parseCurrency(fundAmount));
        this.setState({view: 'AuctioneerOrAttendee'})
    }
    async skipFundAccount() {this.setState({view: 'AuctioneerOrAttendee'});}
    selectAttendee() { this.setState({view: 'Wrapper', ContentView: Attendee}); }
    selectAuctioneer() { this.setState({view: 'Wrapper', ContentView: Auctioneer}); }
    render() { return renderView(this, AppViews); }
}

class Auctioneer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {view: 'SetDeadline'};
    }
    setWager(wager) { this.setState({view: 'Deploy', wager}); }
    setDeadline() { this.setState({view: 'SetWager'})}
    async getParams() {
      const params = {
        deadline: 5,
        potAmount: this.wager,
        potAddress: this.props.acc,
      }
      return params;
    }
    initialPotAmount(amount) {
      console.log(`The initial price of the pot is ${fmt(amount)}`);
    }
    auctionEnds(potBalance) {
      console.log(`And the auction has finished with the pot at ${fmt(potBalance)}`);
    }
    async deploy() {
      const ctc = this.props.acc.deploy(backend);
      this.setState({view: 'Deploying', ctc});
      this.wager = reach.parseCurrency(this.state.wager); // UInt
      backend.Auctioneer(ctc, this);
      const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
      this.setState({view: 'WaitingForAttacher', ctcInfoStr});
    }

    render() { return renderView(this, AuctioneerViews); }
  }
  
class Attendee extends React.Component {
    constructor(props) {
      super(props);
      this.state = {view: 'Attach'};
    }
    attach(ctcInfoStr) {
      const ctc = this.props.acc.attach(backend, JSON.parse(ctcInfoStr));
      this.setState({view: 'Attaching'});
      backend.Attendee(ctc, this);
    }
    async placedBet(attendeeAddress, betAmount) {
      if ( reach.addressEq(attendeeAddress, this.props.acc) ) {
        const balance = await getBalance(this.props.acc);
        console.log(`${attendeeAddress} bet: ${fmt(betAmount)} leaving their balance at ${balance}`);
      }
    }
    auctionEnds(potBalance) {
      console.log(`And the auction has finished with the pot at ${fmt(potBalance)}`);
    }
    async mayBet(betAmount) {
      const balance = await getBalance(this.props.acc);
      const mayBet = balance > fmt(betAmount);
      if (mayBet) return Math.random() > 0.75;
      return mayBet;
    }
    render() { return renderView(this, AttendeeViews); }
  }
  

renderDOM(<App />);