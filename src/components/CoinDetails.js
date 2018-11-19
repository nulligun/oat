import React, {Component} from 'react';
import {Collapse} from 'reactstrap';
import ClickToCopy from './ClickToCopy';

class CoinDetails extends Component {
	constructor(props)
	{
		super(props);
		this.itemClose = this.itemClose.bind(this);
		this.itemOpen = this.itemOpen.bind(this);
		this.state = {isOpen: false};
		this.address = React.createRef();
	}

	itemClose() {
		this.setState({ isOpen: false });
	}

	itemOpen() {
		window.getSelection().selectAllChildren(this.address.current);
		this.setState({ isOpen: true });
	}

	render() {
		return (<div className={"coin-details" + (this.state.isOpen ? " open" : "")}>
			<div className="recipient-address">
				<ClickToCopy txtRef={this.address}>
					<big ref={this.address}>
					{this.props.record.properties.recipient_address}
					</big>
				</ClickToCopy>
				<Collapse className="detail-container" isOpen={this.state.isOpen} >
					<div className="properties">
						<h5>Properties</h5>
						{Object.keys(this.props.record.properties).map((k, index) => {
							return (<div key={index}><span className="prop-key">{k}</span><span className="prop-e">=</span><span className="prop-value">{this.props.record.properties[k]}</span></div>)
						})}
					</div>
					<div className="problems">
						{this.props.problems && this.props.problems.length > 0 && <div><h5>Problems</h5><ol>
							{ this.props.problems.map((p, index) => { return (<li key={index}>{p}</li>); }) }
						</ol></div>}
						{this.props.problems && this.props.problems.length === 0 && <div className="no-problems">
							There are no problems with this record. 💃
						</div>}
					</div>
				</Collapse>
			</div>
		</div>);
	}
}

export default CoinDetails;