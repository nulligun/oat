import React, { Component } from 'react';
import AddressInput from './components/AddressInput';
import AddressTestResults from './components/AddressTestResults';
import TextCrc32 from './components/TextCrc32';
import TextSigner from './components/TextSigner';
import './App.css';

let {EventEmitter} = require('fbemitter');
window.ee = new EventEmitter();

class App extends Component {
	constructor(props)
	{
		super(props);
		let currentVersion = 7;
		let storageVersion = JSON.parse(localStorage.getItem('version'));
		if ((storageVersion === null) || (storageVersion < currentVersion)) {
			localStorage.setItem('version', JSON.stringify(currentVersion));
			localStorage.setItem('address', '');
		}
	}

  render() {
    return (
      <div className="App">
        <header className="App-header">
	        <h1>OpenAlias Tester</h1>
        </header>
        <AddressInput />
	      <AddressTestResults />
	      <TextSigner />
	      <TextCrc32 />
      </div>
    );
  }
}

export default App;
