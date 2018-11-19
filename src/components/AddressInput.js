import React, { Component } from 'react';
import { Input, Label, PopoverHeader, PopoverBody, Popover } from 'reactstrap';
import axios from "axios";
let rsa = require('jsrsasign');

class AddressInput extends Component {
	constructor(props) {
		super(props);
		this.addressChanged = this.addressChanged.bind(this);
		this.checkAddress = this.checkAddress.bind(this);
		this.lookup = this.lookup.bind(this);
		this.toggle = this.toggle.bind(this);

		let address = localStorage.getItem('address') || 'outdoordevs.com';

		this.looking = false;
		this.lookAfter = false;

		this.state = {
			has_error: false,
			problems: [],
			signature_valid: false,
			payload: false,
			address: address,
			icon_state: false,
			popoverOpen: false

		};

		this.cert = null;

		this.checkAddress(this.state.address);
	}

	componentDidMount()
	{
		window.ee.emit('addressChanged', this.state.address);
	}

	addressChanged(e)
	{
		this.setState({address: e.target.value, has_error: false, icon_state: false, signature_valid: false, problems: []});
		window.ee.emit('addressChanged', e.target.value);
		localStorage.setItem('address', e.target.value);
		this.checkAddress(e.target.value);
	}

	lookup(address)
	{
		if (this.looking === false) {
			this.looking = true;
			let myself = this;
			this.setState({icon_state: 'loading'}, function () {
				axios.post('/api/lookup', {address: address}).then((res) => {
					window.ee.emit('addressUpdated', res.data.domain);
					if (res.data.payload.status !== 0) {
						myself.setState({has_error: true, problems: [res.data.payload.message], icon_state: false}, function() {
							if (this.lookAfter) {
								let a = this.lookAfter;
								this.lookAfter = false;
								this.looking = false;
								this.lookup(a);
							} else {
								this.looking = false;
							}
						});
					} else {
						window.ee.emit('addressPayloadReceived', res.data.payload);

						let sig = new rsa.Signature({"alg": myself.algo});
						sig.init(myself.cert);

						sig.updateString(JSON.stringify(res.data.payload));
						let isValid = sig.verify(res.data.signature);

						let icon_state = 'unsafe';
						let has_error = true;
						if (res.data.payload.dnssec_valid && res.data.payload.googledns && isValid) {
							icon_state = 'safe';
							has_error = false;
						} else {
							icon_state = 'unsafe';
							has_error = true;
						}

						let problems = [];

						if (!isValid) problems.push('The payload signature is not valid, this data should NOT be trusted.');
						if (!res.data.payload.dnssec_valid) problems.push('The chain of trust is not valid for this domain, it should NOT be trusted.');
						if (!res.data.payload.googledns) problems.push('The payload was not created using Google DNS, it should NOT be trusted.');

						let payload_details = (<div>
							<p>Google DNS Used: <span>{res.data.payload.googledns ? "Yes" : "No"}</span></p>
							<p>DNSSec Valid: <span>{res.data.payload.dnssec_valid ? "Yes" : "No"}</span></p>
							<p>Payload Signature: <span>{isValid ? "Valid" : "Not Valid"}</span></p>
							{isValid && <p>The payload integrity is intact and results can be considered valid.</p>}
							{!isValid && <p>The payload signature is not valid, this data should NOT be trusted.</p>}
							<p>{res.data.signature}</p>
						</div>);

						myself.setState({has_error: has_error, payload_details: payload_details, problems: problems, icon_state: icon_state, payload: res.data.payload, signature_valid: isValid}, function() {
							if (this.lookAfter) {
								let a = this.lookAfter;
								this.lookAfter = false;
								this.looking = false;
								this.lookup(a);
							} else {
								this.looking = false;
							}
						});
					}
				});
			});
		} else {
			this.lookAfter = address;
		}
	}

	checkAddress(address)
	{
		window.ee.emit('addressValid', false);

		if (this.cert === null)
		{
			axios.get('/oar.json').then((res) => {
				this.cert = res.data.cert;
				this.algo = res.data.algo;
				this.lookup(address);
			});
		} else {
			this.lookup(address);
		}
	}

	toggle() {
		this.setState({
			popoverOpen: !this.state.popoverOpen
		});
	}

	render() {
		return (<div className={"address-input " + ((this.state.has_error === true) ? ' error' : '')}>
			<Popover placement="left" isOpen={this.state.popoverOpen} target="payload-info" toggle={this.toggle}>
				<PopoverHeader>Payload {this.state.has_error ? 'Failure' : 'Details'}</PopoverHeader>
				<PopoverBody>{this.state.payload_details}</PopoverBody>
			</Popover>
			<div className="address-bar">
			<Input id="oa-address" type="text" value={this.state.address} onChange={this.addressChanged} />
			<div id="payload-info" onClick={this.toggle} className={"address-icon" + ((this.state.icon_state === false) ? '' : ' ' + this.state.icon_state)}></div>
			</div>
			{!this.state.has_error && <Label className="small" for="oa-address">Enter a domain name to lookup all the OpenAlias TXT records associated with it.</Label>}
			{this.state.has_error && <div className="errors alert-danger"><div className="error-message">{this.state.problems.map((p, index) => {
				return (<p key={index}>{p}</p>);
			})}</div></div>}
			{this.state.payload && <div className="payload">
				<div className="collapse" id="collapseExample">
					<div className="card card-body">
						<h5>API Response Payload</h5>
						<div className="googledns"><span>Google DNS:</span><span>{this.state.payload.googledns ? 'Used' : 'Not Used'}</span></div>
						<div className="dnssec"><span>DNSSec:</span><span>{this.state.payload.dnssec_valid ? 'Valid' : 'Not Valid'}</span></div>
						<div className="signature"><span>Payload Signature:</span><span>{this.state.signature_valid ? 'Valid' : 'Not Valid'}</span></div>
					</div>
				</div>
			</div>}
		</div>)
	}
}

export default AddressInput;