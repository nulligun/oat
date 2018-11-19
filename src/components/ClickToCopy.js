import React, {Component} from 'react';
import { keyframes, easing, styler, spring, delay, parallel } from 'popmotion';

class ClickToCopy extends Component {
	constructor(props) {
		super(props);
		this.handleCopied = this.handleCopied.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);

		this.copied1 = React.createRef();
		this.copied2 = React.createRef();
		this.counter = 0;

		let y = -24;

		this.copyAnim1 = keyframes({
			values: [{opacity: 0, translateX: "0%", "translateY": y}, {opacity: 1, translateX: "0%", "translateY": y},
				{opacity: 1, translateX: "0%", "translateY": y}],
			times: [0, 0.5, 1],
			easings: [easing.easeIn, easing.linear],
			duration: 200
		});

		this.fadeOut1 = keyframes({
			values: [{opacity: 1, translateX: "0%", "translateY": y}, {opacity: 0, translateX: "0%", "translateY": y}],
			times: [0, 1],
			easings: [easing.easeIn],
			duration: 150
		});

		this.fadeOut2 = keyframes({
			values: [{opacity: 1, translateX: "0%", "translateY": y}, {opacity: 0, translateX: "0%", "translateY": y}],
			times: [0, 1],
			easings: [easing.linear],
			duration: 150
		});

		this.zoomAnim = spring({from: {scale: 1.01, opacity: 0.25}, to: {scale: 1, opacity: 1}, stiffness: 300, damping: 10});

		this.copyAnim2b = spring({from: {rotateX: 90}, to: {rotateX: 180}, stiffness: 1000, damping: 10, velocity: 20});

		this.copyAnim2 = keyframes({
			values: [
				{rotateX: 0, opacity: 0, translateX: "0%", "translateY": y},
				{rotateX: 45, opacity: 1, translateX: "0%", "translateY": y},
				{rotateX: 90, opacity: 1, translateX: "0%", "translateY": y}
			],
			times: [0, 0.5, 1],
			easings: [easing.easeIn, easing.linear],
			duration: 200
		});

		this.state = {x:0,y:0};
	}

	componentDidMount() {
		this.copyStyler1 = styler(this.copied1.current, {});
		this.copyStyler2 = styler(this.copied2.current, {});
		//this is because we have to force a redraw after the component remounts, since fields.current is not quite ready when it gets loaded
		this.setState({ready: true});
	}

	offset(elem) {
		let rect, win;

		if ( !elem.getClientRects().length ) {
			return { top: 0, left: 0 };
		}
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;
		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	}

	handleCopied(e) {
		let myself = this;
		window.getSelection().selectAllChildren(myself.props.txtRef.current);
		document.execCommand('copy');

		let o = this.offset(myself.props.txtRef.current);
		this.setState({x: e.pageX - o.left + myself.props.txtRef.current.offsetLeft, y: e.pageY - o.top + myself.props.txtRef.current.offsetTop});

		delay(300).start({
			complete: () => {
				myself.txtStyler = styler(myself.props.txtRef.current, {});
				myself.setState({copyLabel: 'Copied'});
				myself.zoomAnim.start({
					update: v => {
						myself.txtStyler.set(v);
					}
				});
			}
		});
		this.justCopied = true;
		this.setState({justCopiedFlag: !this.state.justCopiedFlag, animating: true});
		this.copyAnim1.start({
			update: v => {
				myself.copyStyler1.set(v);
			}
		});

		myself.setState({copyLabel: 'Copy'});
		let copyAnim2Playback = this.copyAnim2.start({
			update: v => {
				myself.copyStyler2.set(v);
			},
			complete: () => {
				this.copyAnim2b.start({
					update: v => {
						myself.copyStyler2.set(v);
					}
				});
			}
		});

		setTimeout(function() {
			copyAnim2Playback.stop();
			parallel(
				myself.fadeOut1,
				myself.fadeOut2
			).start({
				update: ([ fadeOut1Output, fadeOut2Output ]) => {
					myself.copyStyler1.set(fadeOut1Output);
					myself.copyStyler2.set(fadeOut2Output);
				},
				complete: () => {
					myself.setState({animating: false});
				}});
		}, 400);
	}

	handleMouseMove(e)
	{
		this.setState({animating: false});
	}

	render() {
		const copiedStyle = {left: this.state.x, top: this.state.y};
		let billboard = (<div onMouseMove={this.handleMouseMove} className={"copiable" + " " + (this.state.animating ? 'animating' : '') + " " + (this.justCopied ? 'copied' : '')}>
			{this.props.children}
		</div>);
		return (<div>
			<div onMouseUp={this.handleCopied}>
				{billboard}
			</div>
			<div style={copiedStyle} className={this.state.animating ? 'copy-animating' : 'copy-not-animating'}>
				<div id="copied1" className="copy-anim" ref={this.copied1}>Copy</div>
				<div id="copied2" className="copy-anim" ref={this.copied2}>{this.state.copyLabel}</div>
			</div>
		</div>)
	}
}

export default ClickToCopy;