import React, {Component} from 'react';

class CoinImage extends Component {
	render() {
		return (<div className="coin-logo">
			{this.props.info &&
			<img alt={this.props.info.name} src={this.props.info.logo}/>
			}
			{!this.props.info &&
			<div className="sym"><div>{this.props.record.currency.toUpperCase()}</div></div>
			}
		</div>)
	}
}

export default CoinImage;