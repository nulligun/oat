import React, { Component } from 'react';
import AddressTestResultItem from './AddressTestResultItem';

class AddressTestResults extends Component {
	constructor(props) {
		super(props);

		const self = this;
		window.ee.addListener('addressPayloadReceived', function(payload) {
			self.setState({payload: payload});
		});

		this.state = {
			payload: false
		}
	}

	render() {
		return (<div className="address-test-results">
			{this.state.payload && <table><thead><tr><th>Currency</th><th>Details</th><th>Signature</th><th>Checksum</th></tr></thead>
				<tbody>
				{this.state.payload.records.map((r, index) =>
				{
					return <AddressTestResultItem key={index} record={r}/>
				})}</tbody></table>}
		</div>)
	}
}

export default AddressTestResults;