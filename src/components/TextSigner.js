import React, { Component } from 'react';
import { Button, Input, Label, Form, FormGroup } from 'reactstrap';
import ClickToCopy from './ClickToCopy';

const Web3 = require('web3');

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
		this.sigTxt = React.createRef();
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
			<Form>
				<FormGroup>
					<h5>Text Signer</h5>
			<Input id="txt-to-sign" type="textarea" value={this.state.value} onChange={this.handleChange} />
					<Label for="txt-to-sign"><small>Enter some text and click Sign to use MetaMask to sign it.  This can help debug issues with the address_signature field of ETH based coins.</small></Label>
					<div>
			<Button color="warning" onClick={this.handleSubmit}>Sign with MetaMask</Button>
					</div>
				</FormGroup>
			</Form>
			{this.state.signature &&
				<ClickToCopy txtRef={this.sigTxt}>
			<div ref={this.sigTxt} className="signature">
				{this.state.signature}
			</div>
				</ClickToCopy>
			}
		</div>)
	}
}

export default TextSigner;