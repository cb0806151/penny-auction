import React from 'react';

const exports = {};

exports.Wrapper = class extends React.Component {
    render() {
        const {content} = this.props;
        return (
            <div className="App">
                <header className="App-header" id="root">
                    <h1>Penny Auction</h1>
                    {content}
                </header>
            </div>
        );
    }
}

exports.ConnectAccount = class extends React.Component {
    render() {
      return (
        <div>
          Please wait while we connect to your account.
          If this takes more than a few seconds, there may be something wrong.
        </div>
      )
    }
  }

export default exports;