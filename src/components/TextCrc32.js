import React, { Component } from 'react';
import { Form, FormGroup, Input, Label } from 'reactstrap';
import ClickToCopy from './ClickToCopy';

const CRC32 = require('crc-32');

class TextCrc32 extends Component {
	constructor(props) {
		super(props);

		this.handleChange = this.handleChange.bind(this);

		this.eth = null;

		this.state = {
			value: '',
			checksum: ''
		};
		this.chk = React.createRef();
	}

	handleChange(event) {
		this.setState({value: event.target.value, checksum: CRC32.str(event.target.value)});
	}

	render() {
		return (<div className="text-checksum">
			<Form>
				<FormGroup>
					<h5>CRC-32 Checksummer</h5>
			<Input id="txt-to-checksum" type="textarea" value={this.state.value} onChange={this.handleChange} />
					<Label for="txt-to-checksum"><small>This allows you to compute CRC-32 Checksum value of some text. The result is a 32 bit signed integer, useful for debugging the checksum field.</small></Label>
				</FormGroup>
			</Form>
			{this.state.checksum && <ClickToCopy txtRef={this.chk}><div ref={this.chk} className="checksum">
				{this.state.checksum}
			</div></ClickToCopy>}
		</div>)
	}
}

export default TextCrc32;