import React, { Component } from 'react';
import { ListGroupItem, Button } from 'reactstrap';
import CoinImage from './CoinImage';
import CoinDetails from './CoinDetails';
import RecordSafety from './RecordSafety';

class AddressTestResultItem extends Component {
	constructor(props)
	{
		super(props);
		this.detailsRef = React.createRef();
		let self = this;
		window.ee.addListener('itemClose', function(index) {
			if (index === self.props.dataKey) self.detailsRef.current.itemClose();
		});
		window.ee.addListener('itemOpen', function(index) {
			if (index === self.props.dataKey) self.detailsRef.current.itemOpen();
		});
	}

	render() {
		return (<ListGroupItem color={this.props.score < 4 ? "danger" : "normal"} onClick={this.props.itemClicked}>
				<div className="outer-container">
					<div className="outer-column-1">
						<div className="inner-container-2">
							<div className="inner-column-2a">
								<div className="coin-name"><small>{this.props.info && this.props.info.name}</small></div>
								<CoinImage record={this.props.record} info={this.props.info} />
							</div>
						</div>
					</div>
					<div className="outer-column-2">
						<div className="inner-container-2">
							<RecordSafety score={this.props.score} />
						</div>
					</div>
					<div className="outer-column-3">
						<div className="inner-container">
							<div className="inner-column-1">
								<div className="recipient-name"><p>{this.props.record.properties.recipient_name}</p></div>
							</div>
							<div className="inner-column-2">
								<CoinDetails ref={this.detailsRef} problems={this.props.problems} record={this.props.record} info={this.props.info} />
							</div>
						</div>
					</div>
				</div>
			</ListGroupItem>
		);
	}
}

export default AddressTestResultItem;