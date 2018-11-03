import React, { Component } from 'react';
import axios from "axios";

class AddressInput extends Component {
	constructor(props) {
		super(props);
		this.addressChanged = this.addressChanged.bind(this);
		this.checkAddress = this.checkAddress.bind(this);

		let self = this;
		window.ee.addListener('addressError', function(error) {
			self.setState({has_error: true, error_message: error});
		});

		let address = localStorage.getItem('address') || 'outdoordevs.com';

		this.state = {
			has_error: false,
			error_message: false,
			address: address
		};

		this.checkAddress(this.state.address);
	}

	componentDidMount()
	{
		window.ee.emit('addressChanged', this.state.address);
	}

	addressChanged(e)
	{
		this.setState({address: e.target.value, has_error: false, error_message: ''});
		window.ee.emit('addressChanged', e.target.value);
		localStorage.setItem('address', e.target.value);
		this.checkAddress(e.target.value);
	}

	checkAddress(address)
	{
		window.ee.emit('addressValid', false);
		axios.post('/api/lookup', {address: address}).then((res) => {
			if (res.data.error) {
				this.setState({has_error: true, error_message: res.data.message})
			} else {
				window.ee.emit('addressValid', true);
				this.setState({has_error: false, error_message: false});
			}
		});
	}

	render() {
		return (<div className="address-input">
			<input type="text" value={this.state.address} onChange={this.addressChanged} />
		</div>)
	}
}

export default AddressInput;