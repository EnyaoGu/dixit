import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DIXIT from './components/dixit/dixit.js';

window.addEventListener(
	'load', 
	() => ReactDOM.render(<DIXIT />, document.getElementById('root')),
	{ once: true }
);
