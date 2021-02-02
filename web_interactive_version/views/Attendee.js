import React from 'react';

const exports = {};

exports.Wrapper = class extends React.Component {
    render() {
        const {content} = this.props;
        return (
            <div className="Attacher">
                <h2>Attacher (Bob)</h2>
                {content}
            </div>
        );
    }
}

exports.Attach = class extends React.Component {
    render() {
        const {parent} = this.props;
        const {ctcInfoStr} = this.state || {};
        return (
            <div>
                Please paste the contract info to attach to:
                <br />
                <textarea spellCheck="false"
                    className='ContractInfo'
                    onChange={(e) => this.setState({ctcInfoStr: e.currentTarget.value})}
                    placeholder='{}'
                />
                <br />
                <button
                    disabled={!ctcInfoStr}
                    onClick={() => parent.attach(ctcInfoStr)}
                >Attach</button>
            </div>
        )
    }
}

exports.Attaching = class extends React.Component {
    render() {
        return (
            <div>
                Attaching, please wait...
            </div>
        );
    }
}

exports.AcceptTerms = class extends React.Component {
    render() {
        const {wager, standardUnit, parent} = this.props;
        const {disabled} = this.state || {};
        return (
            <div>
                The terms of the auction are:
                <br />Wager: {wager} {standardUnit}
                <br />
                <button
                    disabled={disabled}
                    onClick={() => {
                        this.setState({disabled: true});
                        parent.termsAccepted();
                    }}
                >Accepted terms and pay wager</button>
            </div>
        );
    }
}

export default exports;