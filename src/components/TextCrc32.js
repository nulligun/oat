import React, { Component } from 'react';

const CRC32 = require('crc-32');

class TextCrc32 extends Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		this.eth = null;

		this.state = {
			value: '',
			checksum: ''
		};
	}

	handleChange(event) {
		this.setState({value: event.target.value});
	}

	checksum(data)
	{
		let self = this;
		self.setState({checksum: CRC32.str(data)});
	}

	handleSubmit(event) {
		const data = this.state.value;
		this.checksum(data);
	}

	render() {
		return (<div className="text-checksum">
			<textarea value={this.state.value} onChange={this.handleChange} />
			<button onClick={this.handleSubmit}>Checksum</button>
			<div className="checksum">
				{this.state.checksum}
			</div>
		</div>)
	}
}

export default TextCrc32;