import React, { Component } from 'react';
import AddressInput from './components/AddressInput';
import AddressTestResults from './components/AddressTestResults';
import TextCrc32 from './components/TextCrc32';
import TextSigner from './components/TextSigner';
import { Nav, NavItem, NavLink, TabContent, TabPane, Row, Col, Container, Form } from 'reactstrap';
import classnames from 'classnames';

import './App.css';

let {EventEmitter} = require('fbemitter');
window.ee = new EventEmitter();

class App extends Component {
	constructor(props)
	{
		super(props);
		let currentVersion = 7;
		this.toggle = this.toggle.bind(this);
		this.state = {
			activeTab: '1'
		};
		let storageVersion = JSON.parse(localStorage.getItem('version'));
		if ((storageVersion === null) || (storageVersion < currentVersion)) {
			localStorage.setItem('version', JSON.stringify(currentVersion));
			localStorage.setItem('address', '');
		}
	}

	toggle(tab) {
		if (this.state.activeTab !== tab) {
			this.setState({
				activeTab: tab
			});
		}
	}

  render() {
    return (
      <div className="App">
        <Container>
	        <Row>
		        <Col sm="12">
			        <div className="pill-wrapper">
			        <Nav pills>
				        <NavItem>
					        <NavLink
						        className={classnames({ active: this.state.activeTab === '1' })}
						        onClick={() => { this.toggle('1'); }}
					        >
						        Test
					        </NavLink>
				        </NavItem>
				        <NavItem>
					        <NavLink
						        className={classnames({ active: this.state.activeTab === '2' })}
						        onClick={() => { this.toggle('2'); }}
					        >
						        Sign
					        </NavLink>
				        </NavItem>
				        <NavItem>
					        <NavLink
						        className={classnames({ active: this.state.activeTab === '3' })}
						        onClick={() => { this.toggle('3'); }}
					        >
						        Checksum
					        </NavLink>
				        </NavItem>
			        </Nav>
				        <div className="title">
			            <h1>OpenAlias Tester</h1>
				        </div>
				        <div className="title-spacer"> </div>
			        </div>
		        </Col>
	        </Row>
	        <TabContent activeTab={this.state.activeTab}>
		        <TabPane tabId="1">
			        <Row>
				        <Col sm="12">
					        <Form className="oa-form">
						        <Row>
							        <Col sm="12">
								        <AddressInput />
							        </Col>
						        </Row>
					        </Form>
					        <Row>
						        <Col sm="12">
							        <AddressTestResults/>
						        </Col>
					        </Row>
				        </Col>
			        </Row>
		        </TabPane>
		        <TabPane tabId="2">
			        <Row>
				        <Col sm="12">
					        <TextSigner />
				        </Col>
			        </Row>
		        </TabPane>
		        <TabPane tabId="3">
			        <Row>
				        <Col sm="12">
					        <TextCrc32 />
				        </Col>
			        </Row>
		        </TabPane>
	        </TabContent>
        </Container>
      </div>
    );
  }
}

export default App;
