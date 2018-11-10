import React, { Component } from 'react';
import axios from "axios";
let rsa = require('jsrsasign');

class AddressInput extends Component {
	constructor(props) {
		super(props);
		this.addressChanged = this.addressChanged.bind(this);
		this.checkAddress = this.checkAddress.bind(this);

		let address = localStorage.getItem('address') || 'outdoordevs.com';

		this.state = {
			has_error: false,
			error_message: false,
			signature_valid: false,
			payload: false,
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
		this.setState({address: e.target.value, has_error: false, signature_valid: false, error_message: ''});
		window.ee.emit('addressChanged', e.target.value);
		localStorage.setItem('address', e.target.value);
		this.checkAddress(e.target.value);
	}

	checkAddress(address)
	{
		window.ee.emit('addressValid', false);
		axios.post('/api/lookup', {address: address}).then((res) => {
			if (res.data.payload.status !== 0) {
				this.setState({has_error: true, error_message: res.data.payload.message})
			} else {
				window.ee.emit('addressPayloadReceived', res.data.payload);

				let sig = new rsa.Signature({"alg": "SHA256withRSA"});
				sig.init("-----BEGIN CERTIFICATE-----\n" +
					"MIIDrDCCApQCCQDFPmfdxKZpbTANBgkqhkiG9w0BAQsFADCBlzELMAkGA1UEBhMC\n" +
					"Q0ExEDAOBgNVBAgMB09udGFyaW8xDzANBgNVBAcMBk90dGF3YTEVMBMGA1UECgwM\n" +
					"T3V0ZG9vciBEZXZzMQwwCgYDVQQLDANPQVQxGDAWBgNVBAMMD291dGRvb3JkZXZz\n" +
					"LmNvbTEmMCQGCSqGSIb3DQEJARYXc3VwcG9ydEBvdXRkb29yZGV2cy5jb20wHhcN\n" +
					"MTgxMTA1MDA1MTUwWhcNMTkxMTA1MDA1MTUwWjCBlzELMAkGA1UEBhMCQ0ExEDAO\n" +
					"BgNVBAgMB09udGFyaW8xDzANBgNVBAcMBk90dGF3YTEVMBMGA1UECgwMT3V0ZG9v\n" +
					"ciBEZXZzMQwwCgYDVQQLDANPQVQxGDAWBgNVBAMMD291dGRvb3JkZXZzLmNvbTEm\n" +
					"MCQGCSqGSIb3DQEJARYXc3VwcG9ydEBvdXRkb29yZGV2cy5jb20wggEiMA0GCSqG\n" +
					"SIb3DQEBAQUAA4IBDwAwggEKAoIBAQC/jamf82OVuhdOxGBhLk8sdx337YxTLztX\n" +
					"ejBdB7HvRkoZwZhU29Z3SWwKdXvH7d7KyJ1qQOKbPExfgtVv54cMW6KztKSwOU0+\n" +
					"5qg7ecCzpSH7bwl2sH9PvPPPrRLNrVZYHDZR0fgIT0kWwJrbKSdLVetErNGlGu+I\n" +
					"dXia62diACJk74TqxzSZJw8ttMZGa+tYBHUpCC+oxTUqp2akLeu38xHFB5GzgxaD\n" +
					"1iIh9wme5rl7EQHo/P4KOZXH6GXQO42/KPM893CLuJIVfb+6aAYO4z+Hqa33CMp5\n" +
					"iDC5sWa1RqFZNhqOw8U2ZcFg+iyeqO62qdzdWib0HXnDp+KnhgiXAgMBAAEwDQYJ\n" +
					"KoZIhvcNAQELBQADggEBAHqcS79KY+xS1RjpZ5DKg2gJZK2jv4mbJoczwXdQGVK+\n" +
					"iZYGX4fGx6RgYrHNSAyn9AjLPkE6RG6OjKIxp+0ElX0TZCBX6m0hqqhW1Fek9LJp\n" +
					"tP6TwFcHUDUUeGckKaGuG6FUxkDcfKE+ch2jEmJuRaLfx9r9nQNb2JBJdX8nlDpY\n" +
					"Xcjr036eaEbjwdW+YYTawm8eDd+fZZbksbwZHVlpq+1R35fV7x04fPrlTnnj6Jd1\n" +
					"IlONF+70tZKp9rq/ecZ/D5NII6tHGijo6ua69X+sPngnm12hnEc0yXiaJInCCCfa\n" +
					"cXiUvBsxWXObP7An22rR/zJ4u/oUdffJk36n53i1fbQ=\n" +
					"-----END CERTIFICATE-----\n"); // signer's certificate

				sig.updateString(JSON.stringify(res.data.payload));
				let isValid = sig.verify(res.data.signature);

				this.setState({has_error: false, error_message: false, payload: res.data.payload, signature_valid: isValid});
			}
		});
	}

	render() {
		return (<div className={"address-input " + ((this.state.has_error === true) ? ' error' : '')}>
			<input type="text" value={this.state.address} onChange={this.addressChanged} />
			{this.state.has_error && <div className="error-message">{this.state.error_message}</div>}
			{this.state.payload && <div className="payload">
				<div className="googledns"><span>Google DNS:</span><span>{this.state.payload.googledns ? 'Used' : 'Not Used'}</span></div>
				<div className="dnssec"><span>DNSSec:</span><span>{this.state.payload.dnssec_valid ? 'Valid' : 'Not Valid'}</span></div>
				<div className="signature"><span>Payload Signature:</span><span>{this.state.signature_valid ? 'Valid' : 'Not Valid'}</span></div>
			</div>}
		</div>)
	}
}

export default AddressInput;