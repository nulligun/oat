import React, { Component } from 'react';
import AddressTestResultItem from './AddressTestResultItem';
import { ListGroup } from 'reactstrap';
import axios from "axios";
const CRC32 = require('crc-32');

class AddressTestResults extends Component {
	constructor(props) {
		super(props);

		this.problemReport = this.problemReport.bind(this);
		this.handleClick = this.handleClick.bind(this);

		const self = this;
		window.ee.addListener('addressChanged', function(address) {
			self.setState({addressEntered: address});
		});
		window.ee.addListener('addressPayloadReceived', function(payload) {
			let addressPayload = payload;
			self.addressReceived = payload.domain;
			let symbols = payload.records.map((r) => {
				return r.currency.toUpperCase();
			});

			axios.post('/api/info', {symbol: symbols.join()}).then((res) => {
				addressPayload['info'] = res.data;
				addressPayload['checksumValid'] = {};
				addressPayload['signatureValid'] = {};
				addressPayload['score'] = {};
				addressPayload['signatures'] = {};
				addressPayload['problems'] = {};
				let signaturePromises = [];
				addressPayload.records.forEach((r, index) => {
					addressPayload['checksumValid'][index] = self.checksumValid(r);

					if (self.canValidate(r))
					{
						let record = r;
						let idx = index;
						signaturePromises.push(new Promise(function(resolve, reject) {
								window.web3.personal.ecRecover(record.domain, record.properties.address_signature, function (error, result) {
									if (error) throw error;
									addressPayload['signatures']['idx'] = result.toLocaleString();
									addressPayload['signatureValid'][idx] = (result.toLowerCase() === record.properties.recipient_address.toLowerCase());
									addressPayload['score'][idx] = self.computeScore(r, idx, addressPayload);
									addressPayload['problems'][idx] = self.problemReport(r, idx, addressPayload);
									resolve();
								});
							}
						));
					} else {
						addressPayload['score'][index] = self.computeScore(r, index, addressPayload);
						addressPayload['problems'][index] = self.problemReport(r, index, addressPayload);
					}
				});

				Promise.all(signaturePromises).then(() => {
					self.setState({addressPayload: addressPayload});
				});
			});
		});

		this.state = {
			addressPayload: false,
			addressEntered: ''
		}
	}

	problemReport(record, idx, addressPayload)
	{
		let problems = [];
		let symbol = record.currency.toUpperCase();
		if (!(symbol in addressPayload.info))
		{
			problems.push('The symbol ' + symbol + ' was not found on CoinMarketCap. Please check that this is not a typo and verify the coins name is correct. Not all coins are listed here so this is only worth 1 point.')
		}
		if ('recipient_name' in record.properties)
		{
			if (record.properties.recipient_name.trim() === "")
			{
				problems.push('The recipient name field was found but it appeared to be empty. This is most likely an issue and should be corrected.');
			}
		} else {
			problems.push('This record does not have a recipient_name field. While these are not required they are recommend for legibility and some clients may use this field to enhance the user experience.');
		}
		if (!(addressPayload.checksumValid[idx]))
		{
			let raw = record.txt.replace(/\s+checksum=.*$/, '').trim();
			let crc32 = CRC32.str(raw).toString();
			let reason = (raw === "") ? "This record is missing a checksum. Please add checksum=" + crc32 + "; to this record to fix it." : "The checksum of " + record.properties.checksum + " does not match the expected value of " + crc32 + ".";
			problems.push(reason);
		}
		if (!(addressPayload.signatureValid[idx]))
		{
			if ((this.canValidate(record)))
			{
				if (!(record.properties.address_signature))
				{
					problems.push('This record does not have an address_signature. Add address_signature=' + addressPayload['signatures'][idx] + ' to greatly improve the integrity of this record.');
				} else {
					problems.push('The address_signature value of ' + record.properties.address_signature + ' did not match the expected value of ' + addressPayload['signatures'][idx]);
				}
			} else {
				problems.push('OpenAlias Tester does not know how to validate the signature of this record. If this coin has a standard method of signing messages, please contact Ellaism devs to have it added to this tool.');
			}
		}
		return problems;
	}

	computeScore(record, idx, addressPayload)
	{
		let score = 0;
		let symbol = record.currency.toUpperCase();
		if (symbol in addressPayload.info)
		{
			score += 1;
		}
		if ('recipient_name' in record.properties)
		{
			if (record.properties.recipient_name.trim() !== "")
			{
				score += 2;
			}
		}
		if (addressPayload.checksumValid[idx])
		{
			score += 3;
		}
		if (addressPayload.signatureValid[idx])
		{
			score += 4;
		}
		return score;
	}

	canValidate(r)
	{
		return ['ELLA', 'ETH', 'ETC', 'UBIQ', 'PIRL', 'EGEM', 'EXP', 'WHL'].includes(r.currency.toUpperCase());
	}

	checksumValid(record) {
			let raw = record.txt.replace(/\s+checksum=.*$/, '').trim();
			let crc32 = CRC32.str(raw).toString();
			return (crc32 === record.properties.checksum);
	}

	handleClick(index)
	{
		if (this.currentItem !== index) {
			window.ee.emit('itemClose', this.currentItem);
			window.ee.emit('itemOpen', index);
			this.currentItem = index;
		}
	}

	render() {
		const self = this;
		return (<div className="address-test-results">
			{this.state.addressEntered !== this.addressReceived && <h5>{this.addressReceived}</h5>}
			<ListGroup>
				{ this.state.addressPayload &&
					this.state.addressPayload.records.map((r, index) => {
						return <AddressTestResultItem key={index} dataKey={index} itemClicked={() => {this.handleClick(index)}} record={r} problems={self.state.addressPayload.problems[index]} score={self.state.addressPayload.score[index]} info={self.state.addressPayload.info[r.currency.toUpperCase()]}/>
					})
				}
			</ListGroup>
		</div>)
	}
}

export default AddressTestResults;