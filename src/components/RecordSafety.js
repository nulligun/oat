import React, {Component} from 'react';

class RecordSafety extends Component {
	render() {
		let safety = null;

		if (this.props.score < 4)
		{
			safety = (<div className="octagon-outer">
				<div className="octagon-inner"><p>{this.props.score}</p></div>
			</div>);
		} else if (this.props.score < 9) {
			safety = (<div className="triangle-outer">
				<p>{this.props.score}</p>
			</div>)
		} else {
			safety = (<div className="circle-outer">
				<p>{this.props.score}</p>
			</div>)
		}

		return (<div className="record-safety">
			{safety}
		</div>)
	}
}

export default RecordSafety;