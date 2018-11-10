import React, { Component } from 'react';

const CRC32 = require('crc-32');
const Web3 = require('web3');
const util = require('ethereumjs-util')

class AddressTestResultItem extends Component {
	constructor(props) {
		super(props);

		let state = {};
		if ('address_signature' in props.record.properties)
		{
			state.signatureValid = 'Checking...';
		} else {
			state.signatureValid = 'Missing';
		}
		if ('checksum' in props.record.properties)
		{
			state.checksumValid = 'Checking...';
		} else {
			state.checksumValid = 'Missing';
		}
		this.state = state;
	}

	verifySignature(record)
	{
		let signatureValid = 'Missing';
		if ('address_signature' in record.properties)
		{
			if (record.currency === 'ella') {
				signatureValid = 'Checking...';
			} else {
				signatureValid = 'Unknown';
			}
		}
		this.setState({
			signatureValid: signatureValid
		});

		if (record.currency === 'ella') {
			let self = this;
			window.web3.personal.ecRecover(record.domain, record.properties.address_signature, function (error, result) {
				if (error) throw error;
				self.setState({signatureValid: (result.toLowerCase() === record.properties.recipient_address.toLowerCase()) ? 'Valid' : 'Not Valid'});
			});
		}
	}

	componentDidMount()
	{
		if ('address_signature' in this.props.record.properties) {
			this.verifySignature(this.props.record);
		}
		if ('checksum' in this.props.record.properties) {
			this.checksum(this.props.record);
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot)
	{
		if (prevProps.record.address_signature !== this.props.record.address_signature)
		{
			this.verifySignature(this.props.record);
		}

		if (prevProps.record.checksum !== this.props.record.checksum)
		{
			this.checksum(this.props.record);
		}
	}

	checksum(record)
	{
		let raw = record.txt.replace(/\s+checksum=.*$/, '').trim();
		let crc32 = CRC32.str(raw).toString();
		this.setState({checksumValid: (crc32 === record.properties.checksum) ? 'Valid' : 'Not Valid'});
	}

	details(record)
	{
		return record.properties.recipient_name + record.properties.recipient_address;
	}

	render() {
		return (<tr className="payload-row">
				<td>{this.props.record.currency}</td>
				<td>{this.details(this.props.record)}</td>
				<td>{this.state.signatureValid}</td>
				<td>{this.state.checksumValid}</td>
			</tr>
		);
	}
}

export default AddressTestResultItem;