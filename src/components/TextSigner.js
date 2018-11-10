import React, { Component } from 'react';

const Web3 = require('web3');
const util = require('ethjs-util');

class TextSigner extends Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		this.eth = null;

		this.state = {
			value: '',
			signature: ''
		};
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	initWeb3()
	{
		this.eth = null;
		return new Promise(async (resolve, reject) => {
			if (window.ethereum) {
				window.web3 = new Web3(window.ethereum);
				try {
					await window.ethereum.enable();
					resolve();
				} catch (error) {
					reject();
					// User denied account access...
				}
			}
			// Legacy dapp browsers...
			else if (window.web3) {
				window.web3 = new Web3(window.web3.currentProvider);
				resolve();
			}
			// Non-dapp browsers...
			else {
				console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
				reject();
			}
		});
	}

	signData(data)
	{
		let self = this;
		window.web3.eth.getAccounts().then((result) => {
			let account = result[0];
			if (account) {
				window.web3.eth.personal.sign(data, account).then((result) => {
						self.setState({signature: result});
					});
			}
		});
	}

	handleSubmit(event) {
		const data = this.state.value;
		if (this.eth === null) {
			this.initWeb3().then(() => {
				this.signData(data)
			});
		} else {
			this.signData(data);
		}
	}

	render() {
		return (<div className="text-signer">
			<textarea value={this.state.value} onChange={this.handleChange} />
			<button onClick={this.handleSubmit}>Sign</button>
			<div className="signature">
				{this.state.signature}
			</div>
		</div>)
	}
}

export default TextSigner;